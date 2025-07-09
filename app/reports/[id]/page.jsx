"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"
import { NadmoLayout } from "@/components/layout/nadmo-layout"
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit,
  Download,
  Share2,
  Flag,
  MessageSquare,
  Camera,
  Navigation,
  Activity,
  Shield,
  Heart,
  Users,
  FileText,
} from "lucide-react"
import { Label } from "@/components/ui/label"

// Hook to fetch individual report
const useReport = (reportId) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/reports/${reportId}/`);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const disasterTypes = [
  { value: "flood", label: "Flood", icon: "🌊", description: "Water overflow, heavy rainfall" },
  { value: "fire", label: "Fire", icon: "🔥", description: "Building fire, bush fire, explosion" },
  { value: "accident", label: "Accident", icon: "🚗", description: "Road accident, collision" },
  { value: "landslide", label: "Landslide", icon: "⛰️", description: "Soil erosion, slope failure" },
  { value: "storm", label: "Storm", icon: "⛈️", description: "Heavy winds, thunderstorm" },
  { value: "earthquake", label: "Earthquake", icon: "🌍", description: "Ground shaking, tremors" },
  { value: "other", label: "Other", icon: "⚠️", description: "Other emergency situations" },
]

const severityConfig = {
  low: { label: "Minor", color: "bg-green-100 text-green-800", icon: Activity },
  medium: { label: "Moderate", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  high: { label: "Serious", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
  critical: { label: "Critical", color: "bg-red-100 text-red-800", icon: AlertTriangle },
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Activity },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: XCircle },
}

export default function ReportViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const reportId = params.id

  const { data: report, isLoading, error } = useReport(reportId)

  const getDisasterTypeInfo = (type) => {
    return disasterTypes.find((t) => t.value === type) || { label: type, icon: "⚠️", description: "Emergency situation" }
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getSeverityBadge = (severity) => {
    const config = severityConfig[severity] || severityConfig.low
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/reports/${reportId}/`, { status: newStatus })
      toast({
        title: "Status Updated",
        description: `Report status updated to ${statusConfig[newStatus]?.label}`,
      })
      // Refetch the report to get updated data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update report status",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </NadmoLayout>
    )
  }

  if (error) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Report</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </NadmoLayout>
    )
  }

  if (!report) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600 mb-4">The report you're looking for doesn't exist.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </NadmoLayout>
    )
  }

  const disasterTypeInfo = getDisasterTypeInfo(report.disaster_type)

  return (
    <NadmoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Report</h1>
              <p className="text-gray-600">Report ID: {report.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
           
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">{disasterTypeInfo.icon}</span>
                  <div>
                    <span className="text-xl">{disasterTypeInfo.label}</span>
                    <p className="text-sm text-gray-600">{disasterTypeInfo.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div>{getStatusBadge(report.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Severity Level</Label>
                    <div>{getSeverityBadge(report.severity_level)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{report.location_description}</span>
                    </div>
                    {report.gps_coordinates && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Navigation className="h-3 w-3" />
                        <span>GPS: {report.gps_coordinates}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">People Affected</Label>
                    <div className="flex items-center space-x-2">
                      {report.are_people_hurt ? (
                        <>
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 font-medium">Yes - {report.number_injured} people injured</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">No injuries reported</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            {report.photo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Photos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.isArray(report.photo) ? (
                      report.photo.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Report photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Camera className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No photos available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Report Submitted</p>
                      <p className="text-sm text-gray-600">{formatDate(report.created_at)}</p>
                    </div>
                  </div>
                  {report.status !== "pending" && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Status Updated</p>
                        <p className="text-sm text-gray-600">Report moved to {statusConfig[report.status]?.label}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Reporter</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{report.reporter.email}</span>
                </div>
                {report.reporter.profile?.phone_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{report.reporter.profile.phone_number}</span>
                  </div>
                )}
                {report.reporter.profile?.full_name && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{report.reporter.profile.full_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm capitalize">{report.reporter.role}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={report.status === "in_progress"}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Mark In Progress
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("resolved")}
                  disabled={report.status === "resolved"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={report.status === "cancelled"}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Report
                </Button>
              </CardContent>
            </Card>

            {/* Report Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Report ID</span>
                  <span className="text-sm font-mono">{report.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{formatDate(report.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm capitalize">{report.disaster_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Severity</span>
                  <span className="text-sm capitalize">{report.severity_level}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </NadmoLayout>
  )
}
