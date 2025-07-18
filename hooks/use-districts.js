import { BASE_URL } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useDistricts = () => {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/districts/`)
        // Always return an array, never undefined
        console.log("district", response)
        return response?.data 
      } catch (error) {
        console.error("Error fetching districts:", error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}