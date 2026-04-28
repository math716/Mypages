"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KPICard } from "@/components/kpi-card"
import { BarChart } from "@/components/charts/bar-chart"
import { Users, Eye, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { formatDateBR, parseLocalDate } from "@/lib/utils"

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
  dailyData: DailyData[]
}

interface CompareClientProps {
  pages: Page[]
}

interface PeriodData {
  totalFollowers: number
  totalViews: number
  avgFollowers: number
  avgViews: number
  dataPoints: number
}

export function CompareClient({ pages }: CompareClientProps) {
  const [period1Start, setPeriod1Start] = useState("")
  const [period1End, setPeriod1End] = useState("")
  const [period2Start, setPeriod2Start] = useState("")
  const [period2End, setPeriod2End] = useState("")
  const [comparing, setComparing] = useState(false)

  // Calculate data for a period
  const calculatePeriodData = (startDate: string, endDate: string): PeriodData => {
    const start = parseLocalDate(startDate)
    const end = parseLocalDate(endDate)

    let totalFollowers = 0
    let totalViews = 0
    let dataPoints = 0

    pages?.forEach(page => {
      page?.dailyData?.forEach(data => {
        const date = parseLocalDate(data?.date ?? new Date())
        if (date >= start && date <= end) {
          totalFollowers += data?.followers ?? 0
          totalViews += data?.views ?? 0
          dataPoints++
        }
      })
    })

    return {
      totalFollowers,
      totalViews,
      avgFollowers: dataPoints > 0 ? totalFollowers / dataPoints : 0,
      avgViews: dataPoints > 0 ? totalViews / dataPoints : 0,
      dataPoints
    }
  }

  const period1Data = useMemo(() => {
    if (!period1Start || !period1End || !comparing) return null
    return calculatePeriodData(period1Start, period1End)
  }, [period1Start, period1End, comparing, pages])

  const period2Data = useMemo(() => {
    if (!period2Start || !period2End || !comparing) return null
    return calculatePeriodData(period2Start, period2End)
  }, [period2Start, period2End, comparing, pages])

  const handleCompare = () => {
    if (!period1Start || !period1End || !period2Start || !period2End) {
      alert("Por favor, preencha todas as datas")
      return
    }

    if (parseLocalDate(period1Start) > parseLocalDate(period1End)) {
      alert("Data inicial do Período 1 deve ser anterior à data final")
      return
    }

    if (parseLocalDate(period2Start) > parseLocalDate(period2End)) {
      alert("Data inicial do Período 2 deve ser anterior à data final")
      return
    }

    setComparing(true)
  }

  const handleReset = () => {
    setPeriod1Start("")
    setPeriod1End("")
    setPeriod2Start("")
    setPeriod2End("")
    setComparing(false)
  }

  // Calculate differences
  const followersDiff = period1Data && period2Data && period1Data.avgFollowers > 0
    ? ((period2Data.avgFollowers - period1Data.avgFollowers) / period1Data.avgFollowers) * 100
    : 0

  const viewsDiff = period1Data && period2Data && period1Data.avgViews > 0
    ? ((period2Data.avgViews - period1Data.avgViews) / period1Data.avgViews) * 100
    : 0

  // Prepare comparison chart data
  const comparisonData = [
    {
      metric: "Seguidores",
      periodo1: period1Data?.avgFollowers ?? 0,
      periodo2: period2Data?.avgFollowers ?? 0
    },
    {
      metric: "Visualizações",
      periodo1: period1Data?.avgViews ?? 0,
      periodo2: period2Data?.avgViews ?? 0
    }
  ]

  if (pages?.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-3">Nenhuma página cadastrada</h2>
        <p className="text-muted-foreground mb-6">
          Você precisa ter páginas cadastradas com dados para comparar períodos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Comparação entre Períodos</h1>
        <p className="text-muted-foreground">
          Compare as métricas entre dois períodos personalizados
        </p>
      </div>

      {/* Period Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-700">Período 1</CardTitle>
              <CardDescription>Selecione o primeiro período de comparação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period1-start">Data Inicial</Label>
                <Input
                  id="period1-start"
                  type="date"
                  value={period1Start}
                  onChange={(e) => setPeriod1Start(e.target.value)}
                  disabled={comparing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period1-end">Data Final</Label>
                <Input
                  id="period1-end"
                  type="date"
                  value={period1End}
                  onChange={(e) => setPeriod1End(e.target.value)}
                  disabled={comparing}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Period 2 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-pink-200 bg-pink-50">
            <CardHeader>
              <CardTitle className="text-pink-700">Período 2</CardTitle>
              <CardDescription>Selecione o segundo período de comparação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period2-start">Data Inicial</Label>
                <Input
                  id="period2-start"
                  type="date"
                  value={period2Start}
                  onChange={(e) => setPeriod2Start(e.target.value)}
                  disabled={comparing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period2-end">Data Final</Label>
                <Input
                  id="period2-end"
                  type="date"
                  value={period2End}
                  onChange={(e) => setPeriod2End(e.target.value)}
                  disabled={comparing}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Compare Button */}
      <div className="flex justify-center gap-4">
        {!comparing ? (
          <Button
            onClick={handleCompare}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8"
            size="lg"
          >
            Comparar Períodos
            <ArrowRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
          >
            Nova Comparação
          </Button>
        )}
      </div>

      {/* Comparison Results */}
      {comparing && period1Data && period2Data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Média Seguidores P1"
              value={Math.round(period1Data.avgFollowers)}
              icon={Users}
              className="border-purple-200"
            />
            <KPICard
              title="Média Seguidores P2"
              value={Math.round(period2Data.avgFollowers)}
              icon={Users}
              className="border-pink-200"
            />
            <KPICard
              title="Média Visualizações P1"
              value={Math.round(period1Data.avgViews)}
              icon={Eye}
              className="border-purple-200"
            />
            <KPICard
              title="Média Visualizações P2"
              value={Math.round(period2Data.avgViews)}
              icon={Eye}
              className="border-pink-200"
            />
          </div>

          {/* Growth Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard
              title="Variação de Seguidores"
              value={`${followersDiff > 0 ? '+' : ''}${followersDiff.toFixed(1)}%`}
              icon={TrendingUp}
              trend={{
                value: followersDiff,
                isPositive: followersDiff > 0
              }}
            />
            <KPICard
              title="Variação de Visualizações"
              value={`${viewsDiff > 0 ? '+' : ''}${viewsDiff.toFixed(1)}%`}
              icon={TrendingUp}
              trend={{
                value: viewsDiff,
                isPositive: viewsDiff > 0
              }}
            />
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 gap-6">
            <BarChart
              title="Comparação de Métricas entre Períodos"
              data={comparisonData}
              dataKeys={[
                { key: "periodo1", color: "#8B5CF6", name: "Período 1" },
                { key: "periodo2", color: "#EC4899", name: "Período 2" }
              ]}
              xAxisKey="metric"
              height={400}
            />
          </div>

          {/* Summary Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-700">Resumo Período 1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Datas:</strong> {formatDateBR(period1Start)} - {formatDateBR(period1End)}</p>
                <p><strong>Pontos de dados:</strong> {period1Data.dataPoints}</p>
                <p><strong>Total seguidores:</strong> {period1Data.totalFollowers.toLocaleString()}</p>
                <p><strong>Total visualizações:</strong> {period1Data.totalViews.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-pink-200 bg-pink-50">
              <CardHeader>
                <CardTitle className="text-pink-700">Resumo Período 2</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Datas:</strong> {formatDateBR(period2Start)} - {formatDateBR(period2End)}</p>
                <p><strong>Pontos de dados:</strong> {period2Data.dataPoints}</p>
                <p><strong>Total seguidores:</strong> {period2Data.totalFollowers.toLocaleString()}</p>
                <p><strong>Total visualizações:</strong> {period2Data.totalViews.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  )
}