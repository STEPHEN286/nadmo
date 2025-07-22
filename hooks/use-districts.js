import { BASE_URL } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'


export const useDistricts = (regionId) => {
  return useQuery({
    queryKey: ['districts', regionId],
    queryFn: async () => {
      if (!regionId) return [];
      const response = await axios.get(`${BASE_URL}/districts/?region=${regionId}`);
      return response.data;
    },
    enabled: !!regionId, // Only run if regionId is truthy
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};