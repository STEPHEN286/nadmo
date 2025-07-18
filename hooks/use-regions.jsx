import { BASE_URL } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchRegions = async () => {
  const response = await axios.get(`${BASE_URL}/regions/`);
  console.log("data for regions", response.data.results)
  return response?.data;
};

export const useRegions = () =>
  useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 60,        // 1 hour
    cacheTime: 1000 * 60 * 60 * 24,   // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
