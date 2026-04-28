"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, Unlink, RefreshCw, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PlatformAccount {
  id: string
  platform: string
  platformUserId: string
  platformUsername: string | null
  platformName: string | null
  profileImage: string | null
  tokenExpiresAt: string | null
  metadata: any
  isExpired: boolean
  createdAt: string
}

interface ConnectPlatformModalProps {
  open: boolean
  onClose: () => void
  platform: string
}

// Facebook SVG Icon
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.018 4.388 11.007 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.08 24 18.091 24 12.073z"/>
  </svg>
)

// Instagram SVG Icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

// TikTok SVG Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

// Threads SVG Icon
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 192 192" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.347-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 6.981 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96c.223 28.685 6.88 51.515 19.788 67.92 14.504 18.437 36.094 27.884 64.172 28.08h.113c24.986-.171 42.interchange-11.619 54.167-23.565 18.337-18.324 17.756-41.146 11.733-55.208-4.24-9.886-12.208-17.98-21.437-23.239Zm-30.96 43.348c-5.461 6.148-13.501 9.37-23.882 9.579-10.735.207-19.763-3.519-23.613-9.581-2.332-3.69-3.363-8.025-2.908-12.382.803-7.742 6.574-13.254 16.186-15.499 3.928-.924 8.202-1.38 12.744-1.363 3.928.014 7.664.326 11.158.92 1.085.188 2.137.398 3.155.628-.916 13.004-4.789 21.597-12.84 27.698Z"/>
  </svg>
)

