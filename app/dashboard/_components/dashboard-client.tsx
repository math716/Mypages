"use client"

import { useState, useMemo } from "react"
import { KPICard } from "@/components/kpi-card"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, Eye, TrendingUp, Instagram, Download, Filter, FileText, Link2, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { formatDateBR, formatDateShort, parseLocalDate, getTodayString } from "@/lib/utils"
import { PlatformSelector } from "@/components/platform-selector"
import { Platform, PLATFORMS } from "@/lib/platforms"
import { ConnectPlatformModal } from "@/app/pages/_components/connect-platform-modal"

interface MediaPost {
  id: string
  platformPostId: string
  mediaType: string
  mediaUrl?: string | null
  thumbnailUrl?: string | null
  permalink?: string | null
  caption?: string | null
  publishedAt?: Date | null
  likes: number
  comments: number
}

interface Page {
  id: string
  name: string
  username: string
  coverImage?: string | null
  platform?: string
  dailyData: {
    id: string
    date: Date
    followers: number
    views: number
  }[]
  mediaPosts?: MediaPost[]
}

interface QuickSelectGroup {
  name: string
  usernames: string[]
}

interface DashboardClientProps {
  pages: Page[]
  quickSelectGroups?: QuickSelectGroup[]
}

export function DashboardClient({ pages, quickSelectGroups = [] }: DashboardClientProps) {
  // Platform selection state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram')
  
  // Filter pages by platform
  const platformPages = useMemo(() => {
    return pages?.filter(p => (p.platform || 'instagram') === selectedPlatform) ?? []
  }, [pages, selectedPlatform])
  const [generating, setGenerating] = useState(false)
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>(pages?.map(p => p.id) ?? [])
  const [showFilter, setShowFilter] = useState(false)
  const [isChangingPlatform, setIsChangingPlatform] = useState(false)
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportPageIds, setReportPageIds] = useState<string[]>(pages?.map(p => p.id) ?? [])
  const [reportStartDate, setReportStartDate] = useState("")
  const [reportEndDate, setReportEndDate] = useState("")

  // Connect platform modal state
  const [showConnectModal, setShowConnectModal] = useState(false)

  // Period filter for highlights cards
  const [highlightPeriod, setHighlightPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')

  // Platforms that support OAuth connection
  const oauthPlatforms: Platform[] = ['instagram', 'facebook', 'tiktok', 'threads']
  const isOAuthPlatform = oauthPlatforms.includes(selectedPlatform)

  // Handle platform change with loading state
  const handlePlatformChange = (platform: Platform) => {
    setIsChangingPlatform(true)
    setSelectedPlatform(platform)
    // Reset selection to all pages of the new platform
    const newPlatformPages = pages?.filter(p => (p.platform || 'instagram') === platform) ?? []
    setSelectedPageIds(newPlatformPages.map(p => p.id))
    setTimeout(() => setIsChangingPlatform(false), 300)
  }

  // Filtered pages based on selection (within current platform)
  const filteredPages = useMemo(() => {
    return platformPages?.filter(p => selectedPageIds.includes(p.id)) ?? []
  }, [platformPages, selectedPageIds])

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

  // Report page toggles
  const toggleReportPage = (pageId: string) => {
    setReportPageIds(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    )
  }

  const selectAllReportPages = () => {
    setReportPageIds(platformPages?.map(p => p.id) ?? [])
  }

  const deselectAllReportPages = () => {
    setReportPageIds([])
  }

  // Calculate total metrics (using filtered pages for calculations, platform pages for total count)
  const totalPages = platformPages?.length ?? 0
  const selectedPagesCount = filteredPages?.length ?? 0
  
  const totalFollowers = filteredPages?.reduce((sum, page) => {
    const latest = page?.dailyData?.[page?.dailyData?.length - 1]
    return sum + (latest?.followers ?? 0)
  }, 0) ?? 0

  const totalViews = filteredPages?.reduce((sum, page) => {
    const latest = page?.dailyData?.[page?.dailyData?.length - 1]
    return sum + (latest?.views ?? 0)
  }, 0) ?? 0

  // Calculate growth trend
  const calculateGrowth = () => {
    let totalGrowth = 0
    let pagesWithData = 0

    filteredPages?.forEach(page => {
      if ((page?.dailyData?.length ?? 0) >= 2) {
        const latest = page?.dailyData?.[page?.dailyData?.length - 1]
        const previous = page?.dailyData?.[page?.dailyData?.length - 2]
        if (latest && previous && previous.followers > 0) {
          const growth = ((latest.followers - previous.followers) / previous.followers) * 100
          totalGrowth += growth
          pagesWithData++
        }
      }
    })

    return pagesWithData > 0 ? totalGrowth / pagesWithData : 0
  }

  const avgGrowth = calculateGrowth()

  // Unified cross-platform metrics and insights
  const unifiedPages = useMemo(() => pages ?? [], [pages])

  const totalPagesAllPlatforms = unifiedPages.length

  const totalFollowersAllPlatforms = useMemo(() => {
    return unifiedPages.reduce((sum, page) => {
      const latest = page?.dailyData?.[page?.dailyData?.length - 1]
      return sum + (latest?.followers ?? 0)
    }, 0)
  }, [unifiedPages])

  const totalViewsAllPlatforms = useMemo(() => {
    return unifiedPages.reduce((sum, page) => {
      const latest = page?.dailyData?.[page?.dailyData?.length - 1]
      return sum + (latest?.views ?? 0)
    }, 0)
  }, [unifiedPages])

  const platformSummary = useMemo(() => {
    const keys: Platform[] = ['instagram', 'tiktok', 'facebook', 'x', 'kawaii']
    return keys.map((platformKey) => {
      const pgs = unifiedPages.filter(p => (p.platform || 'instagram') === platformKey)
      const followers = pgs.reduce((sum, page) => {
        const latest = page?.dailyData?.[page?.dailyData?.length - 1]
        return sum + (latest?.followers ?? 0)
      }, 0)
      const views = pgs.reduce((sum, page) => {
        const latest = page?.dailyData?.[page?.dailyData?.length - 1]
        return sum + (latest?.views ?? 0)
      }, 0)

      return {
        platform: platformKey,
        pages: pgs.length,
        followers,
        views
      }
    })
  }, [unifiedPages])

  type RelevantCandidate = {
    pageId: string
    pageName: string
    username: string
    platform: string
    coverImage?: string | null
    postThumbnail?: string | null
    postPermalink?: string | null
    followers: number
    views: number
    followersGrowth: number
    score: number
    date: Date
  }

  const mostRelevantContent = useMemo<RelevantCandidate | null>(() => {
    const now = new Date()
    const periodMs: Record<string, number> = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }
    const cutoff = new Date(now.getTime() - periodMs[highlightPeriod])

    let best: RelevantCandidate | null = null

    filteredPages?.forEach((page) => {
      const inRange = (page?.dailyData ?? []).filter((d) => {
        const dt = d?.date ? new Date(d.date) : null
        return !!dt && dt >= cutoff && dt <= now
      })
      if (inRange.length === 0) return

      const latest = inRange[inRange.length - 1]
      const previous = inRange.length >= 2 ? inRange[inRange.length - 2] : undefined
      const followers = latest?.followers ?? 0
      const views = inRange.reduce((sum, d) => sum + (d?.views ?? 0), 0)
      const followersGrowth = previous ? followers - (previous?.followers ?? 0) : 0
      const score = (views * 0.7) + (Math.max(followersGrowth, 0) * 0.3)

      // Pick best post thumbnail (most likes+comments in this page)
      const bestPost = (page.mediaPosts ?? []).reduce((top: any, p: any) => {
        const eng = (p.likes || 0) + (p.comments || 0)
        return !top || eng > (top.likes + top.comments) ? p : top
      }, null)

      if (!best || score > best.score) {
        best = {
          pageId: page.id,
          pageName: page.name,
          username: page.username,
          platform: page.platform || 'instagram',
          coverImage: page.coverImage,
          postThumbnail: bestPost?.thumbnailUrl || null,
          postPermalink: bestPost?.permalink || null,
          followers,
          views,
          followersGrowth,
          score,
          date: latest?.date ? new Date(latest.date) : new Date()
        }
      }
    })

    return best
  }, [filteredPages, highlightPeriod])

  type Candidate24h = {
    pageId: string
    pageName: string
    username: string
    platform: string
    coverImage?: string | null
    postThumbnail?: string | null
    postPermalink?: string | null
    views: number
    followers: number
    date: Date
  }

  const mostViewedByPeriod = useMemo<Candidate24h | null>(() => {
    const now = new Date()
    const periodMs: Record<string, number> = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }
    const cutoff = new Date(now.getTime() - periodMs[highlightPeriod])

    let best: Candidate24h | null = null

    filteredPages?.forEach((page) => {
      const inRange = (page?.dailyData ?? []).filter((d) => {
        const dt = d?.date ? new Date(d.date) : null
        return !!dt && dt >= cutoff && dt <= now
      })

      const totalViews = inRange.reduce((sum, d) => sum + (d?.views ?? 0), 0)
      const latest = inRange[inRange.length - 1]
      if (!latest) return

      const bestPost = (page.mediaPosts ?? []).reduce((top: any, p: any) => {
        const eng = (p.likes || 0) + (p.comments || 0)
        return !top || eng > (top.likes + top.comments) ? p : top
      }, null)

      const candidate: Candidate24h = {
        pageId: page.id,
        pageName: page.name,
        username: page.username,
        platform: page.platform || 'instagram',
        coverImage: page.coverImage,
        postThumbnail: bestPost?.thumbnailUrl || null,
        postPermalink: bestPost?.permalink || null,
        views: totalViews,
        followers: latest?.followers ?? 0,
        date: latest?.date ? new Date(latest.date) : new Date()
      }

      if (!best || candidate.views > best.views) {
        best = candidate
      }
    })

    return best
  }, [filteredPages, highlightPeriod])

  // Prepare chart data - Aggregate filtered pages with proper date sorting
  const chartData = useMemo(() => {
    const dateMap = new Map<string, { dateObj: Date, date: string, followers: number, views: number }>()

    filteredPages?.forEach(page => {
      page?.dailyData?.forEach(d => {
        const dateObj = parseLocalDate(d?.date ?? new Date())
        const isoDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        const displayDate = formatDateShort(d?.date ?? new Date())
        
        if (!dateMap.has(isoDate)) {
          dateMap.set(isoDate, { dateObj, date: displayDate, followers: 0, views: 0 })
        }
        const existing = dateMap.get(isoDate)
        if (existing) {
          existing.followers += d?.followers ?? 0
          existing.views += d?.views ?? 0
        }
      })
    })

    // Sort by date and return
    return Array.from(dateMap.entries())
      .sort((a, b) => a[1].dateObj.getTime() - b[1].dateObj.getTime())
      .map(([, value]) => ({ date: value.date, followers: value.followers, views: value.views }))
  }, [filteredPages])

  // Prepare per-page comparison data (latest data)
  const pageComparisonData = useMemo(() => {
    return filteredPages?.map(page => {
      const latest = page?.dailyData?.[page?.dailyData?.length - 1]
      return {
        name: page?.name ?? '',
        followers: latest?.followers ?? 0,
        views: latest?.views ?? 0
      }
    }) ?? []
  }, [filteredPages])

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    return filteredPages?.map(page => {
      const latest = page?.dailyData?.[page?.dailyData?.length - 1]
      return {
        name: page?.name ?? '',
        value: latest?.followers ?? 0
      }
    }) ?? []
  }, [filteredPages])

  const openReportModal = () => {
    setReportPageIds(selectedPageIds)
    setReportStartDate("")
    setReportEndDate("")
    setShowReportModal(true)
  }

  const handleExportPDF = async () => {
    if (reportPageIds.length === 0) {
      alert('Selecione ao menos uma página para o relatório')
      return
    }

    setGenerating(true)
    setShowReportModal(false)

    try {
      // Filter pages for report
      const reportPages = pages?.filter(p => reportPageIds.includes(p.id)) ?? []
      
      // Filter data by date range if specified
      const filterDataByDate = (data: any[]) => {
        if (!reportStartDate && !reportEndDate) return data
        return data.filter(d => {
          const date = new Date(d.date)
          if (reportStartDate && date < new Date(reportStartDate)) return false
          if (reportEndDate && date > new Date(reportEndDate)) return false
          return true
        })
      }

      // Calculate report metrics
      const reportFollowers = reportPages.reduce((sum, page) => {
        const filteredData = filterDataByDate(page.dailyData)
        const latest = filteredData[filteredData.length - 1]
        return sum + (latest?.followers ?? 0)
      }, 0)

      const reportViews = reportPages.reduce((sum, page) => {
        const filteredData = filterDataByDate(page.dailyData)
        const latest = filteredData[filteredData.length - 1]
        return sum + (latest?.views ?? 0)
      }, 0)

      // Prepare chart data for report
      const reportChartData: { date: string, followers: number, views: number }[] = []
      const dateMap = new Map<string, { followers: number, views: number }>()

      reportPages.forEach(page => {
        const filteredData = filterDataByDate(page.dailyData)
        filteredData.forEach(d => {
          const dateObj = parseLocalDate(d.date)
          const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
          
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { followers: 0, views: 0 })
          }
          const existing = dateMap.get(dateKey)!
          existing.followers += d.followers ?? 0
          existing.views += d.views ?? 0
        })
      })

      Array.from(dateMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([key, value]) => {
          reportChartData.push({
            date: formatDateShort(key),
            followers: value.followers,
            views: value.views
          })
        })

      // Generate pie chart SVG
      const pieData = reportPages.map(page => {
        const filteredData = filterDataByDate(page.dailyData)
        const latest = filteredData[filteredData.length - 1]
        return { name: page.name, username: page.username, value: latest?.followers ?? 0, views: latest?.views ?? 0 }
      }).sort((a, b) => b.value - a.value)

      const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0)
      const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#84cc16', '#06b6d4']
      
      let pieAngle = 0
      const pieSlices = pieData.map((d, i) => {
        const percentage = pieTotal > 0 ? d.value / pieTotal : 0
        const startAngle = pieAngle
        const endAngle = pieAngle + percentage * 360
        pieAngle = endAngle
        
        const startRad = (startAngle - 90) * Math.PI / 180
        const endRad = (endAngle - 90) * Math.PI / 180
        const largeArc = percentage > 0.5 ? 1 : 0
        
        const x1 = 100 + 70 * Math.cos(startRad)
        const y1 = 100 + 70 * Math.sin(startRad)
        const x2 = 100 + 70 * Math.cos(endRad)
        const y2 = 100 + 70 * Math.sin(endRad)
        
        return { ...d, percentage, color: COLORS[i % COLORS.length], path: `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z` }
      })

      // Generate line chart SVG for followers
      const lineChartWidth = 280
      const lineChartHeight = 140
      const padding = 30
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

      // Format large numbers
      const formatNum = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
        return n.toString()
      }

      const dateRange = reportStartDate || reportEndDate
        ? `${reportStartDate ? formatDateBR(reportStartDate) : 'Início'} - ${reportEndDate ? formatDateBR(reportEndDate) : 'Atual'}`
        : 'Todos os dados'

      // Determine if we need compact mode (many pages)
      const isCompactMode = reportPages.length > 10

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
            .header-text h1 { color: #8b5cf6; font-size: 20px; margin-bottom: 2px; }
            .header-text .subtitle { color: #6b7280; font-size: 10px; }
            
            .kpi-row { display: flex; gap: 10px; margin-bottom: 15px; }
            .kpi-card { flex: 1; background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
            .kpi-title { color: #6b7280; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
            .kpi-value { font-size: 18px; font-weight: 700; color: #111827; }
            
            .charts-section { display: flex; gap: 12px; margin-bottom: 15px; }
            .chart-box { flex: 1; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
            .chart-title { font-size: 10px; font-weight: 600; color: #374151; margin-bottom: 8px; text-align: center; }
            
            .legend-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; margin-top: 8px; }
            .legend-item { display: flex; align-items: center; gap: 4px; font-size: 8px; }
            .legend-color { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
            
            .section-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
            
            .pages-grid { display: grid; grid-template-columns: repeat(${isCompactMode ? 3 : 2}, 1fr); gap: 8px; }
            .page-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; }
            .page-name { font-weight: 600; font-size: 10px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .page-username { font-size: 8px; color: #6b7280; margin-bottom: 4px; }
            .page-stats { display: flex; justify-content: space-between; }
            .page-stat { text-align: center; }
            .page-stat-value { font-weight: 700; font-size: 11px; color: #8b5cf6; }
            .page-stat-label { font-size: 7px; color: #9ca3af; text-transform: uppercase; }
            
            .footer { margin-top: 15px; text-align: center; color: #9ca3af; font-size: 8px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${process.env.NEXTAUTH_URL || ''}/logo.jpg" class="logo" alt="MyPages" onerror="this.style.display='none'" />
            <div class="header-text">
              <h1>MyPages - Report</h1>
              <div class="subtitle">${dateRange} • Generated on ${formatDateBR(new Date(), { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-title">Páginas</div>
              <div class="kpi-value">${reportPages.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Seguidores</div>
              <div class="kpi-value">${formatNum(reportFollowers)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Visualizações</div>
              <div class="kpi-value">${formatNum(reportViews)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Registros</div>
              <div class="kpi-value">${reportChartData.length}</div>
            </div>
          </div>

          <div class="charts-section">
            <div class="chart-box">
              <div class="chart-title">📊 Distribuição de Seguidores</div>
              <svg viewBox="0 0 200 200" width="100%" style="max-height: 120px;">
                ${pieSlices.map(slice => `<path d="${slice.path}" fill="${slice.color}" stroke="#fff" stroke-width="1" />`).join('')}
                <circle cx="100" cy="100" r="30" fill="white" />
              </svg>
              <div class="legend-grid">
                ${pieSlices.slice(0, 6).map(slice => `
                  <div class="legend-item">
                    <div class="legend-color" style="background: ${slice.color}"></div>
                    <span>${slice.name.substring(0, 12)}${slice.name.length > 12 ? '..' : ''} ${(slice.percentage * 100).toFixed(0)}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="chart-box">
              <div class="chart-title">📈 Crescimento de Seguidores</div>
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
                <text x="${padding - 5}" y="${padding}" text-anchor="end" font-size="8" fill="#9ca3af">${formatNum(maxFollowers)}</text>
              </svg>
            </div>
            
            <div class="chart-box">
              <div class="chart-title">👁️ Crescimento de Visualizações</div>
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
                <text x="${padding - 5}" y="${padding}" text-anchor="end" font-size="8" fill="#9ca3af">${formatNum(maxViews)}</text>
              </svg>
            </div>
          </div>

          <div class="section-title">📋 Páginas (${reportPages.length})</div>
          <div class="pages-grid">
            ${pieData.map((item, idx) => `
              <div class="page-card">
                <div class="page-name" style="color: ${COLORS[idx % COLORS.length]}">● ${item.name}</div>
                <div class="page-username">@${item.username}</div>
                <div class="page-stats">
                  <div class="page-stat">
                    <div class="page-stat-value">${formatNum(item.value)}</div>
                    <div class="page-stat-label">Seguidores</div>
                  </div>
                  <div class="page-stat">
                    <div class="page-stat-value">${formatNum(item.views)}</div>
                    <div class="page-stat-label">Visualizações</div>
                  </div>
                  <div class="page-stat">
                    <div class="page-stat-value">${pieTotal > 0 ? ((item.value / pieTotal) * 100).toFixed(0) : 0}%</div>
                    <div class="page-stat-label">Participação</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            MyPages • Relatório gerado em ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
        </html>
      `

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html_content: htmlContent,
          filename: 'relatorio-mypages',
          base_url: process.env.NEXTAUTH_URL || window.location.origin
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-mypages-${getTodayString()}.pdf`
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

  if (totalPages === 0) {
    return (
      <div className="space-y-8">
        {/* Platform Selector - always visible */}
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

        {/* Empty state message */}
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative h-40 w-40 mx-auto mb-6 flex items-center justify-center">
              {selectedPlatform === 'instagram' && (
                <svg className="w-full h-full opacity-20" viewBox="0 0 24 24" fill="url(#igGradientDash)">
                  <defs>
                    <linearGradient id="igGradientDash" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              )}
              {selectedPlatform === 'threads' && (
                <svg className="w-full h-full opacity-20 text-black" viewBox="0 0 192 192" fill="currentColor">
                  <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.347-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 6.981 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96c.223 28.685 6.88 51.515 19.788 67.92 14.504 18.437 36.094 27.884 64.172 28.08h.113c24.986-.171 42.127-11.619 54.167-23.565 18.337-18.324 17.756-41.146 11.733-55.208-4.24-9.886-12.208-17.98-21.437-23.239Zm-30.96 43.348c-5.461 6.148-13.501 9.37-23.882 9.579-10.735.207-19.763-3.519-23.613-9.581-2.332-3.69-3.363-8.025-2.908-12.382.803-7.742 6.574-13.254 16.186-15.499 3.928-.924 8.202-1.38 12.744-1.363 3.928.014 7.664.326 11.158.92 1.085.188 2.137.398 3.155.628-.916 13.004-4.789 21.597-12.84 27.698Z"/>
                </svg>
              )}
              {selectedPlatform === 'x' && (
                <svg className="w-full h-full opacity-20 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.033 9.176 9.45 12.518H16.6l-5.793-7.57-6.63 7.57H.5l8.59-9.812L0 1.153h7.586l5.243 6.932 6.072-6.932zm-1.29 19.494h2.04L6.478 3.24H4.29l13.32 17.407z"/>
                </svg>
              )}
              {selectedPlatform === 'tiktok' && (
                <svg className="w-full h-full opacity-20 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              )}
              {selectedPlatform === 'facebook' && (
                <svg className="w-full h-full opacity-20 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.018 4.388 11.007 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.686 4.533-4.686 1.312 0 2.686.236 2.686.236v2.963h-1.514c-1.492 0-1.956.93-1.956 1.887v2.26h3.328l-.532 3.49h-2.796V24C19.612 23.08 24 18.091 24 12.073z"/>
                </svg>
              )}
              {selectedPlatform === 'kawaii' && (
                <svg className="w-full h-full opacity-20 text-[#FF6B00]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4v16l14-8L6 4z"/>
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">Nenhuma página cadastrada para {PLATFORMS[selectedPlatform].name}</h2>
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
                <Button className={PLATFORMS[selectedPlatform].bgColor}>
                  Adicionar Primeira Página
                </Button>
              </Link>
            )}

          </motion.div>
        </div>

        {/* Connect Platform Modal (early return) */}
        <ConnectPlatformModal
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          platform={selectedPlatform}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
          <h1 className="text-3xl font-bold mb-2">
            Dashboard {PLATFORMS[selectedPlatform].name}
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada de todas as suas páginas
            {selectedPagesCount < totalPages && (
              <span className="ml-2 text-purple-600 font-medium">
                ({selectedPagesCount} de {totalPages} páginas selecionadas)
              </span>
            )}
            {totalPages === 0 && (
              <span className="ml-2 text-orange-600 font-medium">
                (Nenhuma página cadastrada para {PLATFORMS[selectedPlatform].name})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilter(!showFilter)}
            variant="outline"
            className="gap-2"
            disabled={totalPages === 0}
          >
            <Filter className="h-4 w-4" />
            Filtrar Páginas
          </Button>
          <Button
            onClick={openReportModal}
            disabled={generating || totalPages === 0}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <FileText className="h-4 w-4" />
            {generating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>
      </div>

      {/* Page Filter */}
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">Selecionar Páginas</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Selecionar Todas
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAll}>
                    Limpar Seleção
                  </Button>
                </div>
              </div>

              {/* Quick Select Buttons */}
              {quickSelectGroups.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t">
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {platformPages?.map(page => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPageIds.includes(page.id)
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => togglePage(page.id)}
                  >
                    <Checkbox
                      checked={selectedPageIds.includes(page.id)}
                      onCheckedChange={() => togglePage(page.id)}
                    />
                    {page.coverImage ? (
                      <img
                        src={page.coverImage}
                        alt={page.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${PLATFORMS[selectedPlatform].bgColor}`}>
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{page.name}</p>
                      <p className="text-xs text-muted-foreground truncate">@{page.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Period filter shared by both highlight cards */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground font-medium">Período:</span>
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setHighlightPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                highlightPeriod === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {{ day: 'Dia', week: 'Semana', month: 'Mês', year: 'Ano' }[p]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Relevant Content */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Mais Relevante</CardTitle>
            </CardHeader>
            <CardContent>
              {mostRelevantContent ? (
                <div className="flex gap-4">
                  {(mostRelevantContent.postThumbnail || mostRelevantContent.coverImage) && (
                    <a
                      href={mostRelevantContent.postPermalink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <div className="w-16 rounded-lg overflow-hidden border hover:opacity-90 transition-opacity" style={{ aspectRatio: '9/16' }}>
                        <img
                          src={mostRelevantContent.postThumbnail || mostRelevantContent.coverImage!}
                          alt={mostRelevantContent.pageName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </a>
                  )}
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold truncate">{mostRelevantContent.pageName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{mostRelevantContent.username} • {PLATFORMS[(mostRelevantContent.platform as Platform)]?.name ?? mostRelevantContent.platform}
                    </p>
                    <div className="text-sm space-y-0.5">
                      <p><span className="font-medium">Visualizações:</span> {mostRelevantContent.views.toLocaleString()}</p>
                      <p><span className="font-medium">Seguidores:</span> {mostRelevantContent.followers.toLocaleString()}</p>
                      <p><span className="font-medium">Crescimento:</span> <span className={mostRelevantContent.followersGrowth >= 0 ? 'text-green-600' : 'text-red-500'}>{mostRelevantContent.followersGrowth >= 0 ? '+' : ''}{mostRelevantContent.followersGrowth.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum dado para o período selecionado.</p>
              )}
            </CardContent>
          </Card>

          {/* Most Watched Video */}
          <Card>
            <CardHeader>
              <CardTitle>Vídeo Mais Assistido</CardTitle>
            </CardHeader>
            <CardContent>
              {mostViewedByPeriod !== null ? (
                <div className="flex gap-4">
                  {(mostViewedByPeriod.postThumbnail || mostViewedByPeriod.coverImage) && (
                    <a
                      href={mostViewedByPeriod.postPermalink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <div className="w-16 rounded-lg overflow-hidden border hover:opacity-90 transition-opacity" style={{ aspectRatio: '9/16' }}>
                        <img
                          src={mostViewedByPeriod.postThumbnail || mostViewedByPeriod.coverImage!}
                          alt={mostViewedByPeriod.pageName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </a>
                  )}
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold truncate">{mostViewedByPeriod.pageName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{mostViewedByPeriod.username} • {PLATFORMS[(mostViewedByPeriod.platform as Platform)]?.name ?? mostViewedByPeriod.platform}
                    </p>
                    <div className="text-sm space-y-0.5">
                      <p><span className="font-medium">Visualizações:</span> {mostViewedByPeriod.views.toLocaleString()}</p>
                      <p><span className="font-medium">Seguidores:</span> {mostViewedByPeriod.followers.toLocaleString()}</p>
                      <p><span className="font-medium">Data:</span> {formatDateBR(mostViewedByPeriod.date)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado para este período.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedPagesCount === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma página selecionada</h3>
          <p className="text-muted-foreground mb-4">
            Selecione ao menos uma página para ver os dados
          </p>
          <Button onClick={selectAll} variant="outline">
            Selecionar Todas as Páginas
          </Button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Páginas Selecionadas"
              value={selectedPagesCount}
              icon={Instagram}
            />
            <KPICard
              title="Total de Seguidores"
              value={totalFollowers}
              icon={Users}
            />
            <KPICard
              title="Total de Visualizações"
              value={totalViews}
              icon={Eye}
            />
            <KPICard
              title="Crescimento Médio"
              value={`${avgGrowth.toFixed(1)}%`}
              icon={TrendingUp}
              trend={{
                value: avgGrowth,
                isPositive: avgGrowth > 0
              }}
            />
          </div>

          {/* Pie Chart + Line Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Distribuição de Seguidores</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} />
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <LineChart
                  title="Crescimento de Seguidores"
                  data={chartData}
                  dataKeys={[
                    { key: "followers", color: "#8B5CF6", name: "Seguidores" }
                  ]}
                  xAxisKey="date"
                />
              </CardContent>
            </Card>
          </div>

          {/* More Charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                title="Crescimento de Visualizações"
                data={chartData}
                dataKeys={[
                  { key: "views", color: "#EC4899", name: "Visualizações" }
                ]}
                xAxisKey="date"
              />
              <BarChart
                title="Comparação de Seguidores por Página"
                data={pageComparisonData}
                dataKeys={[
                  { key: "followers", color: "#8B5CF6", name: "Seguidores" }
                ]}
                xAxisKey="name"
              />
            </div>
          )}

          {/* Page Comparison */}
          {pageComparisonData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                title="Comparação de Visualizações por Página"
                data={pageComparisonData}
                dataKeys={[
                  { key: "views", color: "#EC4899", name: "Visualizações" }
                ]}
                xAxisKey="name"
              />
              <Card>
                <CardHeader>
                  <CardTitle>Resumo das Páginas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPages?.map(page => {
                      const latest = page?.dailyData?.[page?.dailyData?.length - 1]
                      return (
                        <div key={page.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {page.coverImage ? (
                            <img
                              src={page.coverImage}
                              alt={page.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <Instagram className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{page.name}</p>
                            <p className="text-sm text-muted-foreground">@{page.username}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">{(latest?.followers ?? 0).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">seguidores</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/pages">
          <Button variant="outline" className="w-full h-24 text-lg">
            <div className="flex flex-col items-center gap-2">
              <Instagram className="h-6 w-6" />
              Gerenciar Páginas
            </div>
          </Button>
        </Link>
        <Button variant="outline" className="w-full h-24 text-lg" onClick={() => setShowConnectModal(true)}>
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            Adicionar Página
          </div>
        </Button>
        <Link href="/compare">
          <Button variant="outline" className="w-full h-24 text-lg">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Comparar Períodos
            </div>
          </Button>
        </Link>
      </div>

      {/* Connect Platform Modal */}
      <ConnectPlatformModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        platform={selectedPlatform}
      />

      {/* Report Configuration Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Configurar Relatório
            </DialogTitle>
            <DialogDescription>
              Escolha as páginas e o período para o relatório em PDF
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Período do Relatório</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-start" className="text-xs text-muted-foreground">Data Inicial</Label>
                  <Input
                    id="report-start"
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-end" className="text-xs text-muted-foreground">Data Final</Label>
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

            {/* Page Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Páginas do Relatório</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllReportPages} className="h-7 text-xs">
                    Todas
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllReportPages} className="h-7 text-xs">
                    Nenhuma
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                {pages?.map(page => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      reportPageIds.includes(page.id)
                        ? "bg-purple-50 border border-purple-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleReportPage(page.id)}
                  >
                    <Checkbox
                      checked={reportPageIds.includes(page.id)}
                      onCheckedChange={() => toggleReportPage(page.id)}
                    />
                    {page.coverImage ? (
                      <img
                        src={page.coverImage}
                        alt={page.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{page.name}</p>
                      <p className="text-xs text-muted-foreground">@{page.username}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportPageIds.length} de {pages?.length ?? 0} páginas selecionadas
              </p>
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
              disabled={reportPageIds.length === 0 || generating}
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