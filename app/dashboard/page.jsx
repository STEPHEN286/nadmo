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
import useStatistics from "@/hooks/use-statistics"
import { useRegions } from "@/hooks/use-regions"
import { useDistricts } from "@/hooks/use-districts"

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
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all-days")
  
  const { data: stats, isLoading, error } = useStatistics()
  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(selectedRegion !== "all" ? selectedRegion : null)

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

  const filterDataByRegion = (data, filter) => {
    if (!data || filter === "all") return data;
    
    // For region breakdown, filter by region
    if (Array.isArray(data)) {
      return data.filter(item => {
        const regionId = item.reporter__profile__region;
        
        // Handle null region values
        if (filter === "no-region") {
          return regionId === null;
        }
        
        if (!regionId) return false;
        
        // Find the region name from the regions data
        const region = regions?.find(r => r.id === regionId);
        if (!region) return false;
        
        // Convert region name to match filter format
        const regionName = region.name.toLowerCase().replace(/\s+/g, '-');
        return regionName === filter;
      });
    }
    
    return data;
  };

  const filterDataByDistrict = (data, filter) => {
    if (!data || filter === "all") return data;
    
    // For district breakdown, filter by district
    if (Array.isArray(data)) {
      return data.filter(item => {
        const districtId = item.reporter__profile__district;
        
        // Handle null district values
        if (filter === "no-district") {
          return districtId === null;
        }
        
        if (!districtId) return false;
        
        // Find the district name from the districts data
        const district = districts?.find(d => d.id === districtId);
        if (!district) return false;
        
        // Convert district name to match filter format
        const districtName = district.name.toLowerCase().replace(/\s+/g, '-');
        return districtName === filter;
      });
    }
    
    return data;
  };

  // Apply filters to the data
  const filteredDailyTrends = filterDataByTime(stats?.daily_trends, timeFilter);
  const filteredRegionBreakdown = filterDataByRegion(stats?.region_breakdown, selectedRegion);
  const filteredDistrictBreakdown = filterDataByDistrict(stats?.district_breakdown, selectedDistrict);

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

  // Transform region breakdown data with region names
  const regionData = stats?.region_breakdown?.map(item => {
    if (item.reporter__profile__region === null) {
      return {
        region: 'No Region Assigned',
        count: item.count
      };
    }
    
    const region = regions?.find(r => r.id === item.reporter__profile__region);
    return {
      region: region ? region.name : 'Unknown Region',
      count: item.count
    };
  }).filter(item => item.region !== 'Unknown Region') || []

  // Transform district breakdown data with district names
  const districtData = stats?.district_breakdown?.map(item => {
    if (item.reporter__profile__district === null) {
      return {
        district: 'No District Assigned',
        count: item.count
      };
    }
    
    const district = districts?.find(d => d.id === item.reporter__profile__district);
    return {
      district: district ? district.name : 'Unknown District',
      count: item.count
    };
  }).filter(item => item.district !== 'Unknown District') || []

  // Calculate filtered totals
  const filteredTotalReports = filteredDailyTrends?.reduce((sum, item) => sum + item.count, 0) || stats?.total_reports || 0;
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
    if (selectedRegion !== "all") {
      const regionName = selectedRegion === "no-region" ? "No Region" : selectedRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      indicators.push(`Region: ${regionName}`);
    }
    if (selectedDistrict !== "all") {
      const districtName = selectedDistrict === "no-district" ? "No District" : selectedDistrict.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      indicators.push(`District: ${districtName}`);
    }
    return indicators.length > 0 ? `(${indicators.join(', ')})` : '';
  };

  return (
    <NadmoLayout >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Disaster Alert Dashboard</h1>
            <p className="text-gray-600">
              Real-time emergency response monitoring {getFilterIndicator()}
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
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
            <Select value={selectedRegion} onValueChange={(value) => {
              setSelectedRegion(value);
              setSelectedDistrict("all"); // Reset district when region changes
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="no-region">No Region Assigned</SelectItem>
                {regions?.map((region) => (
                  <SelectItem key={region.id} value={region.name.toLowerCase().replace(/\s+/g, '-')}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="no-district">No District Assigned</SelectItem>
                {districts?.map((district) => (
                  <SelectItem key={district.id} value={district.name.toLowerCase().replace(/\s+/g, '-')}>
                    {district.name}
                  </SelectItem>
                ))}
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
          {/* Daily Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Report Trends</CardTitle>
              <CardDescription>
                Number of reports submitted per day {timeFilter !== "24h" && timeFilter !== "all-days" && `(Filtered: ${timeFilter})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
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
              <CardTitle>Disaster Types</CardTitle>
              <CardDescription>Reports by disaster type</CardDescription>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Report Status</CardTitle>
              <CardDescription>Breakdown by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Region Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by Region</CardTitle>
              <CardDescription>Breakdown by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* District Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by District</CardTitle>
              <CardDescription>Breakdown by district</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
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
