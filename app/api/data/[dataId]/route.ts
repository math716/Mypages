import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: { dataId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const dataId = params?.dataId
    const body = await request.json()
    const { date, followers, views } = body

    // Verify data belongs to user's page
    const existingData = await prisma.dailyData.findUnique({
      where: { id: dataId },
      include: { page: true }
    })

    if (!existingData || existingData.page.userId !== userId) {
      return NextResponse.json({ error: "Dados não encontrados" }, { status: 404 })
    }

    const updatedData = await prisma.dailyData.update({
      where: { id: dataId },
      data: {
        date: date ? new Date(date) : existingData.date,
        followers: followers !== undefined ? parseInt(followers) : existingData.followers,
        views: views !== undefined ? parseInt(views) : existingData.views
      }
    })

    return NextResponse.json({ data: updatedData })
  } catch (error) {
    console.error("Error updating daily data:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar dados" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { dataId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    const dataId = params?.dataId

    // Verify data belongs to user's page
    const existingData = await prisma.dailyData.findUnique({
      where: { id: dataId },
      include: { page: true }
    })

    if (!existingData || existingData.page.userId !== userId) {
      return NextResponse.json({ error: "Dados não encontrados" }, { status: 404 })
    }

    await prisma.dailyData.delete({
      where: { id: dataId }
    })

    return NextResponse.json({ message: "Dados excluídos com sucesso" })
  } catch (error) {
    console.error("Error deleting daily data:", error)
    return NextResponse.json(
      { error: "Erro ao excluir dados" },
      { status: 500 }
    )
  }
}
