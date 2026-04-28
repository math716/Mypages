"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface PieChartProps {
  data: {
    name: string
    value: number
    color?: string
  }[]
  title?: string
}

const COLORS = [
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#84cc16", // lime-500
  "#06b6d4", // cyan-500
]

export function PieChartComponent({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Sort data by value descending for better visualization
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const percentage = ((item.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg z-50">
          <p className="font-semibold text-sm">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value.toLocaleString()} seguidores
          </p>
          <p className="text-sm text-purple-600 font-medium">
            {percentage}% do total
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Truncate long names
  const truncateName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      
      {/* Chart */}
      <div className="w-full flex justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={110}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              paddingAngle={2}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend - Grid Layout */}
      <div className="mt-4 grid grid-cols-2 gap-2 px-2">
        {sortedData.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1)
          const color = entry.color || COLORS[index % COLORS.length]
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 truncate" title={entry.name}>
                  {truncateName(entry.name)}
                </p>
                <p className="text-xs text-gray-500">
                  {percentage}%
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
