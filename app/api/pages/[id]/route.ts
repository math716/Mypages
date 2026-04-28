import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const pageId = params?.id

    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId
      },
      include: {
        dailyData: {
          orderBy: { date: "asc" }
        }
      }
    })

    if (!page) {
      return NextResponse.json({ error: "P\u00e1gina n\u00e3o encontrada" }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json(
      { error: "Erro ao buscar p\u00e1gina" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const pageId = params?.id
    const body = await request.json()
    const { name, username, coverImage, collaborator, platform } = body

    const existingPage = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId
      }
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 })
    }

    // Validate platform if provided
    const validPlatforms = ['instagram', 'kawaii', 'tiktok']
    const updatedPlatform = platform && validPlatforms.includes(platform) ? platform : existingPage.platform

    const page = await prisma.instagramPage.update({
      where: { id: pageId },
      data: {
        name: name || existingPage.name,
        username: username || existingPage.username,
        coverImage: coverImage !== undefined ? coverImage : existingPage.coverImage,
        collaborator: collaborator !== undefined ? collaborator : existingPage.collaborator,
        platform: updatedPlatform
      }
    })

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar p\u00e1gina" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const pageId = params?.id

    const existingPage = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId
      }
    })

    if (!existingPage) {
      return NextResponse.json({ error: "P\u00e1gina n\u00e3o encontrada" }, { status: 404 })
    }

    await prisma.instagramPage.delete({
      where: { id: pageId }
    })

    return NextResponse.json({ message: "P\u00e1gina deletada com sucesso" })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json(
      { error: "Erro ao deletar p\u00e1gina" },
      { status: 500 }
    )
  }
}