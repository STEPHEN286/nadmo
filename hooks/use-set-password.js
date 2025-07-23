import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

export function useSetPassword({ onSuccess, onError } = {}) {
  const mutation = useMutation({
    mutationFn: async ({ uid, token, password }) => {
      const res = await axios.post(`${BASE_URL}/auth/set-password/`, { uid, token, password });
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (onError) onError(error, variables, context);
    },
  });

  return {
    setPassword: mutation.mutate,
    setPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
} 