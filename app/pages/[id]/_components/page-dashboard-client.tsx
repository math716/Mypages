"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { KPICard } from "@/components/kpi-card"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Eye, TrendingUp, Calendar, Download, ArrowLeft, PlusCircle, Pencil, Trash2, BarChart3, Target, Zap, AlertTriangle, CheckCircle2, TrendingDown, Activity, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { formatDateBR, formatDateShort, parseLocalDate, getTodayString } from "@/lib/utils"

interface DailyData {
  id: string
  date: Date
  followers: number
  views: number
}

interface Page {
  id: string
  name: string
  username: string
  createdAt: Date
  dailyData: DailyData[]
}

interface PageDashboardClientProps {
  page: Page
}

export function PageDashboardClient({ page }: PageDashboardClientProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [editingData, setEditingData] = useState<DailyData | null>(null)
  const [editForm, setEditForm] = useState({ date: "", followers: "", views: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editError, setEditError] = useState("")

  const openEditDataModal = (data: DailyData) => {
    setEditingData(data)
    // Converter a data para string YYYY-MM-DD corretamente
    const d = parseLocalDate(data.date)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setEditForm({
      date: dateStr,
      followers: data.followers.toString(),
      views: data.views.toString()
    })
    setEditError("")
  }

  const handleEditDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingData) return

    setSaving(true)
    setEditError("")

    try {
      const response = await fetch(`/api/data/${editingData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editForm.date,
          followers: parseInt(editForm.followers),
          views: parseInt(editForm.views)
        }),
      })

      if (response.ok) {
        setEditingData(null)
        router.refresh()
      } else {
        const data = await response.json()
        setEditError(data?.error ?? "Erro ao atualizar dados")
      }
    } catch (error) {
      console.error("Error updating data:", error)
      setEditError("Erro ao atualizar dados")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteData = async (dataId: string, date: string) => {
    if (!confirm(`Tem certeza que deseja excluir os dados de ${date}?`)) {
      return
    }

    setDeleting(dataId)
    try {
      const response = await fetch(`/api/data/${dataId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Erro ao excluir dados")
      }
    } catch (error) {
      console.error("Error deleting data:", error)
      alert("Erro ao excluir dados")
    } finally {
      setDeleting(null)
    }
  }

  const dailyData = page?.dailyData ?? []
  const latestData = dailyData?.[dailyData?.length - 1]
  const previousData = dailyData?.[dailyData?.length - 2]

  // Calculate metrics
  const totalFollowers = latestData?.followers ?? 0
  const totalViews = latestData?.views ?? 0
  const totalRecords = dailyData?.length ?? 0

  // Calculate growth
  const followersGrowth = previousData && previousData.followers > 0
    ? ((totalFollowers - previousData.followers) / previousData.followers) * 100
    : 0

  const viewsGrowth = previousData && previousData.views > 0
    ? ((totalViews - previousData.views) / previousData.views) * 100
    : 0

  // Prepare chart data
  const chartData = dailyData?.map(data => ({
    date: formatDateShort(data?.date ?? new Date()),
    followers: data?.followers ?? 0,
    views: data?.views ?? 0
  })) ?? []

  // Calculate daily growth for bar chart
  const growthData = dailyData?.map((data, index) => {
    if (index === 0) return null
    const prev = dailyData[index - 1]
    const followerGrowth = prev?.followers ? ((data.followers - prev.followers) / prev.followers) * 100 : 0
    const viewGrowth = prev?.views ? ((data.views - prev.views) / prev.views) * 100 : 0
    return {
      date: formatDateShort(data?.date ?? new Date()),
      followerGrowth: parseFloat(followerGrowth.toFixed(2)),
      viewGrowth: parseFloat(viewGrowth.toFixed(2))
    }
  }).filter(Boolean) ?? []

  // ===== METRICS ANALYSIS =====
  const metricsAnalysis = useMemo(() => {
    if (dailyData.length < 2) return null

    // Sort data by date
    const sortedData = [...dailyData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const firstRecord = sortedData[0]
    const lastRecord = sortedData[sortedData.length - 1]
    const dataLength = sortedData.length

    // Total growth over entire period
    const totalFollowersGrowth = firstRecord?.followers > 0 
      ? ((lastRecord.followers - firstRecord.followers) / firstRecord.followers) * 100 
      : 0
    const totalViewsGrowth = firstRecord?.views > 0 
      ? ((lastRecord.views - firstRecord.views) / firstRecord.views) * 100 
      : 0

    // Absolute gains
    const followersGained = lastRecord.followers - firstRecord.followers
    const viewsGained = lastRecord.views - firstRecord.views

    // Calculate average daily growth
    const dailyGrowths = sortedData.map((data, idx) => {
      if (idx === 0) return { followers: 0, views: 0 }
      const prev = sortedData[idx - 1]
      return {
        followers: data.followers - prev.followers,
        views: data.views - prev.views
      }
    }).slice(1)

    const avgDailyFollowerGrowth = dailyGrowths.length > 0
      ? dailyGrowths.reduce((sum, d) => sum + d.followers, 0) / dailyGrowths.length
      : 0
    const avgDailyViewsGrowth = dailyGrowths.length > 0
      ? dailyGrowths.reduce((sum, d) => sum + d.views, 0) / dailyGrowths.length
      : 0

    // Calculate growth percentages
    const dailyGrowthPercentages = sortedData.map((data, idx) => {
      if (idx === 0) return { followers: 0, views: 0 }
      const prev = sortedData[idx - 1]
      return {
        followers: prev.followers > 0 ? ((data.followers - prev.followers) / prev.followers) * 100 : 0,
        views: prev.views > 0 ? ((data.views - prev.views) / prev.views) * 100 : 0
      }
    }).slice(1)

    const avgFollowerGrowthRate = dailyGrowthPercentages.length > 0
      ? dailyGrowthPercentages.reduce((sum, d) => sum + d.followers, 0) / dailyGrowthPercentages.length
      : 0
    const avgViewsGrowthRate = dailyGrowthPercentages.length > 0
      ? dailyGrowthPercentages.reduce((sum, d) => sum + d.views, 0) / dailyGrowthPercentages.length
      : 0

    // Best and worst days
    const bestFollowerDay = dailyGrowths.length > 0 
      ? dailyGrowths.reduce((best, curr, idx) => curr.followers > best.value ? { value: curr.followers, idx: idx + 1 } : best, { value: -Infinity, idx: 0 })
      : null
    const worstFollowerDay = dailyGrowths.length > 0 
      ? dailyGrowths.reduce((worst, curr, idx) => curr.followers < worst.value ? { value: curr.followers, idx: idx + 1 } : worst, { value: Infinity, idx: 0 })
      : null

    const bestViewDay = dailyGrowths.length > 0 
      ? dailyGrowths.reduce((best, curr, idx) => curr.views > best.value ? { value: curr.views, idx: idx + 1 } : best, { value: -Infinity, idx: 0 })
      : null

    // Calculate trend (last 7 days vs previous 7 days)
    const recentDays = sortedData.slice(-7)
    const previousDays = sortedData.slice(-14, -7)
    
    let followersTrend = 'stable'
    let viewsTrend = 'stable'
    
    if (recentDays.length >= 3 && previousDays.length >= 3) {
      const recentFollowersAvg = recentDays.reduce((sum, d) => sum + d.followers, 0) / recentDays.length
      const previousFollowersAvg = previousDays.reduce((sum, d) => sum + d.followers, 0) / previousDays.length
      const recentViewsAvg = recentDays.reduce((sum, d) => sum + d.views, 0) / recentDays.length
      const previousViewsAvg = previousDays.reduce((sum, d) => sum + d.views, 0) / previousDays.length
      
      const followersDiff = ((recentFollowersAvg - previousFollowersAvg) / previousFollowersAvg) * 100
      const viewsDiff = ((recentViewsAvg - previousViewsAvg) / previousViewsAvg) * 100
      
      if (followersDiff > 5) followersTrend = 'up'
      else if (followersDiff < -5) followersTrend = 'down'
      
      if (viewsDiff > 5) viewsTrend = 'up'
      else if (viewsDiff < -5) viewsTrend = 'down'
    }

    // Views per follower ratio
    const viewsPerFollower = lastRecord.followers > 0 ? lastRecord.views / lastRecord.followers : 0

    // Days between first and last record
    const daysBetween = Math.ceil(
      (new Date(lastRecord.date).getTime() - new Date(firstRecord.date).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Projected growth (30 days projection)
    const projectedFollowers = lastRecord.followers + (avgDailyFollowerGrowth * 30)
    const projectedViews = lastRecord.views + (avgDailyViewsGrowth * 30)

    // Consistency score (how consistent is the growth)
    const stdDevFollowers = dailyGrowths.length > 1
      ? Math.sqrt(dailyGrowths.reduce((sum, d) => sum + Math.pow(d.followers - avgDailyFollowerGrowth, 2), 0) / dailyGrowths.length)
      : 0
    const consistencyScore = avgDailyFollowerGrowth !== 0 
      ? Math.max(0, Math.min(100, 100 - (stdDevFollowers / Math.abs(avgDailyFollowerGrowth) * 20)))
      : 50

    // Generate insights
    const insights: { type: 'success' | 'warning' | 'info', message: string }[] = []

    if (totalFollowersGrowth > 10) {
      insights.push({ type: 'success', message: `Crescimento sólido! Você ganhou ${totalFollowersGrowth.toFixed(1)}% mais seguidores neste período.` })
    } else if (totalFollowersGrowth < 0) {
      insights.push({ type: 'warning', message: `Atenção: houve uma queda de ${Math.abs(totalFollowersGrowth).toFixed(1)}% nos seguidores.` })
    }

    if (followersTrend === 'up') {
      insights.push({ type: 'success', message: 'A tendência de seguidores está subindo nos últimos dias!' })
    } else if (followersTrend === 'down') {
      insights.push({ type: 'warning', message: 'A tendência de seguidores está caindo. Considere ajustar sua estratégia.' })
    }

    if (viewsPerFollower > 2) {
      insights.push({ type: 'success', message: `Excelente engajamento! ${viewsPerFollower.toFixed(1)}x mais visualizações do que seguidores.` })
    } else if (viewsPerFollower < 0.5) {
      insights.push({ type: 'info', message: 'As visualizações são baixas em relação aos seguidores. Tente postar com mais frequência.' })
    }

    if (consistencyScore > 70) {
      insights.push({ type: 'success', message: 'Seu crescimento é consistente e previsível.' })
    } else if (consistencyScore < 30) {
      insights.push({ type: 'info', message: 'Seu crescimento é irregular. Tente manter uma estratégia mais consistente.' })
    }

    if (bestFollowerDay && bestFollowerDay.value > 0) {
      const bestDate = formatDateBR(sortedData[bestFollowerDay.idx]?.date ?? new Date())
      insights.push({ type: 'info', message: `Melhor dia: ${bestDate} com +${bestFollowerDay.value.toLocaleString()} seguidores.` })
    }

    return {
      totalFollowersGrowth,
      totalViewsGrowth,
      followersGained,
      viewsGained,
      avgDailyFollowerGrowth,
      avgDailyViewsGrowth,
      avgFollowerGrowthRate,
      avgViewsGrowthRate,
      bestFollowerDay,
      worstFollowerDay,
      bestViewDay,
      followersTrend,
      viewsTrend,
      viewsPerFollower,
      daysBetween,
      projectedFollowers,
      projectedViews,
      consistencyScore,
      insights,
      dataLength
    }
  }, [dailyData])

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportStartDate, setReportStartDate] = useState("")
  const [reportEndDate, setReportEndDate] = useState("")

  const openReportModal = () => {
    setReportStartDate("")
    setReportEndDate("")
    setShowReportModal(true)
  }

  const handleExportPDF = async () => {
    setGenerating(true)
    setShowReportModal(false)

    try {
      // Filter data by date range if specified
      const filterDataByDate = (data: DailyData[]) => {
        if (!reportStartDate && !reportEndDate) return data
        return data.filter(d => {
          const date = new Date(d.date)
          if (reportStartDate && date < new Date(reportStartDate)) return false
          if (reportEndDate && date > new Date(reportEndDate)) return false
          return true
        })
      }

      const filteredData = filterDataByDate(dailyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      if (filteredData.length === 0) {
        alert('Nenhum dado encontrado para o período selecionado')
        setGenerating(false)
        return
      }

      // Calculate metrics for filtered data
      const firstRecord = filteredData[0]
      const lastRecord = filteredData[filteredData.length - 1]
      const reportFollowers = lastRecord?.followers ?? 0
      const reportViews = lastRecord?.views ?? 0

      const reportFollowersGrowth = firstRecord?.followers > 0 
        ? ((lastRecord.followers - firstRecord.followers) / firstRecord.followers) * 100 
        : 0
      const reportViewsGrowth = firstRecord?.views > 0 
        ? ((lastRecord.views - firstRecord.views) / firstRecord.views) * 100 
        : 0

      const followersGained = lastRecord.followers - firstRecord.followers
      const viewsGained = lastRecord.views - firstRecord.views

      // Calculate daily averages
      const dailyGrowths = filteredData.map((data, idx) => {
        if (idx === 0) return { followers: 0, views: 0 }
        const prev = filteredData[idx - 1]
        return {
          followers: data.followers - prev.followers,
          views: data.views - prev.views
        }
      }).slice(1)

      const avgDailyFollowers = dailyGrowths.length > 0
        ? dailyGrowths.reduce((sum, d) => sum + d.followers, 0) / dailyGrowths.length
        : 0
      const avgDailyViews = dailyGrowths.length > 0
        ? dailyGrowths.reduce((sum, d) => sum + d.views, 0) / dailyGrowths.length
        : 0

      // Views per follower
      const viewsPerFollower = reportFollowers > 0 ? reportViews / reportFollowers : 0

      // Days between
      const daysBetween = Math.ceil(
        (new Date(lastRecord.date).getTime() - new Date(firstRecord.date).getTime()) / (1000 * 60 * 60 * 24)
      ) || 1

      // Projection (30 days)
      const projectedFollowers = reportFollowers + (avgDailyFollowers * 30)
      const projectedViews = reportViews + (avgDailyViews * 30)

      // Format numbers
      const formatNum = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
        return n.toString()
      }

      // Chart data
      const reportChartData = filteredData.map(d => ({
        date: formatDateShort(d.date),
        followers: d.followers,
        views: d.views
      }))

      // Generate SVG charts
      const lineChartWidth = 320
      const lineChartHeight = 160
      const padding = 35
      const maxFollowers = Math.max(...reportChartData.map(d => d.followers), 1)
      const maxViews = Math.max(...reportChartData.map(d => d.views), 1)

      const followersPoints = reportChartData.map((d, i) => {
        const x = padding + (i / Math.max(reportChartData.length - 1, 1)) * (lineChartWidth - 2 * padding)
        const y = lineChartHeight - padding - (d.followers / maxFollowers) * (lineChartHeight - 2 * padding)
        return `${x},${y}`
      }).join(' ')

      const viewsPoints = reportChartData.map((d, i) => {
        const x = padding + (i / Math.max(reportChartData.length - 1, 1)) * (lineChartWidth - 2 * padding)
        const y = lineChartHeight - padding - (d.views / maxViews) * (lineChartHeight - 2 * padding)
        return `${x},${y}`
      }).join(' ')

      // Growth chart data
      const growthChartData = dailyGrowths.map((d, idx) => ({
        date: formatDateShort(filteredData[idx + 1]?.date ?? new Date()),
        followers: d.followers,
        views: d.views
      }))

      const maxGrowth = Math.max(...growthChartData.map(d => Math.abs(d.followers)), 1)
      const growthBarWidth = growthChartData.length > 0 
        ? Math.max(8, Math.min(20, (lineChartWidth - 2 * padding) / growthChartData.length - 2))
        : 10

      const dateRange = reportStartDate || reportEndDate
        ? `${reportStartDate ? formatDateBR(reportStartDate) : 'Início'} - ${reportEndDate ? formatDateBR(reportEndDate) : 'Atual'}`
        : 'Todos os dados'

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page { margin: 15mm 12mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.4; }
            
            .header { display: flex; align-items: center; gap: 15px; padding-bottom: 12px; border-bottom: 2px solid #8b5cf6; margin-bottom: 15px; }
            .logo { width: 50px; height: 50px; border-radius: 10px; object-fit: cover; }
            .header-text h1 { color: #8b5cf6; font-size: 18px; margin-bottom: 2px; }
            .header-text .subtitle { color: #6b7280; font-size: 10px; }
            
            .page-info { background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%); padding: 15px; border-radius: 10px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px; }
            .page-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
            .page-details h2 { font-size: 20px; color: #111827; margin-bottom: 2px; }
            .page-details .username { color: #8b5cf6; font-size: 14px; }
            .page-details .period { color: #6b7280; font-size: 11px; margin-top: 4px; }
            
            .kpi-row { display: flex; gap: 10px; margin-bottom: 15px; }
            .kpi-card { flex: 1; background: #fff; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
            .kpi-title { color: #6b7280; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
            .kpi-value { font-size: 18px; font-weight: 700; color: #111827; }
            .kpi-trend { font-size: 10px; margin-top: 2px; }
            .kpi-trend.positive { color: #10b981; }
            .kpi-trend.negative { color: #ef4444; }
            
            .charts-section { display: flex; gap: 12px; margin-bottom: 15px; }
            .chart-box { flex: 1; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
            .chart-title { font-size: 10px; font-weight: 600; color: #374151; margin-bottom: 8px; text-align: center; }
            
            .metrics-section { background: #f9fafb; border-radius: 10px; padding: 15px; margin-bottom: 15px; }
            .metrics-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .metric-card { background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb; }
            .metric-label { font-size: 9px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .metric-value { font-size: 16px; font-weight: 700; color: #8b5cf6; }
            .metric-sub { font-size: 8px; color: #9ca3af; }
            
            .projection-section { display: flex; gap: 10px; margin-bottom: 15px; }
            .projection-card { flex: 1; padding: 12px; border-radius: 8px; }
            .projection-card.purple { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1px solid #c4b5fd; }
            .projection-card.pink { background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border: 1px solid #f9a8d4; }
            .projection-label { font-size: 9px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .projection-value { font-size: 20px; font-weight: 700; }
            .projection-card.purple .projection-value { color: #7c3aed; }
            .projection-card.pink .projection-value { color: #db2777; }
            .projection-gain { font-size: 10px; color: #10b981; margin-top: 2px; }
            
            .data-table { width: 100%; border-collapse: collapse; font-size: 10px; }
            .data-table th { background: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
            .data-table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
            .data-table tr:nth-child(even) { background: #f9fafb; }
            
            .footer { margin-top: 15px; text-align: center; color: #9ca3af; font-size: 8px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo.jpg" class="logo" alt="MyPages" onerror="this.style.display='none'" />
            <div class="header-text">
              <h1>MyPages - Relatório Individual</h1>
              <div class="subtitle">Gerado em ${formatDateBR(new Date(), { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div class="page-info">
            <div class="page-avatar">${(page?.name ?? 'P').charAt(0).toUpperCase()}</div>
            <div class="page-details">
              <h2>${page?.name ?? ''}</h2>
              <div class="username">@${page?.username ?? ''}</div>
              <div class="period">📅 ${dateRange} • ${filteredData.length} registros em ${daysBetween} dias</div>
            </div>
          </div>
          
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-title">Seguidores Atuais</div>
              <div class="kpi-value">${formatNum(reportFollowers)}</div>
              <div class="kpi-trend ${reportFollowersGrowth >= 0 ? 'positive' : 'negative'}">
                ${reportFollowersGrowth >= 0 ? '↑' : '↓'} ${Math.abs(reportFollowersGrowth).toFixed(1)}%
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Visualizações</div>
              <div class="kpi-value">${formatNum(reportViews)}</div>
              <div class="kpi-trend ${reportViewsGrowth >= 0 ? 'positive' : 'negative'}">
                ${reportViewsGrowth >= 0 ? '↑' : '↓'} ${Math.abs(reportViewsGrowth).toFixed(1)}%
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Ganho de Seguidores</div>
              <div class="kpi-value">${followersGained >= 0 ? '+' : ''}${formatNum(followersGained)}</div>
              <div class="kpi-trend positive">no período</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Engajamento</div>
              <div class="kpi-value">${viewsPerFollower.toFixed(1)}x</div>
              <div class="kpi-trend">views/seguidor</div>
            </div>
          </div>

          <div class="charts-section">
            <div class="chart-box">
              <div class="chart-title">📈 Evolução de Seguidores</div>
              <svg viewBox="0 0 ${lineChartWidth} ${lineChartHeight}" width="100%" style="max-height: 140px;">
                <line x1="${padding}" y1="${lineChartHeight - padding}" x2="${lineChartWidth - padding}" y2="${lineChartHeight - padding}" stroke="#e5e7eb" stroke-width="1" />
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${lineChartHeight - padding}" stroke="#e5e7eb" stroke-width="1" />
                ${reportChartData.length > 1 ? `<polyline points="${followersPoints}" fill="none" stroke="#8b5cf6" stroke-width="2" />` : ''}
                ${reportChartData.map((d, i) => {
                  const x = padding + (i / Math.max(reportChartData.length - 1, 1)) * (lineChartWidth - 2 * padding)
                  const y = lineChartHeight - padding - (d.followers / maxFollowers) * (lineChartHeight - 2 * padding)
                  return `<circle cx="${x}" cy="${y}" r="3" fill="#8b5cf6" />`
                }).join('')}
                <text x="${padding}" y="${lineChartHeight - padding + 12}" font-size="8" fill="#9ca3af">${reportChartData[0]?.date || ''}</text>
                <text x="${lineChartWidth - padding}" y="${lineChartHeight - padding + 12}" text-anchor="end" font-size="8" fill="#9ca3af">${reportChartData[reportChartData.length - 1]?.date || ''}</text>
                <text x="${padding - 5}" y="${padding + 5}" text-anchor="end" font-size="8" fill="#9ca3af">${formatNum(maxFollowers)}</text>
              </svg>
            </div>
            
            <div class="chart-box">
              <div class="chart-title">👁️ Evolução de Visualizações</div>
              <svg viewBox="0 0 ${lineChartWidth} ${lineChartHeight}" width="100%" style="max-height: 140px;">
                <line x1="${padding}" y1="${lineChartHeight - padding}" x2="${lineChartWidth - padding}" y2="${lineChartHeight - padding}" stroke="#e5e7eb" stroke-width="1" />
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${lineChartHeight - padding}" stroke="#e5e7eb" stroke-width="1" />
                ${reportChartData.length > 1 ? `<polyline points="${viewsPoints}" fill="none" stroke="#ec4899" stroke-width="2" />` : ''}
                ${reportChartData.map((d, i) => {
                  const x = padding + (i / Math.max(reportChartData.length - 1, 1)) * (lineChartWidth - 2 * padding)
                  const y = lineChartHeight - padding - (d.views / maxViews) * (lineChartHeight - 2 * padding)
                  return `<circle cx="${x}" cy="${y}" r="3" fill="#ec4899" />`
                }).join('')}
                <text x="${padding}" y="${lineChartHeight - padding + 12}" font-size="8" fill="#9ca3af">${reportChartData[0]?.date || ''}</text>
                <text x="${lineChartWidth - padding}" y="${lineChartHeight - padding + 12}" text-anchor="end" font-size="8" fill="#9ca3af">${reportChartData[reportChartData.length - 1]?.date || ''}</text>
                <text x="${padding - 5}" y="${padding + 5}" text-anchor="end" font-size="8" fill="#9ca3af">${formatNum(maxViews)}</text>
              </svg>
            </div>
          </div>

          <div class="metrics-section">
            <div class="metrics-title">📊 Métricas de Desempenho</div>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Média Diária (Seguidores)</div>
                <div class="metric-value">${avgDailyFollowers >= 0 ? '+' : ''}${Math.round(avgDailyFollowers).toLocaleString()}</div>
                <div class="metric-sub">seguidores/dia</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Média Diária (Visualizações)</div>
                <div class="metric-value">${avgDailyViews >= 0 ? '+' : ''}${Math.round(avgDailyViews).toLocaleString()}</div>
                <div class="metric-sub">views/dia</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Total de Views Ganhos</div>
                <div class="metric-value">${viewsGained >= 0 ? '+' : ''}${formatNum(viewsGained)}</div>
                <div class="metric-sub">no período</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Dias Monitorados</div>
                <div class="metric-value">${daysBetween}</div>
                <div class="metric-sub">dias</div>
              </div>
            </div>
          </div>

          <div class="projection-section">
            <div class="projection-card purple">
              <div class="projection-label">🎯 Projeção 30 Dias - Seguidores</div>
              <div class="projection-value">${formatNum(Math.round(projectedFollowers))}</div>
              <div class="projection-gain">+${formatNum(Math.round(avgDailyFollowers * 30))} esperados</div>
            </div>
            <div class="projection-card pink">
              <div class="projection-label">🎯 Projeção 30 Dias - Visualizações</div>
              <div class="projection-value">${formatNum(Math.round(projectedViews))}</div>
              <div class="projection-gain">+${formatNum(Math.round(avgDailyViews * 30))} esperadas</div>
            </div>
          </div>

          <div class="chart-title" style="margin-bottom: 8px;">📋 Histórico de Dados (${filteredData.length} registros)</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th style="text-align: right;">Seguidores</th>
                <th style="text-align: right;">Variação</th>
                <th style="text-align: right;">Visualizações</th>
                <th style="text-align: right;">Variação</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((data, idx) => {
                const prevData = idx > 0 ? filteredData[idx - 1] : null
                const followerChange = prevData ? data.followers - prevData.followers : 0
                const viewChange = prevData ? data.views - prevData.views : 0
                return `
                  <tr>
                    <td>${formatDateBR(data?.date ?? new Date())}</td>
                    <td style="text-align: right;">${data?.followers?.toLocaleString() ?? 0}</td>
                    <td style="text-align: right; color: ${followerChange >= 0 ? '#10b981' : '#ef4444'};">
                      ${idx > 0 ? (followerChange >= 0 ? '+' : '') + followerChange.toLocaleString() : '-'}
                    </td>
                    <td style="text-align: right;">${data?.views?.toLocaleString() ?? 0}</td>
                    <td style="text-align: right; color: ${viewChange >= 0 ? '#10b981' : '#ef4444'};">
                      ${idx > 0 ? (viewChange >= 0 ? '+' : '') + viewChange.toLocaleString() : '-'}
                    </td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            MyPages • Relatório para @${page?.username ?? ''} • Gerado em ${formatDateBR(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </body>
        </html>
      `

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html_content: htmlContent,
          filename: `report-${page?.username ?? 'page'}`,
          base_url: typeof window !== 'undefined' ? window.location.origin : ''
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${page?.username ?? 'page'}-${getTodayString()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Erro ao gerar PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erro ao gerar PDF')
    } finally {
      setGenerating(false)
    }
  }

  if (totalRecords === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{page?.name ?? ''}</h1>
            <p className="text-muted-foreground">@{page?.username ?? ''}</p>
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <Calendar className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold mb-3">Nenhum dado registrado</h2>
            <p className="text-muted-foreground mb-6">
              Comece adicionando dados diários para visualizar o dashboard
            </p>
            <Link href={`/pages/${page?.id ?? ''}/add-data`}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Primeiro Registro
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{page?.name ?? ''}</h1>
            <p className="text-muted-foreground">@{page?.username ?? ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/pages/${page?.id ?? ''}/add-data`}>
            <Button variant="outline" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Adicionar Dados
            </Button>
          </Link>
          <Button
            onClick={openReportModal}
            disabled={generating}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Download className="h-4 w-4" />
            {generating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Seguidores Atuais"
          value={totalFollowers}
          icon={Users}
          trend={{
            value: followersGrowth,
            isPositive: followersGrowth > 0
          }}
        />
        <KPICard
          title="Visualizações Atuais"
          value={totalViews}
          icon={Eye}
          trend={{
            value: viewsGrowth,
            isPositive: viewsGrowth > 0
          }}
        />
        <KPICard
          title="Crescimento de Seguidores"
          value={`${followersGrowth.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Total de Registros"
          value={totalRecords}
          icon={Calendar}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Evolução de Seguidores"
          data={chartData}
          dataKeys={[
            { key: "followers", color: "#8B5CF6", name: "Seguidores" }
          ]}
          xAxisKey="date"
          height={400}
        />
        <LineChart
          title="Evolução de Visualizações"
          data={chartData}
          dataKeys={[
            { key: "views", color: "#EC4899", name: "Visualizações" }
          ]}
          xAxisKey="date"
          height={400}
        />
      </div>

      {/* Growth Charts */}
      {growthData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            title="Crescimento Diário de Seguidores (%)"
            data={growthData}
            dataKeys={[
              { key: "followerGrowth", color: "#8B5CF6", name: "Crescimento" }
            ]}
            xAxisKey="date"
            height={400}
          />
          <BarChart
            title="Crescimento Diário de Visualizações (%)"
            data={growthData}
            dataKeys={[
              { key: "viewGrowth", color: "#EC4899", name: "Crescimento" }
            ]}
            xAxisKey="date"
            height={400}
          />
        </div>
      )}

      {/* Metrics Analysis Section */}
      {metricsAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Análise de Métricas</h2>
              <p className="text-sm text-muted-foreground">
                Análise detalhada de desempenho ({metricsAnalysis.dataLength} registros em {metricsAnalysis.daysBetween} dias)
              </p>
            </div>
          </div>

          {/* Insights Cards */}
          {metricsAnalysis.insights.length > 0 && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {metricsAnalysis.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                        insight.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      {insight.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : insight.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        insight.type === 'success' ? 'text-green-800' :
                        insight.type === 'warning' ? 'text-amber-800' :
                        'text-blue-800'
                      }`}>
                        {insight.message}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Growth Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Crescimento Total</span>
                  <Badge variant={metricsAnalysis.totalFollowersGrowth >= 0 ? "default" : "destructive"}>
                    {metricsAnalysis.totalFollowersGrowth >= 0 ? '+' : ''}{metricsAnalysis.totalFollowersGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">
                  {metricsAnalysis.followersGained >= 0 ? '+' : ''}{metricsAnalysis.followersGained.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">seguidores ganhos</p>
              </CardContent>
            </Card>

            {/* Average Daily Growth */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Média Diária</span>
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {metricsAnalysis.avgDailyFollowerGrowth >= 0 ? '+' : ''}{Math.round(metricsAnalysis.avgDailyFollowerGrowth).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">seguidores/dia</p>
              </CardContent>
            </Card>

            {/* Growth Rate */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Taxa Média</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">
                  {metricsAnalysis.avgFollowerGrowthRate >= 0 ? '+' : ''}{metricsAnalysis.avgFollowerGrowthRate.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">crescimento/dia</p>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Engajamento</span>
                  <Eye className="h-4 w-4 text-pink-500" />
                </div>
                <p className="text-2xl font-bold">
                  {metricsAnalysis.viewsPerFollower.toFixed(1)}x
                </p>
                <p className="text-xs text-muted-foreground">visualizações/seguidor</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Tendências Recentes
                </CardTitle>
                <CardDescription>Comparação dos últimos 7 dias vs os 7 dias anteriores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Seguidores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {metricsAnalysis.followersTrend === 'up' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Subindo</Badge>
                      </>
                    ) : metricsAnalysis.followersTrend === 'down' ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Caindo</Badge>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-gray-600" />
                        <Badge variant="secondary">Estável</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-pink-500" />
                    <span className="font-medium">Visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {metricsAnalysis.viewsTrend === 'up' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Subindo</Badge>
                      </>
                    ) : metricsAnalysis.viewsTrend === 'down' ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Caindo</Badge>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-gray-600" />
                        <Badge variant="secondary">Estável</Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projections Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-pink-500" />
                  Projeção (30 dias)
                </CardTitle>
                <CardDescription>Estimativa baseada no crescimento médio atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Seguidores Projetados</p>
                    <p className="text-xl font-bold text-purple-700">
                      {Math.round(metricsAnalysis.projectedFollowers).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ganho Esperado</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{Math.round(metricsAnalysis.avgDailyFollowerGrowth * 30).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Visualizações Projetadas</p>
                    <p className="text-xl font-bold text-pink-700">
                      {Math.round(metricsAnalysis.projectedViews).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ganho Esperado</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{Math.round(metricsAnalysis.avgDailyViewsGrowth * 30).toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* Consistency Score */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Consistência de Crescimento</span>
                    <span className="text-sm font-bold">{Math.round(metricsAnalysis.consistencyScore)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        metricsAnalysis.consistencyScore > 70 ? 'bg-green-500' :
                        metricsAnalysis.consistencyScore > 40 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${metricsAnalysis.consistencyScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metricsAnalysis.consistencyScore > 70 ? 'Crescimento muito consistente' :
                     metricsAnalysis.consistencyScore > 40 ? 'Crescimento moderadamente consistente' :
                     'Crescimento irregular'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Views Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-pink-500" />
                Análise de Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-700">
                    {metricsAnalysis.totalViewsGrowth >= 0 ? '+' : ''}{metricsAnalysis.totalViewsGrowth.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Crescimento Total</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-700">
                    {metricsAnalysis.viewsGained >= 0 ? '+' : ''}{metricsAnalysis.viewsGained.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Visualizações Ganhas</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-700">
                    {Math.round(metricsAnalysis.avgDailyViewsGrowth).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Média Diária</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-700">
                    {metricsAnalysis.avgViewsGrowthRate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Taxa Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Data History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Dados</span>
            <span className="text-sm font-normal text-muted-foreground">
              {dailyData.length} registro(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Seguidores</TableHead>
                  <TableHead className="text-right">Visualizações</TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...dailyData].reverse().map((data) => {
                  const dateStr = formatDateBR(data?.date ?? new Date())
                  return (
                    <TableRow key={data.id}>
                      <TableCell className="font-medium">{dateStr}</TableCell>
                      <TableCell className="text-right">{data.followers.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{data.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDataModal(data)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteData(data.id, dateStr)}
                            disabled={deleting === data.id}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Data Modal */}
      <Dialog open={!!editingData} onOpenChange={(open) => !open && setEditingData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Dados</DialogTitle>
            <DialogDescription>
              Corrija as informações do registro
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDataSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-data-date">Data</Label>
              <Input
                id="edit-data-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-data-followers">Seguidores</Label>
              <Input
                id="edit-data-followers"
                type="number"
                min="0"
                value={editForm.followers}
                onChange={(e) => setEditForm({ ...editForm, followers: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-data-views">Visualizações</Label>
              <Input
                id="edit-data-views"
                type="number"
                min="0"
                value={editForm.views}
                onChange={(e) => setEditForm({ ...editForm, views: e.target.value })}
                required
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
                onClick={() => setEditingData(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Configuration Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Gerar Relatório
            </DialogTitle>
            <DialogDescription>
              Configure o período para o relatório de @{page?.username ?? ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Período do Relatório</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-start" className="text-xs text-muted-foreground">Data de Início</Label>
                  <Input
                    id="report-start"
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-end" className="text-xs text-muted-foreground">Data de Fim</Label>
                  <Input
                    id="report-end"
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe em branco para incluir todos os dados
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-800">
                <strong>📊 O relatório incluirá:</strong>
              </p>
              <ul className="text-xs text-purple-700 mt-2 space-y-1">
                <li>• KPIs de seguidores e visualizações</li>
                <li>• Gráficos de evolução</li>
                <li>• Métricas de desempenho</li>
                <li>• Projeções de 30 dias</li>
                <li>• Histórico completo de dados</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowReportModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 gap-2"
              onClick={handleExportPDF}
              disabled={generating}
            >
              <Download className="h-4 w-4" />
              {generating ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}