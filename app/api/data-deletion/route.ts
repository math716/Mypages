import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/db"

function parseSignedRequest(signedRequest: string, appSecret: string) {
  const parts = signedRequest.split(".")
  if (parts.length !== 2) throw new Error("Invalid signed_request format")

  const [encodedSig, payload] = parts

  // Normalize base64url to base64
  const normalize = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/")

  const sig = Buffer.from(normalize(encodedSig), "base64")
  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest()

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error("Invalid signature")
  }

  const decoded = Buffer.from(normalize(payload), "base64").toString("utf8")
  return JSON.parse(decoded)
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let signedRequest: string | null = null

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text()
      const params = new URLSearchParams(text)
      signedRequest = params.get("signed_request")
    } else {
      const formData = await request.formData()
      signedRequest = formData.get("signed_request") as string | null
    }

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 })
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET
    if (!appSecret) {
      console.error("FACEBOOK_APP_SECRET not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const data = parseSignedRequest(signedRequest, appSecret)
    const facebookUserId: string = data.user_id

    if (!facebookUserId) {
      return NextResponse.json({ error: "Missing user_id in payload" }, { status: 400 })
    }

    // Find all platform connections for this Facebook user
    const connections = await prisma.platformConnection.findMany({
      where: {
        platformUserId: facebookUserId,
        platform: { in: ["facebook", "instagram"] },
      },
      select: { userId: true },
    })

    const userIds = [...new Set(connections.map((c) => c.userId))]

    for (const userId of userIds) {
      // Check if user has a password-based account (keep account, just remove connections)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (user?.password) {
        // User has a local account — only remove platform connections
        await prisma.platformConnection.deleteMany({
          where: {
            userId,
            platformUserId: facebookUserId,
            platform: { in: ["facebook", "instagram"] },
          },
        })
      } else {
        // OAuth-only user — delete entire account (cascades to pages, data, etc.)
        await prisma.user.delete({ where: { id: userId } })
      }
    }

    const confirmationCode = crypto
      .createHash("sha256")
      .update(`${facebookUserId}-${Date.now()}`)
      .digest("hex")
      .substring(0, 16)

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    return NextResponse.json({
      url: `${baseUrl}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch (error) {
    console.error("Data deletion callback error:", error)
    return NextResponse.json({ error: "Processing error" }, { status: 400 })
  }
}
