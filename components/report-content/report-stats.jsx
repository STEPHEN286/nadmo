"use client"

import { Card, CardContent } from "@/components/ui/card"

export function ReportStats({
  stats = [],
  className = "",
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.valueColor || "text-gray-900"}`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              {stat.icon && (
                <div className={`p-2 rounded-lg ${stat.iconBgColor || "bg-gray-100"}`}>
                  <stat.icon className={`h-8 w-8 ${stat.iconColor || "text-gray-600"}`} />
                </div>
              )}
            </div>
            {stat.trend && (
              <div className="mt-2 flex items-center">
                <span className={`text-xs ${stat.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend > 0 ? "↗" : "↘"} {Math.abs(stat.trend)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 