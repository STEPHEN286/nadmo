"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NadmoSidebar } from "./nadmo-sidebar"
import { Header } from "./header"
import { useAuth } from "@/hooks/use-auth"

export function NadmoLayout({ children }) {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [user, mounted, router]);

  // Only render on client
  if (typeof window === "undefined" || !isClient || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
