import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export const useDeleteUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await axios.delete(`/api/users/${userId}` );
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success", 
        description: data.message || "User deleted successfully",
      });
      
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });
};