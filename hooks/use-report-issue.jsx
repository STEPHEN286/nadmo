import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "./use-toast.jsx";
import { BASE_URL } from "@/lib/utils.js";
import { useRouter } from "next/navigation.js";
import { useReporterAuth } from "@/hooks/use-reporter-auth";


// Replace with your actual API endpoint

const postReport = async (reportData) => {
  console.log("report", reportData)
  const response = await axios.post(`${BASE_URL}/reports/`, reportData, 
   { headers: {
      'Content-Type': 'multipart/form-data'
    }}
  );
  return response.data;
};

export default function useReportIssue() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useReporterAuth();
  return useMutation({
    mutationFn: postReport,
    onSuccess: (data) => {
      // Invalidate user reports query using current user id
      if (user && user.id) {
        queryClient.invalidateQueries({ queryKey: ["user-reports", user.id] });
      }
      toast({
        title: "Report submitted",
        description: "Your report has been successfully submitted.",
      });
      router.push(`/emergency/report-confirmation?id=${data.data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error?.response?.data?.message || error.message || "An error occurred while submitting your report.",
      });
    },
  });
}

const updateReport = async ({ id, data }) => {
  const response = await axios.put(`${BASE_URL}/reports/${id}/`, data,  { headers: {
    'Content-Type': 'multipart/form-data'
  }});
  return response.data;
};

export function useUpdateReport() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useReporterAuth();
  return useMutation({
    mutationFn: updateReport,
    onSuccess: (data, variables) => {
      // Invalidate user reports query using current user id
      if (user && user.id) {
        queryClient.invalidateQueries({ queryKey: ["user-reports", user.id] });
      }
      // Invalidate the single report view query
      if (variables && variables.id) {
        queryClient.invalidateQueries({ queryKey: ["report", variables.id] });
      }
      // Invalidate ALL reports queries (including paginated ones)
      queryClient.invalidateQueries({ 
        queryKey: ["reports"],
        exact: false 
      });
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
