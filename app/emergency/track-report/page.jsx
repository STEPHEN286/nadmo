"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, User, Phone, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import { mockReports, statusConfig, severityConfig, disasterTypes } from "@/lib/disaster-data"
import { BackButton } from "@/components/ui/back-button"
import { useRouter } from "next/navigation"
import useTrackReport from "@/hooks/use-track-report";

export default function TrackReportPage() {
  const [inputId, setInputId] = useState("");
  const [reportId, setReportId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { data: searchResult, isLoading, isError } = useTrackReport(reportId);

  const handleSearch = () => {
    if (!inputId.trim()) {
      setError("Please enter a report ID");
      return;
    }
    setError("");
    setReportId(inputId.trim());
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <AlertTriangle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "fake":
        return <XCircle className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <BackButton variant="ghost" size="sm" onClick={() => router.push("/emergency")}>
              Back to Emergency Home
            </BackButton>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Track Your Report</h1>
                <p className="text-sm text-gray-600">Check the status of your emergency report</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search Form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enter Your Report ID</CardTitle>
            <CardDescription>
              Enter the report ID you received when you submitted your emergency report (e.g., DZ-20240621-ABC123)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="reportId" className="sr-only">
                  Report ID
                </Label>
                <Input
                  id="reportId"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="DZ-20240621-ABC123"
                  className="font-mono"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Search Result */}
        {isLoading && reportId && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        )}
        {isError && reportId && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600 mb-4">No report found with that ID. Please check and try again.</p>
          </div>
        )}
        {searchResult && (
          <div className="mt-6 space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{getDisasterTypeInfo(searchResult.type).icon}</span>
                    <span>{getDisasterTypeInfo(searchResult.type).label} Report</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(searchResult.status)}
                    <Badge
                      variant="outline"
                      className={`${statusConfig[searchResult.status].bgColor} ${statusConfig[searchResult.status].textColor} ${statusConfig[searchResult.status].borderColor}`}
                    >
                      {statusConfig[searchResult.status].label}
                    </Badge>
                  </div>
                </div>
                <CardDescription>Report ID: {searchResult.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Reported</p>
                      <p className="text-sm text-gray-600">{formatDate(searchResult.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{searchResult.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Severity</p>
                      <Badge
                        variant="outline"
                        className={`${severityConfig[searchResult.severity].bgColor} ${severityConfig[searchResult.severity].textColor}`}
                      >
                        {severityConfig[searchResult.severity].label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Report Received</p>
                      <p className="text-sm text-gray-600">{formatDate(searchResult.createdAt)}</p>
                      <p className="text-sm text-gray-500">Your emergency report was successfully submitted to NADMO</p>
                    </div>
                  </div>

                  {searchResult.status !== "new" && (
                    <div className="flex items-start space-x-3">
                                      <div className="bg-red-100 p-2 rounded-full">
                  <Eye className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-gray-600">{formatDate(searchResult.updatedAt)}</p>
                        <p className="text-sm text-gray-500">Emergency services are assessing the situation</p>
                      </div>
                    </div>
                  )}

                  {searchResult.status === "in_progress" && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Response in Progress</p>
                        <p className="text-sm text-gray-600">{formatDate(searchResult.updatedAt)}</p>
                        <p className="text-sm text-gray-500">Emergency response team has been dispatched</p>
                        {searchResult.assignedTo && (
                          <p className="text-sm text-gray-500">Assigned to: {searchResult.assignedTo}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {searchResult.status === "resolved" && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Resolved</p>
                        <p className="text-sm text-gray-600">{formatDate(searchResult.updatedAt)}</p>
                        <p className="text-sm text-gray-500">Emergency situation has been resolved</p>
                        {searchResult.responseTime && (
                          <p className="text-sm text-gray-500">Response time: {searchResult.responseTime} minutes</p>
                        )}
                      </div>
                    </div>
                  )}

                  {searchResult.status === "fake" && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <XCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Marked as False Report</p>
                        <p className="text-sm text-gray-600">{formatDate(searchResult.updatedAt)}</p>
                        <p className="text-sm text-gray-500">Investigation determined this was not an emergency</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{searchResult.description}</p>
                </div>

                {searchResult.coordinates && (
                  <div>
                    <h4 className="font-medium mb-2">GPS Coordinates</h4>
                    <p className="text-gray-700 font-mono">{searchResult.coordinates}</p>
                  </div>
                )}

                {searchResult.casualties && (
                  <div>
                    <h4 className="font-medium mb-2">Casualties/Injuries</h4>
                    <p className="text-gray-700">{searchResult.casualties}</p>
                  </div>
                )}

                {searchResult.reporterName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Reported by: {searchResult.reporterName}</span>
                  </div>
                )}

                {searchResult.notes && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="font-medium mb-2 text-red-900">Official Notes</h4>
                <p className="text-red-800 text-sm">{searchResult.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">NADMO Hotline</p>
                      <p className="text-gray-600">0800-111-222</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">Emergency Services</p>
                      <p className="text-gray-600">Police: 191 • Fire: 192 • Ambulance: 193</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      
      </div>
    </div>
  )
}
