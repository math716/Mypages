import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { PagesClient } from "./_components/pages-client"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function PagesPage({
  searchParams,
}: {
  searchParams: { connected?: string; platform?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  const userId = (session.user as any)?.id
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // Primeiro e último dia do mês atual
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59)

  // Buscar páginas com dados e metas em uma única query
  const pagesData = await prisma.instagramPage.findMany({
    where: { userId },
    include: {
      dailyData: {
        orderBy: { date: "desc" },
        take: 1
      },
      monthlyGoals: {
        where: {
          month: currentMonth,
          year: currentYear
        }
      },
      _count: {
        select: { dailyData: true }
      }
    }
  })

  // Buscar todos os dados mensais de uma vez só (otimização)
  const pageIds = pagesData.map(p => p.id)
  const allMonthlyData = await prisma.dailyData.findMany({
    where: {
      pageId: { in: pageIds },
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth
      }
    },
    orderBy: { date: "asc" }
  })

  // Agrupar dados mensais por página
  const monthlyDataByPage: Record<string, typeof allMonthlyData> = {}
  allMonthlyData.forEach(data => {
    if (!monthlyDataByPage[data.pageId]) {
      monthlyDataByPage[data.pageId] = []
    }
    monthlyDataByPage[data.pageId].push(data)
  })

  // Adicionar visualizações atuais para cada página
  const pagesWithViews = pagesData.map(page => {
    // Visualizações atuais = último registro
    const currentViews = page.dailyData[0]?.views ?? 0
    
    return {
      ...page,
      currentViews,
      currentGoal: page.monthlyGoals[0]?.viewsGoal ?? null
    }
  })

  // Ordenar páginas por número de seguidores (maior para menor)
  const sortedPages = [...pagesWithViews].sort((a, b) => {
    const followersA = a.dailyData[0]?.followers ?? 0
    const followersB = b.dailyData[0]?.followers ?? 0
    return followersB - followersA
  })

  // Serializar para garantir a ordem correta no cliente
  const pages = JSON.parse(JSON.stringify(sortedPages))

  // Configuração de grupos de páginas para seleção rápida (por usuário)
  const quickSelectGroups = session.user?.email === 'paginas@gmail.com' ? [
    {
      name: 'Magno',
      usernames: ['tarcisaodaconstrucao', 'senadoramichellebolsonaro', 'obolsonarotemrazao', 'presidentemichellebolsonaro', 'apaixonadospelobolsonaro', 'eusoubolsonarista', 'apoiadoresdojair']
    },
    {
      name: 'Victória',
      usernames: ['fechadoscombolsonaroo', 'fechadoscomtarcisio', 'capitaotarcisiodefreitas', 'apoiadoresdotarcisio', 'otarcisiodefreitas', 'governadortarcisio', 'mulherescombolsonaro']
    },
    {
      name: 'Leticia',
      usernames: ['tarcisiospgovernador', 'fechadoscombolsonaro2.0']
    }
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <PagesClient
          pages={pages}
          currentMonth={currentMonth}
          currentYear={currentYear}
          quickSelectGroups={quickSelectGroups}
          connectedPlatform={searchParams.connected}
          initialPlatform={searchParams.platform}
        />
      </main>
    </div>
  )
}