"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SortAsc, SortDesc, Eye, Edit, Trash2, MapPin, User, Clock } from "lucide-react"

export function ReportTable({
  title = "Reports",
  description = "List of reports with management actions",
  data = [],
  columns = [],
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  onSort,
  sortField = "",
  sortDirection = "desc",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 15,
  totalItems = 0,
  showSelection = false,
  showPagination = true,
  showBulkActions = false,
  bulkActions = [],
  onBulkAction,
  isLoading = false,
  emptyMessage = "No data available",
  rowActions = [],
  className = "",
  next = null,
  previous = null,
}) {
  const [localSortField, setLocalSortField] = useState(sortField)
  const [localSortDirection, setLocalSortDirection] = useState(sortDirection)

  const handleSort = (field) => {
    if (onSort) {
      onSort(field)
    } else {
      // Local sorting if no external sort handler
      if (localSortField === field) {
        setLocalSortDirection(localSortDirection === "asc" ? "desc" : "asc")
      } else {
        setLocalSortField(field)
        setLocalSortDirection("desc")
      }
    }
  }

  const getSortIcon = (field) => {
    const currentSortField = onSort ? sortField : localSortField
    const currentSortDirection = onSort ? sortDirection : localSortDirection
    
    if (currentSortField !== field) return null
    return currentSortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  // cell
  const renderCell = (item, column) => {
    const value = item[column.key]
    
    switch (column.type) {
      case "text":
        return (
          <span
          className="whitespace-pre-line  break-words min-w-[180px] max-w-[480px] inline-block align-middle"
          style={{ verticalAlign: 'middle', wordBreak: 'break-word' }}
        >
          {value}
          </span>
        )
      
      case "badge":
        return (
          <Badge variant={column.badgeVariant || "secondary"}  className={`${config.className} hover:bg-transparent hover:text-inherit`}>
            {value}
          </Badge>
        )
      
      case "status":
        const statusConfig = column.statusConfig || {}
        const config = statusConfig[value] || {}
        return (
          <div className="flex items-center space-x-2">
            {config.icon && <config.icon className="h-4 w-4" />}
            <Badge
              variant="outline"
              className={`${config.bgColor || ""} ${config.textColor || ""} ${config.borderColor || ""}`}
            >
              {config.label || value}
            </Badge>
          </div>
        )
      
      case "date":
        return (
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      
      case "location":
        return (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-32">{value}</span>
          </div>
        )
      
      case "user":
        return (
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-24">{value || "Anonymous"}</span>
          </div>
        )
      
      case "number":
        return <span className="font-mono text-sm">{value?.toLocaleString()}</span>
      
      case "id":
        return <span className="font-mono text-sm">{value}</span>
      
      case "custom":
        return column.render ? column.render(item) : value
      
      default:
        return value
    }
  }

  const renderActions = (item) => {
    return (
      <div className="flex items-center space-x-1">
        {rowActions.map((action, index) => {
          if (action.condition && !action.condition(item)) return null
          
          if (action.href) {
            return (
              <Link key={index} href={action.href(item)}>
                <Button variant="ghost" size="sm" title={action.title}>
                  <action.icon className="h-4 w-4" />
                </Button>
              </Link>
            )
          }
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => action.onClick(item)}
              disabled={action.disabled?.(item)}
              className={action.className}
              title={action.title}
            >
              <action.icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    )
  }

  // Remove client-side pagination
  // const startIndex = (currentPage - 1) * itemsPerPage
  // const endIndex = startIndex + itemsPerPage
  // const paginatedData = data.slice(startIndex, endIndex)
  const paginatedData = data;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Bulk Actions */}
        {showBulkActions && selectedItems.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
              </p>
              <div className="flex space-x-2">
                {bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() => onBulkAction(action.key, selectedItems)}
                    disabled={isLoading}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {showSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex  w-full items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {rowActions.length > 0 && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showSelection ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showSelection ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="text-center py-8">
                    <div className="text-gray-500">{emptyMessage}</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const isSelected = selectedItems.includes(item.id)
                  
                  return (
                    <TableRow key={item.id} className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
                      {showSelection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onSelectItem(item.id)}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.cellClassName}>
                          {renderCell(item, column)}
                        </TableCell>
                      ))}
                      {rowActions.length > 0 && (
                        <TableCell>
                          {renderActions(item)}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalItems} total items)
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={!previous || currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={!next || currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 