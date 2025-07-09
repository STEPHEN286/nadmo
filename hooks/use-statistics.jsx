import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils.js";
import Cookies from "js-cookie";

// Fallback function to calculate statistics from reports data
const calculateFallbackStatistics = (reports) => {
  if (!reports || !Array.isArray(reports)) {
    return {
      total_reports: 0,
      recent_reports: 0,
      people_injured: 0,
      status_breakdown: {},
      disaster_type_breakdown: {},
      severity_breakdown: {},
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      }
    };
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Status breakdown
  const statusBreakdown = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});

  // Disaster type breakdown
  const disasterTypeBreakdown = reports.reduce((acc, report) => {
    acc[report.disaster_type] = (acc[report.disaster_type] || 0) + 1;
    return acc;
  }, {});

  // Severity breakdown
  const severityBreakdown = reports.reduce((acc, report) => {
    acc[report.severity_level] = (acc[report.severity_level] || 0) + 1;
    return acc;
  }, {});

  // Recent reports (last 24 hours)
  const recentReports = reports.filter(report => 
    new Date(report.created_at) >= oneDayAgo
  ).length;

  // People injured
  const peopleInjured = reports.reduce((total, report) => {
    return total + (report.number_injured || 0);
  }, 0);

  return {
    total_reports: reports.length,
    recent_reports: recentReports,
    people_injured: peopleInjured,
    status_breakdown: statusBreakdown,
    disaster_type_breakdown: disasterTypeBreakdown,
    severity_breakdown: severityBreakdown,
    trends: {
      daily: [],
      weekly: [],
      monthly: []
    }
  };
};

// Mock statistics for when all else fails
const getMockStatistics = () => {
  console.warn("Using mock statistics due to backend issues");
  return {
    total_reports: 0,
    recent_reports: 0,
    people_injured: 0,
    status_breakdown: {
      pending: 0,
      in_progress: 0,
      resolved: 0
    },
    disaster_type_breakdown: {
      flood: 0,
      fire: 0,
      earthquake: 0
    },
    severity_breakdown: {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0
    },
    trends: {
      daily: [],
      weekly: [],
      monthly: []
    }
  };
};

// Fetch statistics from the dedicated stats endpoint
const fetchStatistics = async () => {
  try {
    // Get the access token from cookies
    const accessToken = Cookies.get('accessToken') || Cookies.get('reporterAccessToken');
    
    if (!accessToken) {
      throw new Error("Authentication required");
    }

    console.log("Attempting to fetch statistics from:", `${BASE_URL}/reports/stats/`);
    
    const response = await axios.get(`${BASE_URL}/reports/stats/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Statistics response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Statistics fetch error:", error);
    console.error("Error response status:", error.response?.status);
    console.error("Error response data type:", typeof error.response?.data);
    console.error("Error response data preview:", 
      typeof error.response?.data === 'string' 
        ? error.response.data.substring(0, 200) + '...' 
        : error.response?.data
    );
    
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    
    // Handle any 500 error or HTML error response - use fallback
    if (error.response?.status === 500 || 
        (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<html>'))) {
      console.warn("Backend statistics endpoint returned error (500 or HTML). Using fallback statistics.");
      
      // Try to fetch reports and calculate statistics locally
      try {
        console.log("Attempting fallback: fetching reports from:", `${BASE_URL}/reports/`);
        
        const reportsResponse = await axios.get(`${BASE_URL}/reports/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const reports = reportsResponse.data?.results || [];
        console.log("Fallback reports data:", reports);
        
        const fallbackStats = calculateFallbackStatistics(reports);
        console.log("Calculated fallback statistics:", fallbackStats);
        
        return fallbackStats;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        console.warn("Both statistics endpoints failed, using mock data");
        return getMockStatistics();
      }
    }
    
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch statistics");
  }
};

export default function useStatistics(options = {}) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  // Check if user is authenticated
  const accessToken = Cookies.get('accessToken') || Cookies.get('reporterAccessToken');
  const isAuthenticated = !!accessToken;

  return useQuery({
    queryKey: ["statistics"],
    queryFn: fetchStatistics,
    enabled: enabled && isAuthenticated,
    staleTime,
    refetchInterval,
  });
}

// Specialized hooks for specific statistics
export function useReportStatusStats(options = {}) {
  const { data: stats, ...rest } = useStatistics(options);
  
  return {
    statusStats: stats?.status_breakdown || stats?.statusBreakdown || {},
    totalReports: stats?.total_reports || stats?.totalReports || 0,
    ...rest
  };
}

export function useDisasterTypeStats(options = {}) {
  const { data: stats, ...rest } = useStatistics(options);
  
  return {
    disasterTypeStats: stats?.disaster_type_breakdown || stats?.disasterTypeBreakdown || {},
    totalReports: stats?.total_reports || stats?.totalReports || 0,
    ...rest
  };
}

export function useTrendStats(options = {}) {
  const { data: stats, ...rest } = useStatistics(options);
  
  return {
    dailyTrends: stats?.trends?.daily || stats?.daily_trends || [],
    weeklyTrends: stats?.trends?.weekly || stats?.weekly_trends || [],
    monthlyTrends: stats?.trends?.monthly || stats?.monthly_trends || [],
    ...rest
  };
}

export function useDashboardStats(options = {}) {
  const { data: stats, ...rest } = useStatistics(options);
  
  return {
    totalReports: stats?.total_reports || stats?.totalReports || 0,
    recentReports: stats?.recent_reports || stats?.recentReports || 0,
    peopleInjured: stats?.people_injured || stats?.peopleInjured || 0,
    statusBreakdown: stats?.status_breakdown || stats?.statusBreakdown || {},
    disasterTypeBreakdown: stats?.disaster_type_breakdown || stats?.disasterTypeBreakdown || {},
    severityBreakdown: stats?.severity_breakdown || stats?.severityBreakdown || {},
    ...rest
  };
} 