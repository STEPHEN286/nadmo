import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

const fetchReportById = async (reportId) => {
  if (!reportId) return null;
  const response = await axios.get(`${BASE_URL}/reports/public/${reportId}/`);
  return response.data;
};

export default function useTrackReport(reportId) {
  return useQuery({
    queryKey: ["track-report", reportId],
    queryFn: () => fetchReportById(reportId),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 