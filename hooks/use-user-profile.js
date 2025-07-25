"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const PROFILE_ENDPOINT = `${BASE_URL}/users/profile/`;

const fetchUserProfile = async () => {
  try {
    const response = await axios.get(PROFILE_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

const updateUserProfile = async ({ userId, profileData }) => {

  const endpoint = `${BASE_URL}/users/${userId}/`;
  try {
    const response = await axios.patch(endpoint, profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

export function useProfile(options = {}) {
  const queryClient = useQueryClient();

  // Fetch profile
  const {
    data: profile,
    isPending: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    ...options,
  });

  // Update profile
  const {
    mutate: updateProfile,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile.",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isProfileLoading,
    profileError,
    refetchProfile,
    updateProfile,
    isUpdating,
    updateError,
    updateSuccess,
  };
} 