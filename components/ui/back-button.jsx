"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({ 
  variant = "outline", 
  size = "sm", 
  className = "", 
  children = "Back",
  onClick,
  showText = true,
  ...props 
}) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${className}`}
      title={typeof children === 'string' ? children : 'Go back'}
      {...props}
    >
      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
      {showText && (
        <span className="hidden sm:inline">{children}</span>
      )}
    </Button>
  );
} 