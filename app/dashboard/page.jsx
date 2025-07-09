"use client"

import { NadmoLayout } from "@/components/layout/nadmo-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { AlertTriangle, Clock, CheckCircle, XCircle, MapPin, Users, Phone, Eye } from "lucide-react"
import { useState } from "react"
import SwiperCarousel from "@/components/ui/swiper-carousel"

// Mock disaster data
const disasterStats = [
  { name: "Active Alerts", value: 7, icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
  { name: "Resolved Today", value: 12, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
  { name: "Pending Review", value: 23, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { name: "False Reports", value: 5, icon: XCircle, color: "text-gray-600", bgColor: "bg-gray-50" },
]

const recentAlerts = [
  {
    id: "DA-001",
    type: "Flood",
    location: "Accra Central",
    severity: "Critical",
    time: "15 mins ago",
    status: "Active",
    reporter: "John Mensah",
    coordinates: "5.6037, -0.1870",
  },
  {
    id: "DA-002",
    type: "Fire",
    location: "Kumasi Market",
    severity: "High",
    time: "1 hour ago",
    status: "Responding",
    reporter: "Mary Asante",
    coordinates: "6.6885, -1.6244",
  },
  {
    id: "DA-003",
    type: "Accident",
    location: "Tema Highway",
    severity: "Medium",
    time: "2 hours ago",
    status: "Resolved",
    reporter: "Anonymous",
    coordinates: "5.6698, 0.0166",
  },
  {
    id: "DA-004",
    type: "Landslide",
    location: "Cape Coast Hills",
    severity: "High",
    time: "3 hours ago",
    status: "Monitoring",
    reporter: "Grace Osei",
    coordinates: "5.1053, -1.2466",
  },
]

const responseTimeData = [
  { hour: "00:00", avgTime: 12 },
  { hour: "04:00", avgTime: 8 },
  { hour: "08:00", avgTime: 15 },
  { hour: "12:00", avgTime: 18 },
  { hour: "16:00", avgTime: 22 },
  { hour: "20:00", avgTime: 14 },
]

const disasterTypeData = [
  { type: "Floods", count: 15, resolved: 8 },
  { type: "Fires", count: 12, resolved: 9 },
  { type: "Accidents", count: 18, resolved: 15 },
  { type: "Others", count: 8, resolved: 5 },
]

// Emergency alerts for carousel
const emergencyAlerts = [
  {
    type: "emergency",
    title: "Critical Flood Alert",
    description: "Severe flooding reported in Accra Central",
    content: "Water levels rising rapidly. Emergency services deployed. Avoid the area.",
    action: {
      label: "View Details",
      variant: "destructive",
      onClick: () => console.log("View flood details"),
    },
    dismissible: true,
    onDismiss: () => console.log("Dismiss flood alert"),
  },
  {
    type: "emergency",
    title: "Fire Emergency",
    description: "Large fire at Kumasi Market",
    content: "Fire department responding. Multiple units on scene. Traffic diverted.",
    action: {
      label: "Track Response",
      variant: "destructive",
      onClick: () => console.log("Track fire response"),
    },
    dismissible: true,
    onDismiss: () => console.log("Dismiss fire alert"),
  },
  {
    type: "info",
    title: "Weather Warning",
    description: "Heavy rainfall expected",
    content: "Flash flood warnings issued for Greater Accra region. Stay alert.",
    action: {
      label: "Weather Update",
      variant: "outline",
      onClick: () => console.log("View weather update"),
    },
    dismissible: true,
    onDismiss: () => console.log("Dismiss weather alert"),
  },
  {
    type: "emergency",
    title: "Traffic Accident",
    description: "Major accident on Tema Highway",
    content: "Multiple vehicles involved. Emergency services on scene. Expect delays.",
    action: {
      label: "Traffic Info",
      variant: "outline",
      onClick: () => console.log("View traffic info"),
    },
    dismissible: true,
    onDismiss: () => console.log("Dismiss traffic alert"),
  },
]

export default function dashboard() {
    const [selectedRegion, setSelectedRegion] = useState("all")
  const [timeFilter, setTimeFilter] = useState("24h")

  const getSeverityBadge = (severity) => {
    const variants = {
      Critical: "destructive",
      High: "secondary",
      Medium: "outline",
      Low: "default",
    }
    return <Badge variant={variants[severity]}>{severity}</Badge>
  }

  const getStatusBadge = (status) => {
    const variants = {
      Active: "destructive",
      Responding: "secondary",
      Resolved: "default",
      Monitoring: "outline",
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }
  return (
    <NadmoLayout >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Disaster Alert Dashboard</h1>
            <p className="text-gray-600">Real-time emergency response monitoring</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="greater-accra">Greater Accra</SelectItem>
                <SelectItem value="ashanti">Ashanti</SelectItem>
                <SelectItem value="western">Western</SelectItem>
                <SelectItem value="eastern">Eastern</SelectItem>
                <SelectItem value="northern">Northern</SelectItem>
                <SelectItem value="central">Central</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {disasterStats.map((stat) => (
            <Card key={stat.name} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                {stat.name === "Active Alerts" && stat.value > 5 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response time over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="avgTime" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Disaster Types */}
          <Card>
            <CardHeader>
              <CardTitle>Disaster Types</CardTitle>
              <CardDescription>Reports by type and resolution status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disasterTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest emergency reports and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Severity</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Time</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.map((alert) => (
                    <tr key={alert.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{alert.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {alert.type}
                        </div>
                      </td>
                      <td className="py-3 px-4">{alert.location}</td>
                      <td className="py-3 px-4">{getSeverityBadge(alert.severity)}</td>
                      <td className="py-3 px-4">{getStatusBadge(alert.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{alert.time}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </NadmoLayout>
  )
}
