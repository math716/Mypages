import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// DELETE /api/platforms/disconnect
// Disconnects a platform connection
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { connectionId } = await request.json()

    if (!connectionId) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 })
    }

    // Verify the connection belongs to the user
    const connection = await (prisma as any).platformConnection.findFirst({
      where: {
        id: connectionId,
        userId,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // Delete the connection
    await (prisma as any).platformConnection.delete({
      where: { id: connectionId },
    })

    return NextResponse.json({
      success: true,
      message: "Platform disconnected successfully",
    })
  } catch (error) {
    console.error("Error disconnecting platform:", error)
    return NextResponse.json(
      { error: "Failed to disconnect platform" },
      { status: 500 }
    )
  }
}
