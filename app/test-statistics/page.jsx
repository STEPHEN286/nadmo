"use client"

import { useEffect } from "react"
import useStatistics, { 
  useDashboardStats, 
  useReportStatusStats, 
  useDisasterTypeStats, 
  useTrendStats 
} from "@/hooks/use-statistics"

export default function TestStatisticsPage() {
  // Test all the statistics hooks
  const allStats = useStatistics()
  const dashboardStats = useDashboardStats()
  const statusStats = useReportStatusStats()
  const disasterStats = useDisasterTypeStats()
  const trendStats = useTrendStats()

  // Log all statistics data
  useEffect(() => {
    console.log("=== ALL STATISTICS ===")
    console.log("All Stats:", allStats)
    console.log("Dashboard Stats:", dashboardStats)
    console.log("Status Stats:", statusStats)
    console.log("Disaster Stats:", disasterStats)
    console.log("Trend Stats:", trendStats)
    
    if (allStats.data) {
      console.log("=== DETAILED BREAKDOWN ===")
      console.log("Total Reports:", allStats.data.totalReports)
      console.log("Status Breakdown:", allStats.data.statusBreakdown)
      console.log("Disaster Type Breakdown:", allStats.data.disasterTypeBreakdown)
      console.log("Severity Breakdown:", allStats.data.severityBreakdown)
      console.log("Recent Reports:", allStats.data.recentReports)
      console.log("People Injured:", allStats.data.peopleInjured)
      console.log("Daily Trends:", allStats.data.trends.daily)
      console.log("Weekly Trends:", allStats.data.trends.weekly)
      console.log("Monthly Trends:", allStats.data.trends.monthly)
    }
  }, [allStats.data, dashboardStats.data, statusStats.data, disasterStats.data, trendStats.data])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Statistics Test Page</h1>
      
      <div className="space-y-6">
        {/* All Statistics */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">All Statistics</h2>
          <div className="text-sm">
            <p>Loading: {allStats.isLoading ? "Yes" : "No"}</p>
            <p>Error: {allStats.error ? allStats.error.message : "None"}</p>
            <p>Data: {allStats.data ? "Available" : "Not available"}</p>
            {allStats.data && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(allStats.data, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Dashboard Statistics</h2>
          <div className="text-sm">
            <p>Loading: {dashboardStats.isLoading ? "Yes" : "No"}</p>
            <p>Error: {dashboardStats.error ? dashboardStats.error.message : "None"}</p>
            <p>Total Reports: {dashboardStats.totalReports}</p>
            <p>Recent Reports: {dashboardStats.recentReports}</p>
            <p>People Injured: {dashboardStats.peopleInjured}</p>
            {dashboardStats.statusBreakdown && (
              <div className="mt-2">
                <p className="font-medium">Status Breakdown:</p>
                <pre className="p-2 bg-gray-100 rounded text-xs">
                  {JSON.stringify(dashboardStats.statusBreakdown, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Status Statistics */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Status Statistics</h2>
          <div className="text-sm">
            <p>Loading: {statusStats.isLoading ? "Yes" : "No"}</p>
            <p>Error: {statusStats.error ? statusStats.error.message : "None"}</p>
            <p>Total Reports: {statusStats.totalReports}</p>
            {statusStats.statusStats && (
              <div className="mt-2">
                <p className="font-medium">Status Stats:</p>
                <pre className="p-2 bg-gray-100 rounded text-xs">
                  {JSON.stringify(statusStats.statusStats, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Disaster Type Statistics */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Disaster Type Statistics</h2>
          <div className="text-sm">
            <p>Loading: {disasterStats.isLoading ? "Yes" : "No"}</p>
            <p>Error: {disasterStats.error ? disasterStats.error.message : "None"}</p>
            <p>Total Reports: {disasterStats.totalReports}</p>
            {disasterStats.disasterTypeStats && (
              <div className="mt-2">
                <p className="font-medium">Disaster Type Stats:</p>
                <pre className="p-2 bg-gray-100 rounded text-xs">
                  {JSON.stringify(disasterStats.disasterTypeStats, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Trend Statistics */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Trend Statistics</h2>
          <div className="text-sm">
            <p>Loading: {trendStats.isLoading ? "Yes" : "No"}</p>
            <p>Error: {trendStats.error ? trendStats.error.message : "None"}</p>
            <p>Daily Trends Count: {trendStats.dailyTrends?.length || 0}</p>
            <p>Weekly Trends Count: {trendStats.weeklyTrends?.length || 0}</p>
            <p>Monthly Trends Count: {trendStats.monthlyTrends?.length || 0}</p>
            {trendStats.dailyTrends && trendStats.dailyTrends.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Sample Daily Trend:</p>
                <pre className="p-2 bg-gray-100 rounded text-xs">
                  {JSON.stringify(trendStats.dailyTrends[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 