"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Bell, Settings, User, LogIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function Header({ onLogout }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  console.log("Header user:", user);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  }

  // Make role check case-insensitive
  const isAdminOrStaff = user && (user.role?.toLowerCase() === "admin" || user.is_staff);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sticky top-0 z-30 h-[60px]">
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0 lg:ml-0 ml-12">
          {user ? (
            // User is authenticated - show user info
            <div className="flex items-center space-x-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate">
                  Welcome back, {user?.name?.split(" ")[0]}
                </h2>
                <div className="flex items-center space-x-1 sm:space-x-1.5 mt-0.5 flex-wrap">
                  {user?.assignedRegion?.name && (
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3 sm:h-4">
                      {user.assignedRegion.name} Region
                    </Badge>
                  )}
                  {user?.assignedDistrict?.name && (
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3 sm:h-4">
                      {user.assignedDistrict.name} District
                    </Badge>
                  )}
                  <Badge
                    variant={user?.role?.toLowerCase() === "admin" ? "default" : "secondary"}
                    className="text-[9px] sm:text-[10px] capitalize px-1 sm:px-1.5 py-0 h-3 sm:h-4"
                  >
                    {user?.role?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            // User is not authenticated - show NADMO branding
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5 rounded-lg shadow-sm">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate">
                  NADMO Emergency Response
                </h2>
                <p className="text-xs text-gray-500 leading-tight truncate">
                  Report emergencies and track responses
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {user ? (
            // User is authenticated - show user actions
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-7 w-7 sm:h-8 sm:w-8" onClick={() => router.push('/notifications')}>
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <Badge className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center p-0 text-[8px] sm:text-[9px]">
                  3
                </Badge>
              </Button>

              {/* Settings - Hidden on small screens */}
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex" onClick={() => router.push('/settings')}>
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              {/* Logout */}
              <Button variant="outline" onClick={handleLogout} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
                <LogOut className="h-3 w-3 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : !isAdminOrStaff ? (
            // User is not authenticated and not admin/staff - show auth buttons
            <>
              {/* Login Button */}
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')} 
                className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              >
                <LogIn className="h-3 w-3 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Login</span>
              </Button>

              {/* Signup Button */}
              <Button 
                variant="default" 
                onClick={() => router.push('/signup')} 
                className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 bg-red-600 hover:bg-red-700"
              >
                <User className="h-3 w-3 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
