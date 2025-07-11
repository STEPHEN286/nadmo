import { UnderConstruction } from "@/components/ui/under-construction"

export default function Loading() {
  return (
    <UnderConstruction 
      title="Loading..."
      description="Please wait while we load the page content."
      showBackButton={false}
      showHomeButton={true}
    />
  )
} 