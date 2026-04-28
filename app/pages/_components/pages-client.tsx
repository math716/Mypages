"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Instagram, Eye, Users, Trash2, Plus, BarChart3, PlusCircle, Pencil, Loader2, ImageIcon, Upload, Filter, X, Search, Target, CheckCircle2, AlertCircle, Link2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageCropper } from "@/components/ui/image-cropper"
import { PlatformSelector } from "@/components/platform-selector"
import { Platform, PLATFORMS } from "@/lib/platforms"
import { ConnectPlatformModal } from "./connect-platform-modal"

interface Page {
  id: string
  name: string
  username: string
  coverImage?: string | null
  collaborator?: string | null
  platform?: string
  createdAt: Date
  dailyData: {
    followers: number
    views: number
  }[]
  _count: {
    dailyData: number
  }
  currentViews: number
  currentGoal: number | null
}

interface QuickSelectGroup {
  name: string
  usernames: string[]
}

interface PagesClientProps {
  pages: Page[]
  currentMonth: number
  currentYear: number
  quickSelectGroups?: QuickSelectGroup[]
  connectedPlatform?: string
  initialPlatform?: string
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function PagesClient({ pages, currentMonth, currentYear, quickSelectGroups = [], connectedPlatform, initialPlatform }: PagesClientProps) {
  const router = useRouter()

  // Auto-sync when redirected back after OAuth connection
  useEffect(() => {
    if (!connectedPlatform) return

    // Switch to the connected platform tab immediately
    setSelectedPlatform(connectedPlatform as Platform)

    // Trigger sync for the connected platform, then reload with clean URL
    const autoSync = async () => {
      try {
        await fetch("/api/platforms/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: connectedPlatform }),
        })
      } catch (err) {
        console.error("Auto-sync failed:", err)
      } finally {
        // Full reload with clean URL on the correct platform tab
        window.location.href = `/pages?platform=${connectedPlatform}`
      }
    }

    autoSync()
  }, [connectedPlatform])

  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [editForm, setEditForm] = useState({ name: "", username: "", coverImage: "", collaborator: "" })
  const collaborators = ["Magno", "Victória", "Leticia"]
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Platform state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>((initialPlatform as Platform) || 'instagram')
  const [isChangingPlatform, setIsChangingPlatform] = useState(false)
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState("")
  
  // Filter pages by platform first
  const platformPages = useMemo(() => {
    return pages?.filter(p => (p.platform || 'instagram') === selectedPlatform) ?? []
  }, [pages, selectedPlatform])
  
