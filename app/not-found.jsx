import { UnderConstruction } from "@/components/ui/under-construction"

export default function NotFound() {
  return (
    <UnderConstruction 
      title="Page Not Found (404)"
      description="The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the dashboard."
      showBackButton={true}
      showHomeButton={true}
      customGif="/404.gif"
    />
  )
} 