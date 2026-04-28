import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AddDataClient } from "./_components/add-data-client"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AddDataPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  const userId = (session.user as any)?.id

  const page = await prisma.instagramPage.findFirst({
    where: {
      id: params.id,
      userId
    }
  })

  if (!page) {
    redirect("/pages")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <AddDataClient page={page} />
      </main>
    </div>
  )
}