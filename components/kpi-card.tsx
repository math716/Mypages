"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  prefix?: string
  suffix?: string
  animate?: boolean
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  prefix = "",
  suffix = "",
  animate = true
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "number" ? value : parseFloat(value?.toString() ?? "0") || 0

  useEffect(() => {
    if (!animate || typeof value !== "number") {
      setDisplayValue(numericValue)
      return
    }

    let start = 0
    const duration = 1000
    const increment = numericValue / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [numericValue, animate, value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("hover:shadow-lg transition-shadow duration-300", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  {prefix}{typeof value === "number" ? displayValue.toLocaleString() : value}{suffix}
                </h3>
                {trend && (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-full",
              "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
            )}>
              <Icon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}