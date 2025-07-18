import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

const postUser = async (userData) => {
  // console.log("postUser called with:", userData);
  try {
    const response = await axios.post(`${BASE_URL}/users/`, userData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to add user';
    throw new Error(errorMessage);
  }
};

const updateUserData = async ({ id, userData }) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, userData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to update user';
    throw new Error(errorMessage);
  }
};

export function useAddUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addUserMutation = useMutation({
    mutationFn: postUser,
    onSuccess: (data) => {
      const emailStatus = data.emailSent 
        ? "Welcome email sent successfully." 
        : "User created but email delivery failed.";
      
      toast({
        title: "User added successfully",
        description: `${data.user?.fullName || 'User'} has been added to the system. ${emailStatus}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.log("Mutation error:", error);
      toast({
        title: "Error adding user",
        description: error.message || "Something went wrong. Please try again.",
        className: "bg-red-600 text-white",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: (data) => {
      toast({
        title: "User updated successfully",
        description: `${data.user?.fullName || 'User'}'s information has been updated.`,
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
      
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating user",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addUser = (userData) => {
    console.log("Calling addUser", userData);
    return addUserMutation.mutate(userData);
  };

  const updateUser = (id, userData) => {
    return updateUserMutation.mutate({ id, userData });
  };

  return {
    addUser,
    updateUser,
    addUserLoading: addUserMutation.isPending,
    updateUserLoading: updateUserMutation.isPending,
    addUserError: addUserMutation.error,
    updateUserError: updateUserMutation.error,
    addUserSuccess: addUserMutation.isSuccess,
    updateUserSuccess: updateUserMutation.isSuccess,
  };
} 