export function ConnectPlatformModal({ open, onClose, platform }: ConnectPlatformModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<PlatformAccount[]>([])
  const [fetchingAccounts, setFetchingAccounts] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch connected accounts when modal opens
  useEffect(() => {
    if (open) {
      fetchAccounts()
    }
  }, [open])

  const fetchAccounts = async () => {
    setFetchingAccounts(true)
    setError("")
    try {
      const res = await fetch("/api/platforms/accounts")
      const data = await res.json()
      if (data.success) {
        // Filter accounts by relevant platform
        const relevantAccounts = data.connections.filter((conn: PlatformAccount) => {
          if (platform === "instagram") {
            return conn.platform === "instagram" || conn.platform === "facebook"
          }
          if (platform === "facebook") {
            return conn.platform === "facebook"
          }
          return conn.platform === platform
        })
        setAccounts(relevantAccounts)
      }
    } catch (err) {
      console.error("Error fetching accounts:", err)
      setError("Error loading connected accounts")
    } finally {
      setFetchingAccounts(false)
    }
  }

  const handleConnect = () => {
    setLoading(true)
    if (platform === "tiktok") {
      window.location.href = "/api/platforms/connect/tiktok"
    } else if (platform === "threads") {
      window.location.href = "/api/platforms/connect/threads"
    } else {
      window.location.href = "/api/platforms/connect/facebook"
    }
  }

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId)
    setError("")
    setSuccessMessage("")
    try {
      const res = await fetch("/api/platforms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage(`${data.synced} conta(s) sincronizada(s) com sucesso!`)
        router.refresh()
      } else {
        setError(data.error || "Erro ao sincronizar dados")
      }
    } catch (err) {
      console.error("Error syncing:", err)
      setError("Erro ao sincronizar dados")
    } finally {
      setSyncing(null)
    }
  }

  const handleDisconnect = async (connectionId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja desconectar "${name}"? Os dados importados anteriormente serão mantidos.`)) {
      return
    }

    setDisconnecting(connectionId)
    setError("")
    try {
      const res = await fetch("/api/platforms/disconnect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      })
      const data = await res.json()
      if (data.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== connectionId))
        setSuccessMessage("Plataforma desconectada com sucesso")
      } else {
        setError(data.error || "Erro ao desconectar")
      }
    } catch (err) {
      console.error("Error disconnecting:", err)
      setError("Erro ao desconectar plataforma")
    } finally {
      setDisconnecting(null)
    }
  }

  const getPlatformLabel = () => {
    if (platform === "instagram") return "Instagram"
    if (platform === "facebook") return "Facebook"
    if (platform === "tiktok") return "TikTok"
    if (platform === "threads") return "Threads"
    return platform
  }

  const getPlatformDescription = () => {
    if (platform === "instagram") {
      return "Conecte sua conta do Instagram para importar seguidores e métricas via Instagram Login."
    }
    if (platform === "facebook") {
      return "Conecte sua conta do Facebook para acessar automaticamente suas páginas via Meta Graph API."
    }
    if (platform === "tiktok") {
      return "Conecte sua conta do TikTok para importar seguidores e curtidas via TikTok Login Kit."
    }
    if (platform === "threads") {
      return "Conecte sua conta do Threads para importar seguidores e métricas via Threads API."
    }
    return `Conecte sua conta do ${getPlatformLabel()}`
  }

  const hasConnections = accounts.length > 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                platform === "tiktok" || platform === "threads"
                  ? "bg-black"
                  : platform === "facebook"
                  ? "bg-[#1877F2]"
                  : ""
              }`}
              style={platform === "instagram" ? { background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' } : undefined}
            >
              {platform === "instagram" ? (
                <InstagramIcon className="h-5 w-5 text-white" />
              ) : platform === "tiktok" ? (
                <TikTokIcon className="h-5 w-5 text-white" />
              ) : platform === "threads" ? (
                <ThreadsIcon className="h-5 w-5 text-white" />
              ) : (
                <FacebookIcon className="h-5 w-5 text-white" />
              )}
            </div>
            Conectar {getPlatformLabel()}
          </DialogTitle>
          <DialogDescription>
            {getPlatformDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Success message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {successMessage}
            </motion.div>
          )}

          {/* Loading accounts */}
          {fetchingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Carregando contas...</span>
            </div>
          ) : (
            <>
              {/* Connected accounts */}
              {hasConnections && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Contas Conectadas</h3>
                  <AnimatePresence>
                    {accounts.map((account) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Card className={`border ${account.isExpired ? "border-red-300 bg-red-50" : account.platform === "instagram" ? "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50" : account.platform === "threads" ? "border-gray-300 bg-gray-50" : "border-green-300 bg-green-50"}`}>
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {account.profileImage ? (
                                  <img
                                    src={account.profileImage}
                                    alt={account.platformName || ""}
                                    className={`h-10 w-10 rounded-full object-cover border-2 shadow ${account.platform === "instagram" ? "border-purple-300" : "border-white"}`}
                                  />
                                ) : (
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${account.platform === "instagram" ? "bg-gradient-to-br from-purple-500 to-pink-500" : account.platform === "threads" ? "bg-black" : "bg-gray-200"}`}>
                                    {account.platform === "instagram" ? (
                                      <InstagramIcon className="h-5 w-5 text-white" />
                                    ) : account.platform === "tiktok" ? (
                                      <TikTokIcon className="h-5 w-5 text-gray-500" />
                                    ) : account.platform === "threads" ? (
                                      <ThreadsIcon className="h-5 w-5 text-white" />
                                    ) : (
                                      <FacebookIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-sm">
                                    {account.platformName || account.platformUsername || "Conta conectada"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs capitalize font-medium ${account.platform === "instagram" ? "text-purple-600" : account.platform === "threads" ? "text-gray-800" : "text-muted-foreground"}`}>
                                      {account.platform}
                                    </span>
                                    {account.platformUsername && (
                                      <span className="text-xs text-muted-foreground">
                                        @{account.platformUsername}
                                      </span>
                                    )}
                                    {account.isExpired && (
                                      <span className="text-xs text-red-600 font-medium">
                                        Token expirado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Sync button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSync(account.id)}
                                  disabled={syncing === account.id || account.isExpired}
                                  title="Sincronizar dados"
                                  className={account.platform === "instagram" ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50" : account.platform === "threads" ? "text-gray-800 hover:text-black hover:bg-gray-100" : ""}
                                >
                                  {syncing === account.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>

                                {/* Disconnect button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDisconnect(account.id, account.platformName || "account")}
                                  disabled={disconnecting === account.id}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                  title="Desconectar"
                                >
                                  {disconnecting === account.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Unlink className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Show Instagram accounts from metadata */}
                            {account.platform === "facebook" && account.metadata?.pages && (
                              <div className="mt-3 pt-3 border-t border-green-200">
                                <p className="text-xs font-medium text-gray-600 mb-2">Contas Instagram vinculadas:</p>
                                <div className="space-y-1">
                                  {account.metadata.pages
                                    .filter((p: any) => p.instagram_business_account)
                                    .map((p: any) => (
                                      <div key={p.id} className="flex items-center gap-2 text-xs text-gray-600">
                                        <InstagramIcon className="h-3 w-3" />
                                        <span>@{p.instagram_business_account.username}</span>
                                        <span className="text-gray-400">
                                          ({p.instagram_business_account.followers_count?.toLocaleString()} followers)
                                        </span>
                                      </div>
                                    ))}
                                  {account.metadata.pages.filter((p: any) => p.instagram_business_account).length === 0 && (
                                    <p className="text-xs text-gray-400">Nenhuma conta Instagram Business encontrada</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Connect button */}
              <div className="pt-2">
                <Button
                  onClick={handleConnect}
                  disabled={loading}
                  className={`w-full text-white gap-2 ${
                    platform === "tiktok"
                      ? "bg-black hover:bg-gray-900"
                      : platform === "threads"
                      ? "bg-black hover:bg-gray-900"
                      : platform === "instagram"
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                      : "bg-[#1877F2] hover:bg-[#166FE5]"
                  }`}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Redirecionando...
                    </>
                  ) : platform === "tiktok" ? (
                    <>
                      <TikTokIcon className="h-5 w-5" />
                      {hasConnections ? "Conectar outra conta" : "Conectar com TikTok"}
                    </>
                  ) : platform === "threads" ? (
                    <>
                      <ThreadsIcon className="h-5 w-5" />
                      {hasConnections ? "Conectar outra conta" : "Conectar com Threads"}
                    </>
                  ) : platform === "instagram" ? (
                    <>
                      <InstagramIcon className="h-5 w-5" />
                      {hasConnections ? "Conectar outra conta" : "Conectar com Instagram"}
                    </>
                  ) : (
                    <>
                      <FacebookIcon className="h-5 w-5" />
                      {hasConnections ? "Conectar outra conta" : "Conectar com Facebook"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {platform === "tiktok"
                    ? "Você será redirecionado ao TikTok para autorizar o acesso."
                    : platform === "threads"
                    ? "Você será redirecionado ao Threads para entrar e autorizar o acesso."
                    : platform === "instagram"
                    ? "Você será redirecionado ao Instagram para entrar e autorizar o acesso."
                    : "Você será redirecionado ao Facebook para autorizar o acesso."}
                </p>
              </div>

              {/* Info box */}
              {!hasConnections && (
                <div className={`rounded-lg p-4 space-y-2 ${platform === "tiktok" || platform === "threads" ? "bg-gray-50" : "bg-blue-50"}`}>
                  <h4 className={`text-sm font-semibold ${platform === "tiktok" || platform === "threads" ? "text-gray-800" : "text-blue-800"}`}>
                    Como funciona?
                  </h4>
                  {platform === "tiktok" ? (
                    <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Clique em &quot;Conectar com TikTok&quot;</li>
                      <li>Autorize o acesso ao seu perfil</li>
                      <li>Sua conta TikTok será conectada automaticamente</li>
                      <li>Clique em &quot;Sincronizar&quot; para importar seguidores e curtidas</li>
                    </ol>
                  ) : platform === "threads" ? (
                    <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Clique em &quot;Conectar com Threads&quot;</li>
                      <li>Entre com sua conta Threads</li>
                      <li>Autorize o acesso ao seu perfil</li>
                      <li>Clique em &quot;Sincronizar&quot; para importar seguidores e métricas</li>
                    </ol>
                  ) : platform === "instagram" ? (
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Clique em &quot;Conectar com Instagram&quot;</li>
                      <li>Entre com sua conta Instagram</li>
                      <li>Autorize o acesso ao seu perfil</li>
                      <li>Clique em &quot;Sincronizar&quot; para importar seguidores e métricas</li>
                    </ol>
                  ) : (
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Clique em &quot;Conectar com Facebook&quot;</li>
                      <li>Autorize o acesso às suas páginas</li>
                      <li>Suas páginas serão detectadas automaticamente</li>
                      <li>Clique em &quot;Sincronizar&quot; para importar os dados</li>
                    </ol>
                  )}
                  {platform !== "threads" && (
                    <div className={`flex items-center gap-1 text-xs mt-2 ${platform === "tiktok" ? "text-gray-600" : "text-blue-600"}`}>
                      <ExternalLink className="h-3 w-3" />
                      <span>
                        {platform === "tiktok"
                          ? "Requer uma conta TikTok com acesso ao TikTok Login Kit"
                          : platform === "instagram"
                          ? "Requer uma conta Instagram Profissional (Business ou Criador)"
                          : "Requer uma conta Facebook com páginas vinculadas"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
