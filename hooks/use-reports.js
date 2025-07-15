"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

console.log("BASE_URL", BASE_URL);

const fetchReports = async (page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

export default function useReports(page = 1) {
  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reports", page],
    queryFn: () => fetchReports(page)
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