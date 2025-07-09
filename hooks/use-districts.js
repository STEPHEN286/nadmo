import { BASE_URL } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useDistricts = (regionId, userRole, userRegionId) => {
  console.log("selected region", regionId)
  return useQuery({
    queryKey: ['districts', regionId, userRole, userRegionId],
    queryFn: async () => {
      let url = `${BASE_URL}/districts/`
      const params = []
      
      // Add user role for filtering
      if (userRole) params.push(`userRole=${userRole}`)
      
      // For REGIONAL_OFFICER, only pass userRegionId if no specific regionId is selected
      // This allows them to select districts from any region they choose
      if (userRegionId && (userRole !== 'GES_REGIONAL_OFFICER' || !regionId)) {
        params.push(`userRegionId=${userRegionId}`)
      }
      
      // Add region filter for all users except DISTRICT_OFFICER who is restricted to their assigned district
      if (userRole !== 'GES_DISTRICT_OFFICER') {
        if (regionId) params.push(`region=${regionId}`)
      }
      
      if (params.length > 0) url += `?${params.join('&')}`
      // console.log("url", url)
      const response = await axios.get(url)
      return response.data.results
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
} 