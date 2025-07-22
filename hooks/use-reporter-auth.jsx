'use client';

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/lib/utils";

export function useReporterAuth() {
  const router = useRouter();
  const { toast } = useToast();

  const cookieUserKey = 'nadmo_reporter';
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout/`, {}, { withCredentials: true });
    } catch {}
    
    Cookies.remove('reporterAccessToken');
    Cookies.remove(cookieUserKey);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    router.push("/emergency");
  };

  // Setup Axios Interceptor for Refresh (only if refresh endpoint exists)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/login") &&
          !originalRequest.url.includes("/register")
        ) {
          originalRequest._retry = true;

          try {
            // Only try refresh if the endpoint exists
            const response = await axios.post(`${BASE_URL}/refresh/`, {}, { withCredentials: true });
            const newAccessToken = response.data.access;

            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            Cookies.set('reporterAccessToken', newAccessToken);

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
    const token = Cookies.get('reporterAccessToken');

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
      const userData = {
        ...data.user,
        phone_number: data.user.profile?.phone_number,
        region: data.user.profile?.region,
        district: data.user.profile?.district,
      };
      
      // Store access token and user data
      if (data.access) {
        Cookies.set('reporterAccessToken', data.access);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      }
      Cookies.set(cookieUserKey, JSON.stringify(userData));
      setUser(userData);

      toast({ title: "Login Successful", description: "Welcome back! Redirecting..." });
      router.push("/emergency");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error?.response?.data?.error || "Invalid credentials",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password, full_name, phone_number, region, district }) => {
      const res = await axios.post(`${BASE_URL}/auth/register/`, { 
        email, 
        full_name,
        password, 
        phone_number, 
        region, 
        district
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Handle the actual API response format
      const userData = {
        ...data.user,
        phone_number: data.user.profile?.phone_number,
        region: data.user.profile?.region,
        district: data.user.profile?.district,
      };
      
    //   // Store user data in cookie (no access token in signup response)
    //   Cookies.set(cookieUserKey, JSON.stringify(userData));
    //   setUser(userData);

      toast({ title: "Account Created Successfully", description: "Please sign in to continue..." });
      router.push("/emergency/auth/login");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error?.response?.data?.error || "Failed to create account",
      });
    },
  });

  const login = (email, password) => loginMutation.mutateAsync({ email, password });
  const signup = (userData) => signupMutation.mutateAsync(userData);

  return {
    login,
    signup,
    logout,
    user: mounted ? user : null,
    mounted,
    isPending: loginMutation.isPending || signupMutation.isPending,
    isError: loginMutation.isError || signupMutation.isError,
    error: loginMutation.error || signupMutation.error,
  };
} 