"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import {
  FileText,
//   Search,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  AlertTriangle,
  MapPin,
  FileImage,
  BarChart3,
  Clock,
  Phone,
  Eye,
  Plus,
} from "lucide-react"

// NADMO Navigation
const nadmoNavigation = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: ["ADMIN", "REPORTER", "view_only"],
        badge: null,
      },
      // {
      //   name: "Live Alerts",
      //   href: "/nadmo/alerts",
      //   icon: AlertTriangle,
      //   roles: ["admin", "regional_officer", "district_officer", "view_only"],
      //   badge: "7",
      // },
    ],
  },
  {
    title: "Report Management",
    items: [
      {
        name: "All Reports",
        href: "/reports",
        icon: FileText,
        roles: ["ADMIN", "REPORTER", "view_only"],
        badge: null,
      },
      {
        name: "Map View",
        href: "/nadmo/map",
        icon: MapPin,
        roles: ["ADMIN", "REPORTER", "view_only"],
        badge: null,
      },
      // {
      //   name: "Export Reports",
      //   href: "/export",
      //   icon: FileText,
      //   roles: ["ADMIN", "view_only"],
      //   badge: null,
      // },
      // {
      //   name: "Media Gallery",
      //   href: "/nadmo/media",
      //   icon: FileImage,
      //   roles: ["admin", "regional_officer", "district_officer", "view_only"],
      //   badge: null,
      // },
    ],
  },
 
 
  // {
  //   title: "Public Interface",
  //   items: [
  //     {
  //       name: "Report Disaster",
  //       href: "/nadmo/report",
  //       icon: Plus,
  //       roles: ["admin", "regional_officer", "district_officer", "view_only"],
  //       badge: "Public",
  //     },
  //     {
  //       name: "Public View",
  //       href: "/nadmo/public",
  //       icon: Eye,
  //       roles: ["admin", "regional_officer", "district_officer", "view_only"],
  //       badge: null,
  //     },
  //   ],
  // },
  {
    title: "Administration",
    items: [
      {
        name: "User Management",
        href: "/users",
        icon: Users,
        roles: ["ADMIN", "view_only"],
        badge: null,
      },
      // {
      //   name: "Emergency Contacts",
      //   href: "/nadmo/contacts",
      //   icon: Phone,
      //   roles: ["ADMIN", "REPORTER"],
      //   badge: null,
      // },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["ADMIN", "view_only"],
        badge: null,
      },
    ],
  },
]

export function NadmoSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(false) // Always expanded on mobile when open
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const filteredSections = nadmoNavigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes("view_only")),
    }))
    .filter((section) => section.items.length > 0)

  const closeMobile = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  // Mobile menu button
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden fixed top-4 left-4 z-[60] h-8 w-8"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </Button>
  )

  return (
    <>
      <MobileMenuButton />

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-[40] lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 z-[50] h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-lg overflow-hidden",
          // Mobile behavior
          isMobile
            ? cn("left-0 w-64", isMobileOpen ? "translate-x-0" : "-translate-x-full")
            : cn(
                // Desktop behavior
                "left-0",
                isCollapsed ? "w-16" : "w-64",
              ),
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 flex-shrink-0 h-[60px]">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center space-x-2 min-w-0">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5 rounded-lg shadow-sm flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-gray-900 truncate">NADMO</h1>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight truncate">Emergency Response</p>
                </div>
              </div>
            )}
            {isCollapsed && !isMobile && (
              <div className="mx-auto">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5 rounded-lg shadow-sm">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-6 w-6 hover:bg-gray-100 flex-shrink-0"
              >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
              </Button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2  px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-3">
              {filteredSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  {(!isCollapsed || isMobile) && (
                    <div className="px-3 mb-1">
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-tight truncate">
                        {section.title}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-0.5 px-1 ">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={closeMobile}
                          className={cn(
                            "group flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 w-full",
                            isActive
                              ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                            isCollapsed && !isMobile && "justify-center px-1",
                          )}
                          title={isCollapsed && !isMobile ? item.name : undefined}
                        >
                          <item.icon
                            className={cn(
                              "flex-shrink-0 h-4 w-4",
                              isActive
                                ? "text-red-600"
                                : "text-gray-500 group-hover:text-gray-700",
                              (!isCollapsed || isMobile) && "mr-2",
                            )}
                          />
                          {(!isCollapsed || isMobile) && (
                            <>
                              <span className="flex-1 text-xs leading-tight truncate">{item.name}</span>
                              {item.badge && (
                                <Badge
                                  variant={item.badge === "Public" ? "outline" : "secondary"}
                                  className="ml-1 text-[9px] px-1 py-0 h-4 flex-shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                  {sectionIndex < filteredSections.length - 1 && (!isCollapsed || isMobile) && (
                    <Separator className="mx-3 my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-2 flex-shrink-0">
            {!isCollapsed || isMobile ? (
              <div className="flex items-center space-x-2 min-w-0">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-1 rounded-full flex-shrink-0">
                  <span className="text-white text-[10px] font-semibold leading-none block w-6 h-6 flex items-center justify-center">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate leading-tight">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize truncate leading-tight">
                    {user?.role?.replace("_", " ") || "view_only"}
                  </p>
                  {user?.assignedRegion?.name && (
                    <p className="text-[9px] text-gray-400 truncate leading-tight">
                      {user.assignedRegion.name}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-1 rounded-full">
                  <span className="text-white text-[10px] font-semibold leading-none w-6 h-6 flex items-center justify-center">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 p-2 flex-shrink-0">
            {!isCollapsed || isMobile ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-7 text-xs"
              >
                <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">Help & Support</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-7 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                title="Help & Support"
              >
                <HelpCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
