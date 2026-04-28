"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, ArrowLeft, Calendar, Users, Eye } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getTodayString } from "@/lib/utils"

interface Page {
  id: string
  name: string
  username: string
}

interface AddDataClientProps {
  page: Page
}

export function AddDataClient({ page }: AddDataClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    date: getTodayString(),
    followers: "",
    views: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch(`/api/pages/${page?.id ?? ''}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error ?? "Erro ao adicionar dados")
      } else {
        setSuccess("Dados adicionados com sucesso!")
        setFormData({
          date: getTodayString(),
          followers: "",
          views: ""
        })
        setTimeout(() => {
          router.push(`/pages/${page?.id ?? ''}`)
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Adicionar Dados</h1>
          <p className="text-muted-foreground">{page?.name ?? ''} (@{page?.username ?? ''})</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Dados Diários</CardTitle>
                <CardDescription>Insira os dados de seguidores e visualizações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    max={getTodayString()}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Data de referência para os dados
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followers">Número de Seguidores *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="followers"
                    type="number"
                    placeholder="1000"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                    className="pl-10"
                    min="0"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Total de seguidores nesta data
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="views">Número de Visualizações *</Label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="views"
                    type="number"
                    placeholder="5000"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                    className="pl-10"
                    min="0"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Total de visualizações nesta data
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/pages" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Dados"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Se já existirem dados para esta data, eles serão atualizados com os novos valores.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
