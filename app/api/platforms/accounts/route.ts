import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/platforms/accounts
// Lists all connected platform accounts for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const connections = await prisma.platformConnection.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        platformUserId: true,
        platformUsername: true,
        platformName: true,
        profileImage: true,
        tokenExpiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Parse metadata and check token expiration
    const enrichedConnections = connections.map((conn: typeof connections[number]) => {
      let parsedMetadata = null
      try {
        if (conn.metadata) {
          parsedMetadata = JSON.parse(conn.metadata)
        }
      } catch {
        parsedMetadata = null
      }

      const isExpired = conn.tokenExpiresAt ? new Date() > conn.tokenExpiresAt : false

      return {
        ...conn,
        metadata: parsedMetadata,
        isExpired,
      }
    })

    return NextResponse.json({
      success: true,
      connections: enrichedConnections,
    })
  } catch (error) {
    console.error("Error fetching platform accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch platform accounts" },
      { status: 500 }
    )
  }
}
