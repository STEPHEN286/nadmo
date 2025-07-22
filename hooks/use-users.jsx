"use client";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";



const fetchUser = async (page ) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/?page=${page}`);
      console.log("user", response.data)
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

export function useUsers(page = 1) {
  const {
    data,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUser(page)
  });

  return {
    users: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    isPending,
    error,
    refetch,
  };
} 