"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

export function ReportHeader({
  title,
  description,
  actions = [],
  searchTerm = "",
  onSearchChange,
  className = "",
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        {actions.length > 0 && (
          <div className="flex space-x-2 mt-4 sm:mt-0">
            {actions.map((action, index) => {
              if (action.condition && !action.condition()) return null
              
              if (action.href) {
                return (
                  <Link key={index} href={action.href}>
                    <Button
                      variant={action.variant || "outline"}
                      className={action.className}
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                      {action.label}
                    </Button>
                  </Link>
                )
              }
              
              return (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  className={action.className}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Search Bar */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, region, district, or digital address..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
    </div>
  )
} 