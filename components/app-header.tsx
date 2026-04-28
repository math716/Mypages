"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Instagram, Plus, LogOut, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pages", label: "Minhas Páginas", icon: Instagram },
    { href: "/pages/new", label: "Adicionar Página", icon: Plus },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="MyPages Logo" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MyPages
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems?.map((item) => {
              const Icon = item?.icon
              const isActive = pathname === item?.href
              return (
                <Link key={item?.href ?? ''} href={item?.href ?? '#'}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "gap-2",
                      isActive && "bg-gradient-to-r from-purple-600 to-pink-600"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item?.label ?? ''}
                  </Button>
                </Link>
              )
            })}
            <Button variant="outline" className="gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t pb-4">
            <div className="flex flex-col gap-2 p-4">
              {navItems?.map((item) => {
                const Icon = item?.icon
                const isActive = pathname === item?.href
                return (
                  <Link key={item?.href ?? ''} href={item?.href ?? '#'} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2",
                        isActive && "bg-gradient-to-r from-purple-600 to-pink-600"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item?.label ?? ''}
                    </Button>
                  </Link>
                )
              })}
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}