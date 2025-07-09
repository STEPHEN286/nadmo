"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Filter, Eye, AlertTriangle, CheckCircle, XCircle, Clock, List } from "lucide-react"
import Link from "next/link"
import { mockReports, statusConfig, disasterTypes } from "@/lib/disaster-data"
import { NadmoLayout } from "@/components/layout/nadmo-layout"

export default function DisasterMapPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)

  // Filter reports based on selected filters
  const filteredReports = mockReports.filter((report) => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesType = typeFilter === "all" || report.type === typeFilter
    return matchesStatus && matchesType && report.coordinates
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "fake":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getDisasterTypeInfo = (type) => {
    return disasterTypes.find((t) => t.value === type) || { label: type, icon: "⚠️" }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMarkerColor = (status) => {
    switch (status) {
      case "new":
        return "bg-red-500"
      case "in_progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "fake":
        return "bg-gray-500"
      default:
        return "bg-red-500"
    }
  }

  return (
   <NadmoLayout >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Disaster Map View</h1>
            <p className="text-gray-600">Interactive map showing all disaster reports by location</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Link href="/disaster/reports">
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">🔴 New</SelectItem>
                      <SelectItem value="in_progress">🟡 In Progress</SelectItem>
                      <SelectItem value="resolved">🟢 Resolved</SelectItem>
                      <SelectItem value="fake">⚫ Fake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {disasterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Showing {filteredReports.length} reports</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>New</span>
                      </div>
                      <span>{mockReports.filter((r) => r.status === "new").length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>In Progress</span>
                      </div>
                      <span>{mockReports.filter((r) => r.status === "in_progress").length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Resolved</span>
                      </div>
                      <span>{mockReports.filter((r) => r.status === "resolved").length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span>Fake</span>
                      </div>
                      <span>{mockReports.filter((r) => r.status === "fake").length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Report Details */}
            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getDisasterTypeInfo(selectedReport.type).label}</span>
                    <Badge
                      variant="outline"
                      className={`${statusConfig[selectedReport.status].bgColor} ${statusConfig[selectedReport.status].textColor}`}
                    >
                      {statusConfig[selectedReport.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{selectedReport.location}</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedReport.createdAt)}</p>
                  <Link href={`/disaster/reports/${selectedReport.id}`}>
                    <Button size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Ghana Disaster Map
                </CardTitle>
                <CardDescription>Click on markers to view report details</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Map Container */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "600px" }}>
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                    <div className="absolute inset-0 opacity-20">
                      <svg viewBox="0 0 400 300" className="w-full h-full">
                        {/* Ghana outline (simplified) */}
                        <path
                          d="M50 150 L100 100 L200 80 L300 100 L350 150 L320 200 L250 250 L150 240 L80 200 Z"
                          fill="rgba(34, 197, 94, 0.2)"
                          stroke="rgba(34, 197, 94, 0.5)"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Map Markers */}
                  {filteredReports.map((report, index) => {
                    const [lat, lng] = report.coordinates.split(", ").map(Number)
                    // Convert GPS coordinates to map position (simplified)
                    const x = ((lng + 3) / 6) * 100 // Rough conversion for Ghana
                    const y = ((10 - lat) / 5) * 100
                    const typeInfo = getDisasterTypeInfo(report.type)

                    return (
                      <div
                        key={report.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                          selectedReport?.id === report.id ? "scale-125 z-10" : ""
                        }`}
                        style={{
                          left: `${Math.max(5, Math.min(95, x))}%`,
                          top: `${Math.max(5, Math.min(95, y))}%`,
                        }}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${getMarkerColor(report.status)} flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white`}
                        >
                          <span>{typeInfo.icon}</span>
                        </div>
                        {selectedReport?.id === report.id && (
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48 z-20">
                            <div className="text-sm font-medium mb-1">{typeInfo.label}</div>
                            <div className="text-xs text-gray-600 mb-2">{report.location}</div>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className={`text-xs ${statusConfig[report.status].bgColor} ${statusConfig[report.status].textColor}`}
                              >
                                {statusConfig[report.status].label}
                              </Badge>
                              <span className="text-xs text-gray-500">{formatDate(report.createdAt)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Legend</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>New Reports</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Resolved</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span>False Reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
                    <div className="flex flex-col space-y-1">
                      <Button variant="outline" size="sm">
                        +
                      </Button>
                      <Button variant="outline" size="sm">
                        -
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </NadmoLayout>
  )
}
