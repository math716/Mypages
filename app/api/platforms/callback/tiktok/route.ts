import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/platforms/callback/tiktok
// Recebe o callback do TikTok após autorização
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
    const errorDescription = searchParams.get("error_description")

    if (error) {
      console.error("TikTok OAuth error:", error, errorDescription)
      return NextResponse.redirect(new URL("/pages?error=oauth_denied", request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/pages?error=no_code", request.url))
    }

    // Verifica o state (proteção CSRF)
    const storedState = request.cookies.get("tt_oauth_state")?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/pages?error=invalid_state", request.url))
    }

    const codeVerifier = request.cookies.get("tt_code_verifier")?.value
    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/pages?error=missing_verifier", request.url))
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET
    if (!clientKey || !clientSecret) {
      return NextResponse.redirect(new URL("/pages?error=config_missing", request.url))
    }

    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`
    const redirectUri = `${baseUrl}/api/platforms/callback/tiktok`

    // Passo 1: Troca o code pelo access token
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error("TikTok token exchange error:", tokenData.error, tokenData.error_description)
      return NextResponse.redirect(new URL("/pages?error=token_exchange_failed", request.url))
    }

    const { access_token, refresh_token, expires_in, open_id, scope } = tokenData

    // Passo 2: Busca dados do perfil do usuário
    const userInfoRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    const userInfoData = await userInfoRes.json()

    if (userInfoData.error?.code && userInfoData.error.code !== "ok") {
      console.error("TikTok user info error:", userInfoData.error)
      return NextResponse.redirect(new URL("/pages?error=user_info_failed", request.url))
    }

    const user = userInfoData.data?.user || {}
    const tokenExpiresAt = new Date(Date.now() + (expires_in || 86400) * 1000)

    // Passo 3: Salva a conexão no banco de dados
    await prisma.platformConnection.upsert({
      where: {
        userId_platform_platformUserId: {
          userId,
          platform: "tiktok",
          platformUserId: open_id,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        tokenExpiresAt,
        platformUsername: user.display_name || null,
        platformName: user.display_name || null,
        profileImage: user.avatar_url || null,
        scope: scope || "user.info.basic,user.info.stats",
        metadata: JSON.stringify({
          followerCount: user.follower_count || 0,
          followingCount: user.following_count || 0,
          likesCount: user.likes_count || 0,
          videoCount: user.video_count || 0,
          unionId: user.union_id || null,
        }),
      },
      create: {
        userId,
        platform: "tiktok",
        accessToken: access_token,
        refreshToken: refresh_token || null,
        tokenExpiresAt,
        platformUserId: open_id,
        platformUsername: user.display_name || null,
        platformName: user.display_name || null,
        profileImage: user.avatar_url || null,
        scope: scope || "user.info.basic,user.info.stats",
        metadata: JSON.stringify({
          followerCount: user.follower_count || 0,
          followingCount: user.following_count || 0,
          likesCount: user.likes_count || 0,
          videoCount: user.video_count || 0,
          unionId: user.union_id || null,
        }),
      },
    })

    // Limpa os cookies de estado e redireciona com sucesso
    const response = NextResponse.redirect(new URL("/pages?connected=tiktok", request.url))
    response.cookies.delete("tt_oauth_state")
    response.cookies.delete("tt_code_verifier")
    return response
  } catch (error) {
    console.error("Erro no callback TikTok:", error)
    return NextResponse.redirect(new URL("/pages?error=callback_failed", request.url))
  }
}
