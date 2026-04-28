import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id

    const pages = await prisma.instagramPage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { dailyData: true }
        }
      }
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json(
      { error: "Erro ao buscar p\u00e1ginas" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const body = await request.json()
    const { name, username, coverImage, collaborator, platform } = body

    if (!name || !username) {
      return NextResponse.json(
        { error: "Nome e username são obrigatórios" },
        { status: 400 }
      )
    }

    // Validate platform
    const validPlatforms = ['instagram', 'kawaii', 'tiktok', 'facebook', 'x']
    const selectedPlatform = platform && validPlatforms.includes(platform) ? platform : 'instagram'

    const page = await prisma.instagramPage.create({
      data: {
        name,
        username,
        coverImage: coverImage || null,
        collaborator: collaborator || null,
        platform: selectedPlatform,
        userId
      }
    })

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error("Error creating page:", error)
    return NextResponse.json(
      { error: "Erro ao criar p\u00e1gina" },
      { status: 500 }
    )
  }
}