"use client";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


const fetchUser = async (system) => {
    try {
     
      const response = await axios.get(`${BASE_URL}/users/`);
  
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

export function useUsers(system) {
  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", system],
    queryFn: () => fetchUser(system)  
    
  });

  return {
    users: data?.results || [],
    isPending,
    error,
    refetch,
  };
} 