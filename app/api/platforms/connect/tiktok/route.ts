import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Gera code_verifier e code_challenge para PKCE (obrigatório no TikTok v2)
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url")
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url")
  return { verifier, challenge }
}

// GET /api/platforms/connect/tiktok
// Redireciona o usuário para a tela de login do TikTok (OAuth 2.0 com PKCE)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    if (!clientKey) {
      return NextResponse.json({ error: "TikTok Client Key não configurado" }, { status: 500 })
    }

    const state = crypto.randomBytes(32).toString("hex")
    const { verifier, challenge } = generatePKCE()

    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`
    const redirectUri = `${baseUrl}/api/platforms/callback/tiktok`

    // Scopes: perfil básico + estatísticas de seguidores
    const scopes = "user.info.basic,user.info.stats"

    const tiktokAuthUrl = new URL("https://www.tiktok.com/v2/auth/authorize/")
    tiktokAuthUrl.searchParams.set("client_key", clientKey)
    tiktokAuthUrl.searchParams.set("scope", scopes)
    tiktokAuthUrl.searchParams.set("redirect_uri", redirectUri)
    tiktokAuthUrl.searchParams.set("state", state)
    tiktokAuthUrl.searchParams.set("response_type", "code")
    tiktokAuthUrl.searchParams.set("code_challenge", challenge)
    tiktokAuthUrl.searchParams.set("code_challenge_method", "S256")

    const response = NextResponse.redirect(tiktokAuthUrl.toString())

    // Guarda state e verifier em cookies para validação no callback
    response.cookies.set("tt_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    })
    response.cookies.set("tt_code_verifier", verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Erro ao iniciar OAuth TikTok:", error)
    return NextResponse.json({ error: "Falha ao iniciar OAuth" }, { status: 500 })
  }
}
