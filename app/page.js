"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useReporterAuth } from "@/hooks/use-reporter-auth"

export default function HomePage() {
  const router = useRouter()
  const { user: nadmoUser, mounted: nadmoMounted } = useAuth()
  const { mounted: reporterMounted } = useReporterAuth()

  useEffect(() => {
    if (!nadmoMounted || !reporterMounted) return

    // Admin/staff: dashboard
    if (nadmoUser && (nadmoUser.role === "admin" || nadmoUser.is_staff)) {
      router.push("/dashboard")
      return
    }

    
    router.push("/emergency")
  }, [nadmoUser, nadmoMounted, reporterMounted, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
