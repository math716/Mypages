import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/platforms/callback/threads
// Recebe o callback do Threads Login
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.redirect(new URL("/pages?error=unauthorized", request.url))
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("Threads OAuth error:", error)
      return NextResponse.redirect(new URL("/pages?error=oauth_denied", request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/pages?error=no_code", request.url))
    }

    const storedState = request.cookies.get("threads_oauth_state")?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/pages?error=invalid_state", request.url))
    }

    const appId = process.env.THREADS_APP_ID
    const appSecret = process.env.THREADS_APP_SECRET
    if (!appId || !appSecret) {
      return NextResponse.redirect(new URL("/pages?error=config_missing", request.url))
    }

    const redirectUri = "https://mypages-q242-azure.vercel.app/api/platforms/callback/threads"

    // Passo 1: Troca code por short-lived token
    const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      const errMsg = tokenData.error_message || tokenData.error?.message || JSON.stringify(tokenData)
      console.error("Threads token exchange error:", tokenData)
      return NextResponse.redirect(new URL(`/pages?error=token_exchange_failed&detail=${encodeURIComponent(errMsg)}`, request.url))
    }

    const shortLivedToken = tokenData.access_token
    const threadsUserId = tokenData.user_id

    // Passo 2: Troca por long-lived token (60 dias)
    const longLivedRes = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
    )
    const longLivedData = await longLivedRes.json()

    if (longLivedData.error) {
      console.error("Threads long-lived token error:", longLivedData.error)
      return NextResponse.redirect(new URL("/pages?error=token_exchange_failed", request.url))
    }

    const accessToken = longLivedData.access_token
    const expiresIn = longLivedData.expires_in || 5184000
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

    // Passo 3: Busca perfil do Threads
    const profileRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
    )
    const profile = await profileRes.json()

    if (profile.error) {
      console.error("Threads profile error:", profile.error)
      return NextResponse.redirect(new URL("/pages?error=profile_fetch_failed", request.url))
    }

    // Passo 4: Salva conexão como threads
    await (prisma as any).platformConnection.upsert({
      where: {
        userId_platform_platformUserId: {
          userId,
          platform: "threads",
          platformUserId: String(threadsUserId || profile.id),
        },
      },
      update: {
        accessToken,
        tokenExpiresAt,
        platformUsername: profile.username || null,
        platformName: profile.name || profile.username || null,
        profileImage: profile.threads_profile_picture_url || null,
        scope: "threads_basic",
      },
      create: {
        userId,
        platform: "threads",
        accessToken,
        tokenExpiresAt,
        platformUserId: String(threadsUserId || profile.id),
        platformUsername: profile.username || null,
        platformName: profile.name || profile.username || null,
        profileImage: profile.threads_profile_picture_url || null,
        scope: "threads_basic",
      },
    })

    // Passo 5: Sincroniza dados do Threads diretamente no servidor
    try {
      const threadsData = await fetchThreadsData(accessToken)
      if (threadsData) {
        await syncThreadsPageData(userId, threadsData)
      }
    } catch (syncErr) {
      console.error("Threads sync error (non-fatal):", syncErr)
    }

    const response = NextResponse.redirect(new URL("/pages?platform=threads", request.url))
    response.cookies.delete("threads_oauth_state")
    return response
  } catch (error) {
    console.error("Erro no callback Threads:", error)
    return NextResponse.redirect(new URL("/pages?error=callback_failed", request.url))
  }
}

async function fetchThreadsData(accessToken: string) {
  // Fetch basic profile (always available)
  const res = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
  )
  const data = await res.json()
  if (data.error) {
    console.error("Threads API error:", data.error)
    return null
  }

  // Try followers_count separately (requires threads_basic approval)
  let followers = 0
  try {
    const followersRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=followers_count&access_token=${accessToken}`
    )
    const followersData = await followersRes.json()
    if (!followersData.error) {
      followers = followersData.followers_count || 0
    }
  } catch {}

  return {
    platform: "threads",
    userId: data.id,
    username: data.username,
    name: data.name || data.username,
    profilePicture: data.threads_profile_picture_url || null,
    followers,
    impressions: 0,
  }
}

async function syncThreadsPageData(userId: string, data: any) {
  const existingPage = await prisma.instagramPage.findFirst({
    where: { userId, username: data.username, platform: "threads" },
  })

  let pageId: string

  if (existingPage) {
    await prisma.instagramPage.update({
      where: { id: existingPage.id },
      data: {
        name: data.name,
        coverImage: data.profilePicture || existingPage.coverImage,
      },
    })
    pageId = existingPage.id
  } else {
    const newPage = await prisma.instagramPage.create({
      data: {
        userId,
        name: data.name,
        username: data.username,
        coverImage: data.profilePicture,
        platform: "threads",
      },
    })
    pageId = newPage.id
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.dailyData.upsert({
    where: { pageId_date: { pageId, date: today } },
    update: { followers: data.followers, views: data.impressions },
    create: { pageId, date: today, followers: data.followers, views: data.impressions },
  })
}
