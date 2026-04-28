import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// GET /api/platforms/connect/facebook
// Redireciona para o Instagram Login (nova API da Meta - instagram_business_basic)
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appId = process.env.FACEBOOK_APP_ID
    if (!appId) {
      return NextResponse.json({ error: "Facebook App ID not configured" }, { status: 500 })
    }

    const state = crypto.randomBytes(32).toString("hex")
    const redirectUri = "https://mypages-q242-azure.vercel.app/api/platforms/callback/facebook"

    const authUrl = new URL("https://www.instagram.com/oauth/authorize")
    authUrl.searchParams.set("client_id", appId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", "instagram_business_basic")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("state", state)

    const response = NextResponse.redirect(authUrl.toString())
    response.cookies.set("fb_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Erro ao iniciar Instagram OAuth:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}
