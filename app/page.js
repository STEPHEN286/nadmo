"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("unified_app_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      router.push("/edu-track/dashboard")
    } else {
      setIsLoading(false)
      router.push("/login")
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return null
}
