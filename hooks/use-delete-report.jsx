import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

export const useDeleteReport = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId) => {
      const { data } = await axios.delete(`${BASE_URL}/reports/${reportId}/`);
      return data;
    },
    onSuccess: (data, reportId) => {
      toast({
        title: "Success",
        description: data?.message || "Report deleted successfully",
      });
      // Invalidate and refetch reports list (including paginated queries)
      queryClient.invalidateQueries({ queryKey: ["reports"], exact: false });
      // Invalidate user reports query
      queryClient.invalidateQueries({ queryKey: ["user-reports"], exact: false });
      // Invalidate the specific report query
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || error.message || "Failed to delete report",
        variant: "destructive",
      });
    },
  });
}; 