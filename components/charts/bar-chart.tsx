"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"

interface BarChartProps {
  title: string
  data: any[]
  dataKeys: { key: string; color: string; name: string }[]
  xAxisKey: string
  height?: number
}

export function BarChart({ title, data, dataKeys, xAxisKey, height = 350 }: BarChartProps) {
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
            <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis 
                dataKey={xAxisKey} 
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{ value: '', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{ value: '', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontSize: 11
                }}
              />
              <Legend 
                verticalAlign="top"
                wrapperStyle={{ fontSize: 11 }}
              />
              {dataKeys?.map((dk, index) => (
                <Bar
                  key={dk?.key ?? index}
                  dataKey={dk?.key ?? ''}
                  fill={dk?.color ?? "#8884d8"}
                  name={dk?.name ?? dk?.key ?? ''}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}