"use client"

// import { Header } from "@/components/layout/header"
import { NadmoSidebar } from "./nadmo-sidebar"
import { Header } from "./header"

export function NadmoLayout({ children }) {
  // if (!user) {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <NadmoSidebar />
      {/* Main content area with responsive left margin */}
      <div className="lg:ml-64 transition-all duration-300">
        <Header />
        <main className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-[calc(100vh-60px)]">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
