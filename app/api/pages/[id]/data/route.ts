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

    // Verify page belongs to user
    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId
      }
    })

    if (!page) {
      return NextResponse.json({ error: "P\u00e1gina n\u00e3o encontrada" }, { status: 404 })
    }

    const data = await prisma.dailyData.findMany({
      where: { pageId },
      orderBy: { date: "asc" }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching daily data:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { date, followers, views } = body

    // Verify page belongs to user
    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId
      }
    })

    if (!page) {
      return NextResponse.json({ error: "P\u00e1gina n\u00e3o encontrada" }, { status: 404 })
    }

    if (!date || followers === undefined || views === undefined) {
      return NextResponse.json(
        { error: "Data, seguidores e visualiza\u00e7\u00f5es s\u00e3o obrigat\u00f3rios" },
        { status: 400 }
      )
    }

    // Check if data already exists for this date
    const existingData = await prisma.dailyData.findUnique({
      where: {
        pageId_date: {
          pageId,
          date: new Date(date)
        }
      }
    })

    let dailyData

    if (existingData) {
      // Update existing data
      dailyData = await prisma.dailyData.update({
        where: { id: existingData.id },
        data: {
          followers: parseInt(followers),
          views: parseInt(views)
        }
      })
    } else {
      // Create new data
      dailyData = await prisma.dailyData.create({
        data: {
          pageId,
          date: new Date(date),
          followers: parseInt(followers),
          views: parseInt(views)
        }
      })
    }

    return NextResponse.json({ data: dailyData }, { status: 201 })
  } catch (error) {
    console.error("Error creating daily data:", error)
    return NextResponse.json(
      { error: "Erro ao criar dados di\u00e1rios" },
      { status: 500 }
    )
  }
}