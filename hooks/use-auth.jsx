'use client';

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/lib/utils";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();

  const cookieUserKey = 'edu_user';
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout/`, {}, { withCredentials: true });
    } catch {}
    
    Cookies.remove('accessToken');
    Cookies.remove(cookieUserKey);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    router.push("/login");
  };

  // Setup Axios Interceptor for Refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/login")
        ) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(`${BASE_URL}/refresh/`, {}, { withCredentials: true });
            const newAccessToken = response.data.access;

            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            Cookies.set('accessToken', newAccessToken);

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (err) {
            logout();
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // --- Fetch User from Cookie ---
  useEffect(() => {
    setMounted(true);
    const token = Cookies.get('accessToken');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // expired
        } else {
          const user = Cookies.get(cookieUserKey);
          setUser(user ? JSON.parse(user) : null);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        logout();
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await axios.post(`${BASE_URL}/login/`, { email, password }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      Cookies.set('accessToken', data.access);
      Cookies.set(cookieUserKey, JSON.stringify(data.user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      setUser(data.user);

      toast({ title: "Login Successful", description: "Redirecting..." });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        className: "bg-red-500 text-white",
        title: "Login Failed",
        description: error?.response?.data?.error || "Invalid credentials",
      });
    },
  });



  const login = (email, password) => loginMutation.mutateAsync({ email, password });


  return {
    login,
    logout,
    user: mounted ? user : null,
    mounted,
    isPending: loginMutation.isPending ,
    isError: loginMutation.isError ,
    error: loginMutation.error,
  };
}
