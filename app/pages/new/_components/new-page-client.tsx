"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, ArrowLeft, Loader2, Upload, ImageIcon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Platform, PLATFORMS, PLATFORM_LIST } from "@/lib/platforms"

export function NewPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  // Get platform from URL or default to instagram
  const urlPlatform = searchParams.get('platform') as Platform | null
  const initialPlatform: Platform = urlPlatform && PLATFORM_LIST.includes(urlPlatform) ? urlPlatform : 'instagram'

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    coverImage: "",
    collaborator: "",
    platform: initialPlatform
  })

  const collaborators = ["Magno", "Victória", "Leticia"]
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState("")

  // Update platform if URL changes
  useEffect(() => {
    if (urlPlatform && PLATFORM_LIST.includes(urlPlatform)) {
      setFormData(prev => ({ ...prev, platform: urlPlatform }))
    }
  }, [urlPlatform])

  const handleFileSelect = (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB")
      return
    }

    setError("")
    const imageUrl = URL.createObjectURL(file)
    setTempImageSrc(imageUrl)
    setShowCropper(true)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true)
    setError("")

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
        setFormData(prev => ({ ...prev, coverImage: completeData.fileUrl }))
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Erro ao enviar imagem")
    } finally {
      setUploading(false)
      if (tempImageSrc) {
        URL.revokeObjectURL(tempImageSrc)
        setTempImageSrc("")
      }
    }
  }

  const handleUsernameChange = (value: string) => {
    const cleanValue = value.replace('@', '')
    setFormData({ ...formData, username: cleanValue })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error ?? "Erro ao criar página")
      } else {
        router.push("/pages")
        router.refresh()
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
          <h1 className="text-3xl font-bold">Nova Página - {PLATFORMS[formData.platform].name}</h1>
          <p className="text-muted-foreground">Adicione uma página do {PLATFORMS[formData.platform].name} para monitorar</p>
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
              <div className={`h-12 w-12 rounded-lg ${PLATFORMS[formData.platform].bgColor} flex items-center justify-center`}>
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Informações da Página</CardTitle>
                <CardDescription>Preencha os detalhes da página para {PLATFORMS[formData.platform].name}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform">Plataforma *</Label>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORM_LIST.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: p })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.platform === p
                          ? `${PLATFORMS[p].bgColor} text-white shadow-md`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {PLATFORMS[p].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Página *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Minha Empresa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nome descritivo para identificar esta página
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Usuário no {PLATFORMS[formData.platform].name} *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <Input
                    id="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Usuário da página no {PLATFORMS[formData.platform].name} (sem @)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collaborator">Colaborador</Label>
                <select
                  id="collaborator"
                  value={formData.collaborator}
                  onChange={(e) => setFormData({ ...formData, collaborator: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione um colaborador</option>
                  {collaborators.map((collab) => (
                    <option key={collab} value={collab}>{collab}</option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  Colaborador responsável por gerenciar esta página
                </p>
              </div>

              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-300 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-lg">
                    {formData.coverImage ? (
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            const placeholder = parent.querySelector('.placeholder-icon')
                            if (placeholder) (placeholder as HTMLElement).style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className={`placeholder-icon absolute inset-0 flex items-center justify-center ${formData.coverImage ? 'hidden' : ''}`}>
                      <ImageIcon className="h-10 w-10 text-purple-400" />
                    </div>
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
                      Você pode ajustar o tamanho e posição da foto
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <Label htmlFor="coverImageUrl" className="text-sm">Ou cole uma URL:</Label>
                  <Input
                    id="coverImageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
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
                  disabled={loading || uploading}
                >
                  {loading ? "Criando..." : "Criar Página"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

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
