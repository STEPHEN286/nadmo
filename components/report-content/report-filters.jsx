"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

export function ReportFilters({
  title = "Filters & Search",
  searchTerm = "",
  onSearchChange,
  filters = [],
  onFilterChange,
  onClearFilters,
  showClearButton = true,
  className = "",
}) {
  const renderFilter = (filter) => {
    switch (filter.type) {
      case "search":
        return (
          <div key={filter.key} className={filter.className || "lg:col-span-2"}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={filter.placeholder || "Search..."}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )

      case "select":
        return (
          <Select
            key={filter.key}
            value={filter.value}
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {/* {option.icon && <span className="mr-2">{option.icon}</span>} */}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <Select
            key={filter.key}
            value={filter.value}
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  const hasActiveFilters = filters.some(filter => filter.value && filter.value !== "all") || searchTerm

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          {hasActiveFilters && (
            <CardDescription>
              Active filters applied
            </CardDescription>
          )}
        </div>
        {(showClearButton || hasActiveFilters) && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {hasActiveFilters && (
                <span>
                  Filters applied: {filters.filter(f => f.value && f.value !== "all").length}
                  {searchTerm && " + search"}
                </span>
              )}
            </div>
            {showClearButton && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {filters.map(renderFilter)}
        </div>
      </CardContent>
    </Card>
  )
} 