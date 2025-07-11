"use client"

import { UnderConstruction } from "@/components/ui/under-construction"

export default function Error({
  error,
  reset,
}) {
  return (
    <UnderConstruction 
      title="Something Went Wrong"
      description="An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
      showBackButton={true}
      showHomeButton={true}
    />
  )
} 