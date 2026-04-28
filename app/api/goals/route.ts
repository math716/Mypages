import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// GET - Buscar metas do mês atual
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

    const goals = await prisma.monthlyGoal.findMany({
      where: {
        page: {
          userId: user.id
        },
        month,
        year
      },
      include: {
        page: true
      }
    })

    return NextResponse.json({ success: true, goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Erro ao buscar metas" }, { status: 500 })
  }
}

// POST - Criar ou atualizar meta
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const { pageId, month, year, viewsGoal } = await request.json()

    if (!pageId || !month || !year || viewsGoal === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se a página pertence ao usuário
    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId: user.id
      }
    })

    if (!page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 })
    }

    // Criar ou atualizar a meta
    const goal = await prisma.monthlyGoal.upsert({
      where: {
        pageId_month_year: {
          pageId,
          month,
          year
        }
      },
      update: {
        viewsGoal
      },
      create: {
        pageId,
        month,
        year,
        viewsGoal
      }
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error("Error saving goal:", error)
    return NextResponse.json({ error: "Erro ao salvar meta" }, { status: 500 })
  }
}
