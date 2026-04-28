"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, Users } from "lucide-react"
import { motion } from "framer-motion"

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data?.error ?? "Erro ao criar conta")
        } else {
          // Auto login after signup
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          })

          if (result?.error) {
            setError(result.error)
          } else {
            router.push("/dashboard")
            router.refresh()
          }
        }
      }
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="MyPages Logo" className="h-14 w-14 rounded-xl object-cover shadow-lg" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MyPages
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitore e analise o crescimento das suas páginas de redes sociais com dashboards profissionais
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Acompanhe o Crescimento</h3>
                  <p className="text-muted-foreground">
                    Registre seguidores e visualizações diariamente e veja gráficos de evolução
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-pink-100">
                  <BarChart3 className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Dashboards Profissionais</h3>
                  <p className="text-muted-foreground">
                    Visualize seus dados com gráficos interativos no estilo Power BI
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Múltiplas Páginas</h3>
                  <p className="text-muted-foreground">
                    Gerencie e compare o desempenho de várias páginas simultaneamente
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
                <CardDescription>
                  {isLogin
                    ? "Entre com suas credenciais para acessar"
                    : "Crie sua conta para começar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          placeholder="João"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          placeholder="Silva"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading}
                  >
                    {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setError("")
                      }}
                      className="text-purple-600 hover:underline"
                    >
                      {isLogin ? "Não tem uma conta? Crie uma" : "Já tem uma conta? Entrar"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            Ao usar o MyPages, você concorda com nossos{" "}
            <a href="/terms-of-use" className="text-purple-600 hover:underline">
              Termos de Uso
            </a>{" "}
            e nossa{" "}
            <a href="/privacy-policy" className="text-purple-600 hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
