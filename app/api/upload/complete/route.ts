import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getFileUrl } from "@/lib/s3"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cloud_storage_path, isPublic = true } = await request.json()

    if (!cloud_storage_path) {
      return NextResponse.json(
        { error: "cloud_storage_path is required" },
        { status: 400 }
      )
    }

    const fileUrl = await getFileUrl(cloud_storage_path, isPublic)

    return NextResponse.json({
      success: true,
      fileUrl,
      cloud_storage_path,
    })
  } catch (error) {
    console.error("Error completing upload:", error)
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    )
  }
}
