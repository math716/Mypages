import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// GET /api/platforms/connect/threads
// Redireciona para o Threads Login (Meta - threads_basic)
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appId = process.env.THREADS_APP_ID
    if (!appId) {
      return NextResponse.json({ error: "Threads App ID não configurado" }, { status: 500 })
    }

    const state = crypto.randomBytes(32).toString("hex")
    const redirectUri = "https://mypages-q242-azure.vercel.app/api/platforms/callback/threads"

    const authUrl = new URL("https://www.threads.net/oauth/authorize")
    authUrl.searchParams.set("client_id", appId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", "threads_basic,threads_manage_insights")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("state", state)

    const response = NextResponse.redirect(authUrl.toString())
    response.cookies.set("threads_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Erro ao iniciar Threads OAuth:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}
