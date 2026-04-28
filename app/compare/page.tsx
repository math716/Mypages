import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { CompareClient } from "./_components/compare-client"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function ComparePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  const userId = (session.user as any)?.id

  const pages = await prisma.instagramPage.findMany({
    where: { userId },
    include: {
      dailyData: {
        orderBy: { date: "asc" }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <CompareClient pages={pages} />
      </main>
    </div>
  )
}