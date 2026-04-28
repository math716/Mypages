"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"

interface LineChartProps {
  title: string
  data: any[]
  dataKeys: { key: string; color: string; name: string }[]
  xAxisKey: string
  height?: number
}

export function LineChart({ title, data, dataKeys, xAxisKey, height = 350 }: LineChartProps) {
  // Determine interval for X axis labels based on data length
  const interval = data.length > 15 ? Math.ceil(data.length / 10) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <defs>
                {dataKeys?.map((dk, index) => (
                  <linearGradient key={dk?.key ?? index} id={`gradient-${dk?.key ?? index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dk?.color ?? "#8884d8"} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={dk?.color ?? "#8884d8"} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey={xAxisKey} 
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval={interval}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                  return value.toString()
                }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontSize: 11
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend 
                verticalAlign="top"
                wrapperStyle={{ fontSize: 11 }}
              />
              {dataKeys?.map((dk, index) => (
                <Line
                  key={dk?.key ?? index}
                  type="monotone"
                  dataKey={dk?.key ?? ''}
                  stroke={dk?.color ?? "#8884d8"}
                  strokeWidth={2}
                  name={dk?.name ?? dk?.key ?? ''}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}