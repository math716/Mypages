import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { NewPageClient } from "./_components/new-page-client"

export const dynamic = "force-dynamic"

export default async function NewPagePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <NewPageClient />
      </main>
    </div>
  )
}