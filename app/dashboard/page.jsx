"use client"

import { NadmoLayout } from "@/components/layout/nadmo-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, Clock, CheckCircle, XCircle, MapPin, Users, Phone, Eye } from "lucide-react"
import { useState } from "react"
import SwiperCarousel from "@/components/ui/swiper-carousel"
import useStatistics from "@/hooks/use-statistics"

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
  const [timeFilter, setTimeFilter] = useState("all-days")
  
  const { data: stats, isLoading, error } = useStatistics()
  


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

  // Filter data based on selected filters
  const filterDataByTime = (data, filter) => {
    if (!data || filter === "all" || filter === "all-days") return data;
    
    const now = new Date();
    let cutoffDate;
    
    switch (filter) {
      case "1h":
        cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all-days":
        return data; // Show all available data
      default:
        return data;
    }
    
    // For daily trends, filter by date
    if (Array.isArray(data)) {
      return data.filter(item => {
        const itemDate = new Date(item.day);
        return itemDate >= cutoffDate;
      });
    }
    
    return data;
  };





  // Apply filters to the data
  const filteredDailyTrends = filterDataByTime(stats?.daily_trends, timeFilter);

  // Transform API data for charts with filtering
  const disasterTypeData = stats?.reports_by_type?.map(item => ({
    type: item.disaster_type.charAt(0).toUpperCase() + item.disaster_type.slice(1),
    count: item.count
  })) || []

  const dailyTrendsData = filteredDailyTrends?.map(item => ({
    day: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: item.count
  })) || []

  const statusData = stats?.reports_by_status?.map(item => ({
    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    count: item.count
  })) || []





  // Color arrays for pie charts
  const disasterTypeColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Calculate totals
  const filteredTotalReports = stats?.total_reports || 0;
  const filteredResolved = stats?.resolved_vs_pending?.resolved || 0;
  const filteredPending = stats?.resolved_vs_pending?.pending || 0;

  if (isLoading) {
    return (
      <NadmoLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard statistics...</div>
          </div>
        </div>
      </NadmoLayout>
    )
  }

  if (error) {
    return (
      <NadmoLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading dashboard statistics</div>
          </div>
        </div>
      </NadmoLayout>
    )
  }

  // Real stats cards data with filtering
  const disasterStats = [
    { 
      name: "Total Reports", 
      value: filteredTotalReports, 
      icon: AlertTriangle, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50" 
    },
    { 
      name: "Resolved", 
      value: filteredResolved, 
      icon: CheckCircle, 
      color: "text-green-600", 
      bgColor: "bg-green-50" 
    },
    { 
      name: "Pending", 
      value: filteredPending, 
      icon: Clock, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50" 
    },
    { 
      name: "Active Alerts", 
      value: filteredPending, 
      icon: AlertTriangle, 
      color: "text-red-600", 
      bgColor: "bg-red-50" 
    },
  ]

  // Add filter indicator
  const getFilterIndicator = () => {
    const indicators = [];
    if (timeFilter !== "24h" && timeFilter !== "all-days") {
      indicators.push(`Time: ${timeFilter}`);
    }
    return indicators.length > 0 ? `(${indicators.join(', ')})` : '';
  };

  return (
    <NadmoLayout >
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Disaster Alert Dashboard</h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Real-time emergency response monitoring {getFilterIndicator()}
            </p>
          </div>
          <div className="flex justify-end">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-days">All Days</SelectItem>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
          {disasterStats.map((stat) => (
            <Card key={stat.name} className="relative overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
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

       
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 w-full">
          {/* Daily Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Daily Report Trends</CardTitle>
              <CardDescription className="text-sm">
                Number of reports submitted per day 
                {timeFilter !== "24h" && timeFilter !== "all-days" && ` (Time: ${timeFilter})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <ChartContainer config={{}} className="h-64 lg:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Disaster Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">Disaster Types</CardTitle>
              <CardDescription className="text-sm">
                Reports by disaster type
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <ChartContainer config={{}} className="h-64 lg:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={disasterTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {disasterTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={disasterTypeColors[index % disasterTypeColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alerts Carousel */}
        <SwiperCarousel alerts={emergencyAlerts} />
      </div>
    </NadmoLayout>
  )
}
