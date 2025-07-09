"use client";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


const fetchRReports = async () => {
    try {
     
      const response = await axios.get(`${BASE_URL}/reports/`);
  
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

export function useReport() {
  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["report"],
    queryFn: () => fetchRReports()  
    
  });

  return {
    users: data?.results || [],
    isPending,
    error,
    refetch,
  };
} 