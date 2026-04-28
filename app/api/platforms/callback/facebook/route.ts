import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/platforms/callback/facebook
// Recebe o callback do Instagram Login (nova API)
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
      console.error("Instagram OAuth error:", error)
      return NextResponse.redirect(new URL("/pages?error=oauth_denied", request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/pages?error=no_code", request.url))
    }

    const storedState = request.cookies.get("fb_oauth_state")?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/pages?error=invalid_state", request.url))
    }

    const appId = process.env.FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET
    if (!appId || !appSecret) {
      return NextResponse.redirect(new URL("/pages?error=config_missing", request.url))
    }

    const redirectUri = "https://mypages-q242-azure.vercel.app/api/platforms/callback/facebook"

    // Passo 1: Troca code por short-lived token (api.instagram.com)
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
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

    if (tokenData.error_type || tokenData.error) {
      const errMsg = tokenData.error_message || tokenData.error?.message || JSON.stringify(tokenData)
      console.error("Instagram token exchange error:", tokenData)
      console.error("redirect_uri used:", redirectUri)
      console.error("appId used:", appId)
      return NextResponse.redirect(new URL(`/pages?error=token_exchange_failed&detail=${encodeURIComponent(errMsg)}`, request.url))
    }

    const shortLivedToken = tokenData.access_token
    const instagramUserId = tokenData.user_id

    // Passo 2: Troca por long-lived token (válido por 60 dias)
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
    )
    const longLivedData = await longLivedRes.json()

    if (longLivedData.error) {
      console.error("Instagram long-lived token error:", longLivedData.error)
      return NextResponse.redirect(new URL("/pages?error=token_exchange_failed", request.url))
    }

    const accessToken = longLivedData.access_token
    const expiresIn = longLivedData.expires_in || 5184000 // 60 dias
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

    // Passo 3: Busca perfil do Instagram
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,followers_count&access_token=${accessToken}`
    )
    const profile = await profileRes.json()

    if (profile.error) {
      console.error("Instagram profile error:", profile.error)
      return NextResponse.redirect(new URL("/pages?error=profile_fetch_failed", request.url))
    }

    // Passo 4: Salva conexão como instagram
    await (prisma as any).platformConnection.upsert({
      where: {
        userId_platform_platformUserId: {
          userId,
          platform: "instagram",
          platformUserId: String(instagramUserId || profile.id),
        },
      },
      update: {
        accessToken,
        tokenExpiresAt,
        platformUsername: profile.username || null,
        platformName: profile.name || profile.username || null,
        scope: "instagram_business_basic,instagram_business_manage_insights",
      },
      create: {
        userId,
        platform: "instagram",
        accessToken,
        tokenExpiresAt,
        platformUserId: String(instagramUserId || profile.id),
        platformUsername: profile.username || null,
        platformName: profile.name || profile.username || null,
        scope: "instagram_business_basic,instagram_business_manage_insights",
      },
    })

    const response = NextResponse.redirect(new URL("/pages?connected=instagram", request.url))
    response.cookies.delete("fb_oauth_state")
    return response
  } catch (error) {
    console.error("Erro no callback Instagram:", error)
    return NextResponse.redirect(new URL("/pages?error=callback_failed", request.url))
  }
}
