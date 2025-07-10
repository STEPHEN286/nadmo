"use client"

import { useEffect, useState, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Phone, Copy, Search } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/ui/back-button"
import { useRouter, useSearchParams } from "next/navigation"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function ReportConfirmationContent() {
  const [reportId, setReportId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      // Get report ID from URL query parameter
      const urlReportId = searchParams.get("id")
      if (urlReportId) {
        setReportId(urlReportId)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error getting search params:', error)
      setIsLoading(false)
    }
  }, [searchParams])

  const copyReportId = () => {
    navigator.clipboard.writeText(reportId)
    toast({
      title: "Copied!",
      description: "Report ID copied to clipboard",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <BackButton variant="ghost" size="sm" onClick={() => router.push("/emergency")}>
              Back to Emergency Home
            </BackButton>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Report Submitted</h1>
                <p className="text-sm text-gray-600">Ghana Disaster Alert System</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Report</h1>
              <p className="text-gray-600">
                Your emergency report has been received and emergency services have been notified.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-green-800 mb-2 font-medium">Your Report ID:</p>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-2xl font-bold text-green-900 font-mono">{reportId}</p>
                <Button variant="ghost" size="sm" onClick={copyReportId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-green-700 mt-2">Save this ID to track your report status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Response Time</span>
                </div>
                <p className="text-red-800">Emergency services typically respond within 15-30 minutes</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Emergency Hotline</span>
                </div>
                <p className="text-red-800 font-mono">0800-111-222</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-yellow-900 mb-2">What happens next:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• NADMO emergency services have been automatically notified</li>
                <li>• Response teams will be dispatched based on the severity and location</li>
                <li>• You can track the status of your report using the ID above</li>
                <li>• If you provided contact details, we may call for additional information</li>
                <li>• For immediate life-threatening emergencies, call 191, 192, or 193</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/emergency/track-report" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Search className="h-4 w-4 mr-2" />
                  Track This Report
                </Button>
              </Link>
              <Link href="/emergency/report-disaster" className="block">
                <Button variant="outline" className="w-full">
                  Report Another Emergency
                </Button>
              </Link>
              <Link href="/emergency" className="block">
                <Button variant="ghost" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">Need immediate assistance?</p>
          <div className="flex justify-center space-x-4">
            <span>
              Police: <strong>191</strong>
            </span>
            <span>
              Fire: <strong>192</strong>
            </span>
            <span>
              Ambulance: <strong>193</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function ReportConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReportConfirmationContent />
    </Suspense>
  )
}