  // Filter state
  const [showFilter, setShowFilter] = useState(false)
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>(pages?.map(p => p.id) ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  
  // Goal state
  const [editingGoalPage, setEditingGoalPage] = useState<Page | null>(null)
  const [goalValue, setGoalValue] = useState("")
  const [savingGoal, setSavingGoal] = useState(false)

  // Connect platform modal state
  const [showConnectModal, setShowConnectModal] = useState(false)

  // Platforms that support OAuth connection
  const oauthPlatforms: Platform[] = ['instagram', 'facebook', 'tiktok', 'threads']
  const isOAuthPlatform = oauthPlatforms.includes(selectedPlatform)

  // Handle platform change
  const handlePlatformChange = (platform: Platform) => {
    setIsChangingPlatform(true)
    setSelectedPlatform(platform)
    const newPlatformPages = pages?.filter(p => (p.platform || 'instagram') === platform) ?? []
    setSelectedPageIds(newPlatformPages.map(p => p.id))
    setSearchTerm("")
    setTimeout(() => setIsChangingPlatform(false), 300)
  }

  // Filtered pages (within current platform)
  const filteredPages = useMemo(() => {
    return platformPages?.filter(p => {
      const matchesSelection = selectedPageIds.includes(p.id)
      const matchesSearch = searchTerm === "" || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSelection && matchesSearch
    }) ?? []
  }, [platformPages, selectedPageIds, searchTerm])

  // Cálculo do resumo geral de metas (para a plataforma selecionada)
  // Meta - Views Atuais = quanto falta (se positivo) ou quanto passou (se negativo)
  const goalsSummary = useMemo(() => {
    let totalGoal = 0
    let totalViews = 0
    let pagesWithGoals = 0
    
    platformPages?.forEach(page => {
      if (page.currentGoal && page.currentGoal > 0) {
        totalGoal += page.currentGoal
        totalViews += page.currentViews
        pagesWithGoals++
      }
    })
    
    // Meta - Views = quanto falta (positivo = falta, negativo/zero = bateu)
    const remaining = totalGoal - totalViews
    const achieved = remaining <= 0
    const percentage = totalGoal > 0 ? (totalViews / totalGoal) * 100 : 0
    
    return {
      totalGoal,
      totalViews,
      remaining, // positivo = falta, negativo = passou
      achieved,
      percentage,
      pagesWithGoals
    }
  }, [platformPages])

  const togglePage = (pageId: string) => {
    setSelectedPageIds(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    )
  }

  const selectAll = () => {
    setSelectedPageIds(platformPages?.map(p => p.id) ?? [])
  }

  const deselectAll = () => {
    setSelectedPageIds([])
  }

  // Selecionar páginas por grupo (seleção rápida)
  const selectByGroup = (group: QuickSelectGroup) => {
    const groupPageIds = platformPages
      ?.filter(p => group.usernames.includes(p.username.toLowerCase()))
      .map(p => p.id) ?? []
    setSelectedPageIds(groupPageIds)
  }

  const handleFileSelect = (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setEditError("Por favor, selecione uma imagem válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditError("A imagem deve ter no máximo 5MB")
      return
    }

    setEditError("")
    const imageUrl = URL.createObjectURL(file)
    setTempImageSrc(imageUrl)
    setShowCropper(true)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true)
    setEditError("")

    try {
      const file = new File([croppedBlob], "profile-photo.png", { type: "image/png" })

      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: true
        })
      })

      const presignedData = await presignedRes.json()
      if (!presignedData.success) {
        throw new Error("Failed to get upload URL")
      }

      const uploadUrl = new URL(presignedData.uploadUrl)
      const signedHeaders = uploadUrl.searchParams.get("X-Amz-SignedHeaders") || ""
      const hasContentDisposition = signedHeaders.includes("content-disposition")

      const uploadHeaders: Record<string, string> = {
        "Content-Type": file.type
      }
      if (hasContentDisposition) {
        uploadHeaders["Content-Disposition"] = "attachment"
      }

      const uploadRes = await fetch(presignedData.uploadUrl, {
        method: "PUT",
        headers: uploadHeaders,
        body: file
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image")
      }

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud_storage_path: presignedData.cloud_storage_path,
          isPublic: true
        })
      })

      const completeData = await completeRes.json()
      if (completeData.success) {
        setEditForm(prev => ({ ...prev, coverImage: completeData.fileUrl }))
      }
    } catch (err) {
      console.error("Upload error:", err)
      setEditError("Erro ao enviar imagem")
    } finally {
      setUploading(false)
      if (tempImageSrc) {
        URL.revokeObjectURL(tempImageSrc)
        setTempImageSrc("")
      }
    }
  }

  const openEditModal = (page: Page) => {
    setEditingPage(page)
    setEditForm({
      name: page.name,
      username: page.username,
      coverImage: page.coverImage || "",
      collaborator: page.collaborator || ""
    })
    setEditError("")
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPage) return

    setSaving(true)
    setEditError("")

    try {
      const response = await fetch(`/api/pages/${editingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setEditingPage(null)
        router.refresh()
      } else {
        const data = await response.json()
        setEditError(data?.error ?? "Erro ao atualizar página")
      }
    } catch (error) {
      console.error("Error updating page:", error)
      setEditError("Erro ao atualizar página")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pageId: string, pageName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a página "${pageName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setDeleting(pageId)
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Erro ao excluir página")
      }
    } catch (error) {
      console.error("Error deleting page:", error)
      alert("Erro ao excluir página")
    } finally {
      setDeleting(null)
    }
  }

  // Goal functions
  const openGoalModal = (page: Page) => {
    setEditingGoalPage(page)
    setGoalValue(page.currentGoal?.toString() || "")
  }

  const handleSaveGoal = async () => {
    if (!editingGoalPage) return
    
    setSavingGoal(true)
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: editingGoalPage.id,
          month: currentMonth,
          year: currentYear,
          viewsGoal: parseInt(goalValue) || 0
        })
      })

      if (response.ok) {
        setEditingGoalPage(null)
        router.refresh()
      } else {
        alert("Erro ao salvar meta")
      }
    } catch (error) {
      console.error("Error saving goal:", error)
      alert("Erro ao salvar meta")
    } finally {
      setSavingGoal(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(0) + "K"
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border"
      >
        <h2 className="text-lg font-semibold text-center text-gray-600 mb-4">Selecionar Plataforma</h2>
        <PlatformSelector 
          selected={selectedPlatform} 
          onChange={handlePlatformChange} 
        />
      </motion.div>

      {/* Loading overlay when changing platform */}
      <AnimatePresence>
        {isChangingPlatform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 font-medium">Carregando {PLATFORMS[selectedPlatform].name}...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Minhas Páginas - {PLATFORMS[selectedPlatform].name}</h1>
          <p className="text-muted-foreground">
            Gerencie seu {PLATFORMS[selectedPlatform].name}
            {selectedPageIds.length < (platformPages?.length ?? 0) && (
              <span className="ml-2 text-purple-600">
                ({filteredPages.length} de {platformPages?.length ?? 0} selecionadas)
              </span>
            )}
            {platformPages?.length === 0 && (
              <span className="ml-2 text-orange-600">
                (Nenhuma página cadastrada para {PLATFORMS[selectedPlatform].name})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowFilter(!showFilter)}
            disabled={platformPages?.length === 0}
          >
            <Filter className="h-4 w-4" />
            Filtrar
            {selectedPageIds.length < (platformPages?.length ?? 0) && (
              <span className="ml-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                {selectedPageIds.length}
              </span>
            )}
          </Button>
          {isOAuthPlatform && (
            <Button
              className={`gap-2 text-white ${
                selectedPlatform === 'tiktok' || selectedPlatform === 'threads'
                  ? 'bg-black hover:bg-gray-900'
                  : selectedPlatform === 'instagram'
                  ? 'hover:opacity-90'
                  : selectedPlatform === 'facebook'
                  ? 'bg-[#1877F2] hover:bg-[#166FE5]'
                  : selectedPlatform === 'kawaii'
                  ? 'bg-[#FF6B00] hover:bg-[#e55f00]'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              style={selectedPlatform === 'instagram' ? { background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' } : undefined}
              onClick={() => setShowConnectModal(true)}
            >
              <Link2 className="h-4 w-4" />
              Conectar Plataforma
            </Button>
          )}
          <Link href={`/pages/new?platform=${selectedPlatform}`}>
            <Button
              className={`gap-2 text-white ${
                selectedPlatform === 'instagram'
                  ? 'hover:opacity-90'
                  : selectedPlatform === 'facebook'
                  ? 'bg-[#1877F2] hover:bg-[#166FE5]'
                  : selectedPlatform === 'kawaii'
                  ? 'bg-[#FF6B00] hover:bg-[#e55f00]'
                  : selectedPlatform === 'tiktok' || selectedPlatform === 'threads'
                  ? 'bg-black hover:bg-gray-900'
                  : selectedPlatform === 'x'
                  ? 'bg-black hover:bg-gray-900'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              style={selectedPlatform === 'instagram' ? { background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' } : undefined}
            >
              <Plus className="h-4 w-4" />
              {isOAuthPlatform ? "Adicionar Manualmente" : "Nova Página"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Goals Summary Card */}
      {goalsSummary.pagesWithGoals > 0 && (
        <Card className={`border-2 ${
          goalsSummary.achieved 
            ? 'border-green-300 bg-green-50' 
            : 'border-red-300 bg-red-50'
        }`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  goalsSummary.achieved ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {goalsSummary.achieved ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Target className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Overall Goal - {MONTH_NAMES[currentMonth - 1]} {currentYear}
                  </p>
                  <p className="text-lg font-bold">
                    {formatNumber(goalsSummary.totalViews)} / {formatNumber(goalsSummary.totalGoal)} views
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className={`text-xl font-bold ${
                    goalsSummary.achieved ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {goalsSummary.percentage.toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {goalsSummary.achieved ? 'Acima da meta' : 'Restante'}
                  </p>
                  <p className={`text-xl font-bold ${
                    goalsSummary.achieved ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {goalsSummary.achieved ? '+' : ''}{formatNumber(Math.abs(goalsSummary.remaining))}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Páginas com meta</p>
                  <p className="text-xl font-bold text-gray-700">
                    {goalsSummary.pagesWithGoals}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    goalsSummary.achieved 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${Math.min(goalsSummary.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Filtrar Páginas</span>
                      <span className="text-sm text-muted-foreground">
                        ({selectedPageIds.length} de {pages?.length ?? 0} selecionadas)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        Selecionar Todas
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        Limpar Seleção
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFilter(false)}
                        className="text-gray-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  {quickSelectGroups.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Seleção rápida:</span>
                      {quickSelectGroups.map(group => (
                        <Button
                          key={group.name}
                          variant="outline"
                          size="sm"
                          onClick={() => selectByGroup(group)}
                          className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-purple-300"
                        >
                          {group.name}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({group.usernames.length})
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                    {pages?.map(page => {
                      const latestFollowers = page?.dailyData?.[0]?.followers ?? 0
                      return (
                        <label
                          key={page.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={selectedPageIds.includes(page.id)}
                            onCheckedChange={() => togglePage(page.id)}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {page?.coverImage ? (
                              <div className="h-8 w-8 rounded-full overflow-hidden border flex-shrink-0">
                                <img 
                                  src={page.coverImage} 
                                  alt={page.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <Instagram className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{page.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {latestFollowers > 0 ? `${latestFollowers.toLocaleString()} seg.` : 'Sem dados'}
                              </p>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pages Grid */}
      {platformPages?.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedPlatform === 'instagram' ? (
              <div className="h-24 w-24 mx-auto mb-6 rounded-2xl flex items-center justify-center opacity-20">
                <svg className="h-20 w-20" viewBox="0 0 24 24" fill="url(#igGrad)">
                  <defs>
                    <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="25%" stopColor="#e6683c"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="75%" stopColor="#cc2366"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
            ) : selectedPlatform === 'threads' ? (
              <div className="h-24 w-24 mx-auto mb-6 opacity-20">
                <svg className="h-24 w-24 text-black" viewBox="0 0 192 192" fill="currentColor">
                  <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.347-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 6.981 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96c.223 28.685 6.88 51.515 19.788 67.92 14.504 18.437 36.094 27.884 64.172 28.08h.113c24.986-.171 42.127-11.619 54.167-23.565 18.337-18.324 17.756-41.146 11.733-55.208-4.24-9.886-12.208-17.98-21.437-23.239Zm-30.96 43.348c-5.461 6.148-13.501 9.37-23.882 9.579-10.735.207-19.763-3.519-23.613-9.581-2.332-3.69-3.363-8.025-2.908-12.382.803-7.742 6.574-13.254 16.186-15.499 3.928-.924 8.202-1.38 12.744-1.363 3.928.014 7.664.326 11.158.92 1.085.188 2.137.398 3.155.628-.916 13.004-4.789 21.597-12.84 27.698Z"/>
                </svg>
              </div>
            ) : selectedPlatform === 'x' ? (
              <div className="h-24 w-24 mx-auto mb-6 opacity-20">
                <svg className="h-24 w-24 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.033 9.176 9.45 12.518H16.6l-5.793-7.57-6.63 7.57H.5l8.59-9.812L0 1.153h7.586l5.243 6.932 6.072-6.932zm-1.29 19.494h2.04L6.478 3.24H4.29l13.32 17.407z"/>
                </svg>
              </div>
            ) : selectedPlatform === 'tiktok' ? (
              <div className="h-24 w-24 mx-auto mb-6 opacity-20">
                <svg className="h-24 w-24 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
            ) : selectedPlatform === 'facebook' ? (
              <div className="h-24 w-24 mx-auto mb-6 opacity-20">
                <svg className="h-24 w-24 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.018 4.388 11.007 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.686 4.533-4.686 1.312 0 2.686.236 2.686.236v2.963h-1.514c-1.492 0-1.956.93-1.956 1.887v2.26h3.328l-.532 3.49h-2.796V24C19.612 23.08 24 18.091 24 12.073z"/>
                </svg>
              </div>
            ) : selectedPlatform === 'kawaii' ? (
              <div className="h-24 w-24 mx-auto mb-6 opacity-20">
                <svg className="h-24 w-24 text-[#FF6B00]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4v16l14-8L6 4z"/>
                </svg>
              </div>
            ) : (
              <Instagram className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            )}
            <h2 className="text-2xl font-bold mb-3">Nenhuma página cadastrada</h2>
            <p className="text-muted-foreground mb-6">
              {isOAuthPlatform
                ? `Conecte sua conta para importar automaticamente suas páginas do ${PLATFORMS[selectedPlatform].name}`
                : `Comece adicionando uma página do ${PLATFORMS[selectedPlatform].name} para monitorar`
              }
            </p>
            {isOAuthPlatform ? (
              <div className="flex flex-col items-center gap-3">
                <Button
                  className={`text-white gap-2 px-8 py-3 text-base ${
                    selectedPlatform === 'tiktok' || selectedPlatform === 'threads'
                      ? 'bg-black hover:bg-gray-900'
                      : selectedPlatform === 'instagram'
                      ? 'hover:opacity-90'
                      : 'bg-[#1877F2] hover:bg-[#166FE5]'
                  }`}
                  style={selectedPlatform === 'instagram' ? { background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' } : undefined}
                  onClick={() => setShowConnectModal(true)}
                >
                  <Link2 className="h-5 w-5" />
                  Conectar {PLATFORMS[selectedPlatform].name}
                </Button>
                <p className="text-xs text-muted-foreground max-w-md text-center">
                  {selectedPlatform === 'instagram'
                    ? 'Você será redirecionado ao Instagram para entrar e autorizar acesso ao seu perfil profissional.'
                    : selectedPlatform === 'tiktok'
                    ? 'Você será redirecionado ao TikTok para autorizar o acesso ao seu perfil.'
                    : selectedPlatform === 'threads'
                    ? 'Você será redirecionado ao Threads para entrar e autorizar o acesso ao seu perfil.'
                    : 'Você será redirecionado ao Facebook para autorizar o acesso às suas páginas.'
                  }
                </p>
                <Link href={`/pages/new?platform=${selectedPlatform}`}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1 mt-2">
                    <Plus className="h-4 w-4" />
                    Ou adicionar manualmente
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href={`/pages/new?platform=${selectedPlatform}`}>
                <Button className={`text-white ${PLATFORMS[selectedPlatform].bgColor}`}>
                  Adicionar Primeira Página
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      ) : filteredPages?.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Filter className="h-16 w-16 mx-auto text-gray-300 mb-6" />
            <h2 className="text-xl font-bold mb-3">Nenhuma página encontrada</h2>
            <p className="text-muted-foreground mb-6">
              Ajuste os filtros para ver suas páginas
            </p>
            <Button variant="outline" onClick={selectAll}>
              Mostrar Todas as Páginas
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages?.map((page, index) => {
            const latestData = page?.dailyData?.[0]
            const hasGoal = page.currentGoal && page.currentGoal > 0
            // Meta - Views Atuais = quanto falta (positivo = falta, negativo/zero = bateu)
            const remaining = hasGoal ? page.currentGoal! - page.currentViews : 0
            const goalAchieved = hasGoal && remaining <= 0
            const progressPercentage = hasGoal ? (page.currentViews / page.currentGoal!) * 100 : 0
            
            return (
              <motion.div
                key={page?.id ?? index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {page?.coverImage ? (
                          <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-purple-200 shadow-md">
                            <img 
                              src={page.coverImage} 
                              alt={page?.name ?? ''} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                            <Instagram className="h-7 w-7 text-white" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{page?.name ?? ''}</CardTitle>
                          <p className="text-sm text-muted-foreground">@{page?.username ?? ''}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> Followers
                        </p>
                        <p className="text-xl font-bold">
                          {latestData?.followers?.toLocaleString() ?? '0'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Views
                        </p>
                        <p className="text-xl font-bold">
                          {latestData?.views?.toLocaleString() ?? '0'}
                        </p>
                      </div>
                    </div>

                    {/* Monthly Goal Section */}
                    <div className={`p-3 rounded-lg border-2 ${
                      !hasGoal 
                        ? 'border-gray-200 bg-gray-50' 
                        : goalAchieved 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-red-300 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className={`h-4 w-4 ${
                            !hasGoal ? 'text-gray-400' : goalAchieved ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className="text-xs font-medium">
                            Meta {MONTH_NAMES[currentMonth - 1]}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => openGoalModal(page)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          {hasGoal ? 'Editar' : 'Definir'}
                        </Button>
                      </div>
                      
                      {hasGoal ? (
                        <>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              {formatNumber(page.currentViews)} / {formatNumber(page.currentGoal!)} views
                            </span>
                            <span className={`font-bold ${
                              goalAchieved ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {goalAchieved ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  +{formatNumber(Math.abs(remaining))}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  -{formatNumber(remaining)}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                goalAchieved 
                                  ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                  : 'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Nenhuma meta definida para este mês
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {page?._count?.dailyData ?? 0} registro(s) de dados
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/pages/${page?.id ?? ''}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2" size="sm">
                          <BarChart3 className="h-4 w-4" />
                          Ver Dashboard
                        </Button>
                      </Link>
                      <Link href={`/pages/${page?.id ?? ''}/add-data`}>
                        <Button variant="outline" size="sm" title="Adicionar dados">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(page)}
                        title="Editar página"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(page?.id ?? '', page?.name ?? '')}
                        disabled={deleting === page?.id}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir página"
                      >
                        {deleting === page?.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Edit Page Modal */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Página</DialogTitle>
            <DialogDescription>
              Atualize as informações da página
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Página</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Usuário</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value.replace('@', '') })}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-collaborator">Colaborador</Label>
              <select
                id="edit-collaborator"
                value={editForm.collaborator}
                onChange={(e) => setEditForm({ ...editForm, collaborator: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione um colaborador</option>
                {collaborators.map((collab) => (
                  <option key={collab} value={collab}>{collab}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-300 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-lg">
                  {editForm.coverImage ? (
                    <img 
                      src={editForm.coverImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher Imagem
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Você pode ajustar o tamanho
                  </p>
                </div>
              </div>
              <Input
                placeholder="Ou cole uma URL de imagem"
                value={editForm.coverImage}
                onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                className="mt-2"
              />
            </div>

            {editError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {editError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditingPage(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={saving || uploading}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Goal Edit Modal */}
      <Dialog open={!!editingGoalPage} onOpenChange={(open) => !open && setEditingGoalPage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Meta de Visualizações
            </DialogTitle>
            <DialogDescription>
              Defina a meta de visualizações para {editingGoalPage?.name} em {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-value">Meta de Visualizações</Label>
              <Input
                id="goal-value"
                type="number"
                placeholder="E.g.: 1000000"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Visualizações atuais: {formatNumber(editingGoalPage?.currentViews ?? 0)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditingGoalPage(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={handleSaveGoal}
              disabled={savingGoal}
            >
              {savingGoal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Meta"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect Platform Modal */}
      <ConnectPlatformModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        platform={selectedPlatform}
      />

      {/* Image Cropper Modal */}
      <ImageCropper
        open={showCropper}
        onClose={() => {
          setShowCropper(false)
          if (tempImageSrc) {
            URL.revokeObjectURL(tempImageSrc)
            setTempImageSrc("")
          }
        }}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        cropShape="round"
      />
    </div>
  )
}
