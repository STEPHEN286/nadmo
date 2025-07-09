"use client"

import { useState, useMemo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"
import { 
  ExportPanel, 
  ReportTable, 
  ReportHeader, 
  ReportStats, 
  ReportFilters 
} from "@/components/report-content"
import {
  Search,
  Filter,
  Eye,
  Download,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  RefreshCw,
  FileText,
  SortAsc,
  SortDesc,
  TableIcon,
} from "lucide-react"
import Link from "next/link"
import { mockReports, statusConfig, severityConfig, disasterTypes } from "@/lib/disaster-data"
import { NadmoLayout } from "@/components/layout/nadmo-layout"
import { exportReports, getAvailableFields } from "@/lib/export-utils"

// Hook to fetch all reports
const useAllReports = () => {
  return useQuery({
    queryKey: ["all-reports"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/reports/`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default function NADMOReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReports, setSelectedReports] = useState([])
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [exportFormat, setExportFormat] = useState("csv")
  
  // Fetch reports from API
  const { data: reportsData, isLoading, error, refetch } = useAllReports();
  const reports = reportsData?.results || [];
  
  // Get available fields for NADMO reports
  const availableFields = getAvailableFields('nadmo');
  
  const [selectedFields, setSelectedFields] = useState(() => {
    const initialFields = {};
    availableFields.forEach(field => {
      initialFields[field.key] = field.selected;
    });
    return initialFields;
  })
  const itemsPerPage = 15
  const { toast } = useToast()

  const regions = [
    "Greater Accra",
    "Ashanti",
    "Western",
    "Eastern",
    "Northern",
    "Central",
    "Upper East",
    "Upper West",
    "Volta",
    "Brong Ahafo",
  ]

  // Filter and search reports
  const filteredReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.disaster_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.reporter && report.reporter.email?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      const matchesType = typeFilter === "all" || report.disaster_type === typeFilter
      const matchesSeverity = severityFilter === "all" || report.severity_level === severityFilter
      const matchesRegion = regionFilter === "all" || report.location_description?.includes(regionFilter)

      let matchesDate = true
      if (dateFilter !== "all") {
        const reportDate = new Date(report.created_at)
        const now = new Date()
        const diffTime = Math.abs(now - reportDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case "today":
            matchesDate = diffDays <= 1
            break
          case "week":
            matchesDate = diffDays <= 7
            break
          case "month":
            matchesDate = diffDays <= 30
            break
          case "quarter":
            matchesDate = diffDays <= 90
            break
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesSeverity && matchesRegion && matchesDate
    })

    // Sort reports
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [reports, searchTerm, statusFilter, typeFilter, severityFilter, regionFilter, dateFilter, sortField, sortDirection])

  // Show loading state
  if (isLoading) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </NadmoLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </NadmoLayout>
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleSelectReport = (reportId) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map((r) => r.id))
    }
  }

  const handleBulkStatusUpdate = async (actionKey, selectedItems) => {
    if (selectedItems.length === 0) return

    setIsUpdating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Status Updated",
      description: `${selectedItems.length} reports marked as ${actionKey}`,
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    })

    setSelectedReports([])
    setIsUpdating(false)
  }

  const handleFieldChange = (field, checked) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleExport = async (format, fields) => {
    setIsUpdating(true)

    try {
      // Map selected fields to the export format
      const exportFields = availableFields.map(field => ({
        ...field,
        selected: fields[field.key] || false
      }));

      // Export the reports
      await exportReports(filteredReports, exportFields, format, 'nadmo_reports');

      toast({
        title: "Export Completed",
        description: `Successfully exported ${filteredReports.length} reports as ${format.toUpperCase()}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowExportPanel(false);
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setSeverityFilter("all")
    setRegionFilter("all")
    setDateFilter("all")
    setCurrentPage(1)
  }

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDisasterTypeInfo = (type) => {
    return disasterTypes.find((t) => t.value === type) || { label: type, icon: "⚠️" }
  }

  // Table columns configuration
  const tableColumns = [
    {
      key: "id",
      label: "Report ID",
      type: "id",
      sortable: true,
    },
    {
      key: "disaster_type",
      label: "Type",
      type: "custom",
      render: (item) => {
        const typeInfo = getDisasterTypeInfo(item.disaster_type)
        return (
          <div className="flex items-center space-x-2">
            <span>{typeInfo.icon}</span>
            <span className="capitalize">{typeInfo.label}</span>
          </div>
        )
      },
    },
    {
      key: "location_description",
      label: "Location",
      type: "location",
      sortable: true,
    },
    {
      key: "reporter",
      label: "Reporter",
      type: "custom",
      render: (item) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span>{item.reporter?.email || "Anonymous"}</span>
        </div>
      ),
    },
    {
      key: "severity_level",
      label: "Severity",
      type: "status",
      statusConfig: severityConfig,
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      statusConfig: statusConfig,
      sortable: true,
    },
    {
      key: "created_at",
      label: "Date",
      type: "date",
      sortable: true,
    },
  ]

  // Row actions configuration
  const rowActions = [
    {
      icon: Eye,
      title: "View Report",
      href: (item) => `/reports/${item.id}`,
    },
    {
      icon: Edit,
      title: "Edit Report",
      onClick: (item) => {
        // Handle edit action
        console.log("Edit report:", item.id)
      },
    },
  ]

  // Bulk actions configuration
  const bulkActions = [
    {
      key: "in_progress",
      label: "Mark In Progress",
    },
    {
      key: "resolved",
      label: "Mark Resolved",
    },
    {
      key: "fake",
      label: "Mark Fake",
    },
  ]

  // Header actions configuration
  const headerActions = [
    {
      label: "Refresh",
      icon: RefreshCw,
      onClick: () => refetch(),
      variant: "outline",
    },
    {
      label: "Export Data",
      icon: Download,
      onClick: () => setShowExportPanel(!showExportPanel),
      variant: "outline",
    },
    {
      label: "Map View",
      icon: MapPin,
      href: "/nadmo/map",
      variant: "outline",
    },
  ]

  // Statistics configuration
  const statsData = [
    {
      label: "Total Reports",
      value: reports.length.toString(),
      icon: FileText,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
    },
    {
      label: "New Reports",
      value: reports.filter((r) => r.status === "new").length.toString(),
      icon: AlertTriangle,
      iconColor: "text-red-600",
      iconBgColor: "bg-red-50",
      valueColor: "text-red-600",
    },
    {
      label: "In Progress",
      value: reports.filter((r) => r.status === "in_progress").length.toString(),
      icon: Clock,
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-50",
      valueColor: "text-yellow-600",
    },
    {
      label: "Resolved",
      value: reports.filter((r) => r.status === "resolved").length.toString(),
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-50",
      valueColor: "text-green-600",
    },
  ]

  // Filters configuration
  const filtersConfig = [
    {
      key: "search",
      type: "search",
      placeholder: "Search reports, locations, IDs...",
      className: "lg:col-span-2",
    },
    {
      key: "status",
      type: "select",
      placeholder: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Statuses" },
        { value: "new", label: "🔴 New", icon: "🔴" },
        { value: "in_progress", label: "🟡 In Progress", icon: "🟡" },
        { value: "resolved", label: "🟢 Resolved", icon: "🟢" },
        { value: "fake", label: "⚫ Fake", icon: "⚫" },
      ],
    },
    {
      key: "type",
      type: "select",
      placeholder: "Type",
      value: typeFilter,
      options: [
        { value: "all", label: "All Types" },
        ...disasterTypes.map((type) => ({
          value: type.value,
          label: `${type.icon} ${type.label}`,
          icon: type.icon,
        })),
      ],
    },
    {
      key: "severity",
      type: "select",
      placeholder: "Severity",
      value: severityFilter,
      options: [
        { value: "all", label: "All Severities" },
        { value: "critical", label: "🔴 Critical", icon: "🔴" },
        { value: "high", label: "🟠 High", icon: "🟠" },
        { value: "medium", label: "🟡 Medium", icon: "🟡" },
        { value: "low", label: "🟢 Low", icon: "🟢" },
      ],
    },
    {
      key: "region",
      type: "select",
      placeholder: "Region",
      value: regionFilter,
      options: [
        { value: "all", label: "All Regions" },
        ...regions.map((region) => ({ value: region, label: region })),
      ],
    },
    {
      key: "date",
      type: "date",
      placeholder: "Date",
      value: dateFilter,
      options: [
        { value: "all", label: "All Dates" },
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "quarter", label: "This Quarter" },
      ],
    },
  ]

  const handleFilterChange = (key, value) => {
    switch (key) {
      case "status":
        setStatusFilter(value)
        break
      case "type":
        setTypeFilter(value)
        break
      case "severity":
        setSeverityFilter(value)
        break
      case "region":
        setRegionFilter(value)
        break
      case "date":
        setDateFilter(value)
        break
    }
    setCurrentPage(1)
  }

  return (
    <NadmoLayout>
      <div className="space-y-6">
        {/* Header */}
        <ReportHeader
          title="Reports Management"
          description="Monitor, filter, and manage all emergency reports"
          actions={headerActions}
        />

        {/* Export Panel */}
        {showExportPanel && (
          <ExportPanel
            filteredReports={filteredReports}
            onExport={handleExport}
            isUpdating={isUpdating}
            onCancel={() => setShowExportPanel(false)}
            availableFields={availableFields}
            selectedFields={selectedFields}
            onFieldChange={handleFieldChange}
          />
        )}

        {/* Statistics Cards */}
        <ReportStats stats={statsData} />

        {/* Filters */}
        <ReportFilters
          title="Filters & Search"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filtersConfig}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          showClearButton={true}
        />

        {/* Reports Table */}
        <ReportTable
          title="Emergency Reports"
          description="Comprehensive list of all disaster reports with management actions"
          data={filteredReports}
          columns={tableColumns}
          selectedItems={selectedReports}
          onSelectItem={handleSelectReport}
          onSelectAll={handleSelectAll}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={reports.length}
          // showSelection={true}
          showPagination={true}
          showBulkActions={true}
          bulkActions={bulkActions}
          onBulkAction={handleBulkStatusUpdate}
          isLoading={isUpdating}
          emptyMessage="No reports found matching your criteria"
          rowActions={rowActions}
        />
      </div>
    </NadmoLayout>
  )
}
