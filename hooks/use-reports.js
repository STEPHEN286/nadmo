"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// console.log("BASE_URL", BASE_URL);

const fetchReports = async (page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    // Add filter parameters
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.type && filters.type !== 'all') params.append('disaster_type', filters.type);
    if (filters.severity && filters.severity !== 'all') params.append('severity_level', filters.severity);
    if (filters.region && filters.region !== 'all') params.append('region', filters.region);
    if (filters.date && filters.date !== 'all') params.append('date_filter', filters.date);
    if (filters.sortField) params.append('ordering', filters.sortDirection === 'desc' ? `-${filters.sortField}` : filters.sortField);
    
    const response = await axios.get(`${BASE_URL}/reports/?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

export default function useReports(page = 1, filters = {}) {
  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reports", page, filters],
    queryFn: () => fetchReports(page, filters),
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  console.log(`useReports hook - page ${page}:`, {
    reportsCount: data?.results?.length || 0,
    totalCount: data?.count || 0,
    isPending,
    hasError: !!error,
    sampleReport: data?.results?.[0] ? {
      id: data.results[0].id,
      status: data.results[0].status
    } : null
  });

  return {
    reports: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    isPending,
    error,
    refetch,
  };
} 

const updateReportStatus = async ({ reportId, status }) => {
  console.log("Making API call to update status:", { reportId, status });
  try {
    const response = await axios.patch(`${BASE_URL}/reports/${reportId}/`, { status });
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API call failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
};

export function useUpdateReportStatus(page) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: updateReportStatus,
    onSuccess: (data, variables) => {
      console.log("Status update successful:", variables);
      console.log("API response data:", data);
      
      // Invalidate user reports query using current user id
      if (user && user.id) {
        queryClient.invalidateQueries({ queryKey: ["user-reports", user.id] });
      }
      // Invalidate the single report view query
      if (variables && variables.reportId) {
        queryClient.invalidateQueries({ queryKey: ["report", variables.reportId] });
      }
      // Invalidate ALL reports queries (including paginated ones) - more aggressive invalidation
      queryClient.invalidateQueries({ 
        queryKey: ["reports", page],
        exact: false 
      });
      
      console.log("Cache invalidation completed for page:", page);
      
      toast({
        title: "Status Updated",
        description: `Report status updated to ${variables.status}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      console.error("Status update failed:", error);
      toast({
        title: "Update Failed",
        description: error?.response?.data?.message || error.message || "Failed to update report status.",
        variant: "destructive",
      });
    },
  });
}



export function useUpdateReport() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: updateReport,
    onSuccess: (data, variables) => {
      // Invalidate user reports query using current user id
      if (user && user.id) {
        queryClient.invalidateQueries({ queryKey: ["user-reports", user.id] });
      }
      // Invalidate the single report view query
      if (variables && variables.reportId) {
        queryClient.invalidateQueries({ queryKey: ["report", variables.reportId] });
      }
      // Invalidate the reports list query
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Report Updated",
        description: "Your report has been updated.",
      });
      router.push("/emergency/profile");
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error?.response?.data?.message || error.message || "Failed to update report.",
        variant: "destructive",
      });
    },
  });
}

const fetchPendingReports = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/pending/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

export function usePendingReports() {
  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pending-reports"],
    queryFn: fetchPendingReports,
    staleTime: 0,
  });

  return {
    reports: data,
   
    isPending,
    error,
    refetch,
  };
}

