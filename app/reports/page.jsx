"use client"

import { useState, useMemo, useEffect, useCallback } from "react"


import { Button } from "@/components/ui/button"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useToast } from "@/hooks/use-toast"

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
  LoaderIcon,
  Trash2,
  X, // <-- Add this line
} from "lucide-react"
import Link from "next/link"
import { mockReports, statusConfig, severityConfig, disasterTypes } from "@/lib/disaster-data"
import { NadmoLayout } from "@/components/layout/nadmo-layout"
import { exportReports, getAvailableFields } from "@/lib/export-utils"
import useReports, { useUpdateReportStatus } from "@/hooks/use-reports"
import { useRegions } from "@/hooks/use-regions"
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import StatusUpdateModal from "@/components/StatusUpdateModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useDeleteReport } from "@/hooks/use-delete-report";


export default function NADMOReportsPage() {
  // All hooks at the top
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState(null);
  const deleteReportMutation = useDeleteReport();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Create filters object for the API
  const filters = {
    search: debouncedSearchTerm,
    status: statusFilter,
    type: typeFilter,
    severity: severityFilter,
    region: regionFilter,
    date: dateFilter,
    sortField,
    sortDirection,
  };

  const { reports, isPending, error, count, next, previous, refetch } = useReports(currentPage, filters);
  const { data: regions } = useRegions();

  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize) || 1;

 

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



  // Log reports from API
  console.log("reports from useReports hook:", reports);

  // Show loading state
  if (isPending) {
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
  // const pageSize = reports.length || 1;
  // const totalPages = Math.ceil(count / pageSize) || 1;

  // useEffect(() => {
  //   if (currentPage > totalPages) {
  //     setCurrentPage(totalPages);
  //   }
  // }, [totalPages, currentPage]);

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
    if (selectedReports.length === reports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(reports.map((r) => r.id))
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
      await exportReports(reports, exportFields, format, 'nadmo_reports');

      toast({
        title: "Export Completed",
        description: `Successfully exported ${reports.length} reports as ${format.toUpperCase()}`,
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

  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm || 
    statusFilter !== "all" || 
    typeFilter !== "all" || 
    severityFilter !== "all" || 
    regionFilter !== "all" || 
    dateFilter !== "all"

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

  // Table columns configuration
  const tableColumns = [
    // {
    //   key: "id",
    //   label: "Report ID",
    //   type: "id",
    //   sortable: true,
    // },
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
    // {
    //   key: "reporter",
    //   label: "Reporter",
    //   type: "custom",
    //   render: (item) => (
    //     <div className="flex items-center space-x-2">
    //       <User className="h-4 w-4 text-gray-400" />
    //       <span>{item.reporter?.email || "Anonymous"}</span>
    //     </div>
    //   ),
    // },
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
      title: "Edit Status",
      onClick: (item) => {
        console.log("Edit clicked for report:", item);
        setEditingReport(item);
        setNewStatus(""); // Don't set initial status, let user select
        setEditModalOpen(true);
      },
    },
    {
      icon: Trash2,
      title: "Delete Report",
      onClick: (item) => {
        console.log("Delete clicked for report:", item);
        setDeletingReport(item);
        setDeleteModalOpen(true);
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
    // {
    //   label: "Refresh",
    //   icon: RefreshCw,
    //   onClick: () => refetch(),
    //   variant: "outline",
    // },
    {
      label: "Export Data",
      icon: Download,
      onClick: () => setShowExportPanel(!showExportPanel),
      variant: "outline",
    },
    {
      label: "Map View",
      icon: MapPin,
      href: "/map",
      variant: "outline",
    },
  ]

  // Statistics configuration - calculate based on current filtered data
  const statsData = [
    {
      label: "Total Reports",
      value: count.toString(),
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
    {
      label: "Pending",
      value: reports.filter((r) => r.status === "pending").length.toString(),
      icon: LoaderIcon,
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
        { value: "new", label: " New", icon: "" },
        { value: "in_progress", label: " In Progress", icon: "" },
        { value: "resolved", label: " Resolved", icon: "" },
        { value: "fake", label: " Fake", icon: "" },
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
        { value: "critical", label: " Critical", icon: "" },
        { value: "high", label: " High", icon: "" },
        { value: "medium", label: " Medium", icon: "" },
        { value: "low", label: " Low", icon: "" },
      ],
    },
    {
      key: "region",
      type: "select",
      placeholder: "Region",
      value: regionFilter,
      options: [
        { value: "all", label: "All Regions" },
        ...(regions || []).map((region) => ({ 
          value: region.id, 
          label: region.name 
        })),
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

    // Status update handler
 

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
            filteredReports={reports}
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

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {statusFilter}
                    </span>
                  )}
                  {typeFilter !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Type: {typeFilter}
                    </span>
                  )}
                  {severityFilter !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Severity: {severityFilter}
                    </span>
                  )}
                  {regionFilter !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Region: {regions?.find(r => r.id === regionFilter)?.name || regionFilter}
                    </span>
                  )}
                  {dateFilter !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Date: {dateFilter}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-700">
                  Showing {reports.length} of {count} reports
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-800">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <ReportFilters
          title="Filters & Search"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filtersConfig}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          showClearButton={true}
          isLoading={isPending}
        />

        {/* Reports Table */}
        <ReportTable
          title="Emergency Reports"
          description="Comprehensive list of all disaster reports with management actions"
          data={reports}
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
          itemsPerPage={pageSize}
          totalItems={count}
          next={next}
          previous={previous}
          // showSelection={true}
          showPagination={true}
          showBulkActions={true}
          bulkActions={bulkActions}
          onBulkAction={handleBulkStatusUpdate}
          isLoading={isUpdating}
          emptyMessage={hasActiveFilters ? "No reports found matching your current filters. Try adjusting your search criteria." : "No reports found"}
          rowActions={rowActions}
        />
        {/* Status Edit Modal */}
        <StatusUpdateModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditingReport(null); setNewStatus(""); }}
          reportId={editingReport?.id}
          status={editingReport?.status}
          page={currentPage}
        />
        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={deleteModalOpen}
          onOpenChange={(open) => {
            setDeleteModalOpen(open);
            if (!open) setDeletingReport(null);
          }}
          title="Delete Report"
          description={`Are you sure you want to delete this report? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          destructive
          loading={deleteReportMutation.isLoading}
          onConfirm={() => {
            if (deletingReport) {
              deleteReportMutation.mutate(deletingReport.id, {
                onSuccess: () => {
                  setDeleteModalOpen(false);
                  setDeletingReport(null);
                },
              });
            }
          }}
        >
          <div className="py-2 text-sm text-gray-700">
            <strong>Type:</strong> {deletingReport?.disaster_type}<br />
            <strong>Location:</strong> {deletingReport?.location_description}
          </div>
        </ConfirmDialog>
      </div>
    </NadmoLayout>
  )
}
