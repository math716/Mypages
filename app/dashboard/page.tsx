import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { DashboardClient } from "./_components/dashboard-client"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"


export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  const userId = (session.user as any)?.id

  // Fetch all pages with their daily data
  let pages: any[] = []
  try {
    pages = await prisma.instagramPage.findMany({
      where: { userId },
      include: {
        dailyData: {
          orderBy: { date: "asc" }
        },
        mediaPosts: {
          orderBy: { likes: "desc" },
          take: 10,
        }
      }
    })
  } catch (error) {
    console.error("Dashboard DB connection error:", error)
    pages = []
  }

  // Quick-select groups configuration (per user)
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
        <DashboardClient pages={pages} quickSelectGroups={quickSelectGroups} />
      </main>
    </div>
  )
}
