"use client"

import { useReporterAuth } from "@/hooks/use-reporter-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, LogIn, User, Phone, MapPin, Clock } from "lucide-react"

export function EmergencyLayout({ children }) {
  const router = useRouter()
  const { user, mounted } = useReporterAuth()

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">Ghana Emergency Alert</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!mounted ? (
                // Show loading state while checking authentication
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/emergency/profile')}
                  className="flex items-center space-x-2 px-3"
                >
                  <User className="h-5 w-5 text-red-600" />
                  <span className="hidden sm:inline text-gray-900 font-medium">{user.profile.full_name || "Reporter"}</span>
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/emergency/auth/login')} 
                    className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => router.push('/emergency/auth/signup')} 
                    className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 bg-red-600 hover:bg-red-700"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Emergency Contact */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <div className="bg-red-600 p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Emergency Contact</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="h-4 w-4 mr-2 text-red-400" />
                  <span className="font-semibold">0800-111-222</span>
                </div>
                <p className="text-gray-300 text-sm">Toll-free nationwide</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button 
                  variant="link" 
                  className="text-gray-300 hover:text-white p-0 h-auto"
                  onClick={() => router.push('/emergency')}
                >
                  Report Emergency
                </Button>
                <br />
                <Button 
                  variant="link" 
                  className="text-gray-300 hover:text-white p-0 h-auto"
                  onClick={() => router.push('/emergency/track-report')}
                >
                  Track Report
                </Button>
                <br />
                <Button 
                  variant="link" 
                  className="text-gray-300 hover:text-white p-0 h-auto"
                  onClick={() => router.push('/emergency/auth/login')}
                >
                  Login
                </Button>
              </div>
            </div>

            {/* About NADMO */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold mb-4">About NADMO</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-center justify-center md:justify-end">
                  <MapPin className="h-4 w-4 mr-2 text-red-400" />
                  <span>Accra, Greater Accra Region</span>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <Clock className="h-4 w-4 mr-2 text-red-400" />
                  <span>24/7 Emergency Response</span>
                </div>
                <p>National Disaster Management Organisation</p>
                <p>Ministry of Interior • Established 1996</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Ghana Emergency Alert System. Protecting lives and property through rapid emergency response.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 