"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function UnderConstruction({ 
  title = "Page Under Construction", 
  description = "This page is currently being developed. Please check back later.",
  showBackButton = true,
  showHomeButton = true,
  customGif = null
}) {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {customGif ? (
            <div className="mx-auto mb-4 flex justify-center">
              <img 
                src={customGif} 
                alt="404 Error" 
                className="h-32 w-32 object-contain"
                onError={(e) => {
                  // Fallback to wrench icon if GIF fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100" style={{ display: 'none' }}>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          ) : (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {showBackButton && (
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            {showHomeButton && (
              <Button asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 