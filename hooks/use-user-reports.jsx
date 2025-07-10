import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils.js";

const fetchUserReports = async (userId) => {
  if (!userId) return [];
  const response = await axios.get(`${BASE_URL}/reports/reporter/${userId}/`);
  return response.data;
};

export default function useUserReports(userId) {
  return useQuery({
    queryKey: ["user-reports", userId],
    queryFn: () => fetchUserReports(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 