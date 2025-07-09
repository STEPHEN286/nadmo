"use client"

import { useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import { cn } from "@/lib/utils"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const SwiperCarousel = ({
  slides = [],
  className = "",

  autoplay = true,
  autoplayDelay = 5000,
  variant = "default", // "default", "emergency", "info", "news"
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "emergency":
        return {
          container: "bg-red-50 border border-red-200 rounded-lg",
          slide: "bg-white border border-red-200 shadow-sm rounded-lg",
        }
      case "info":
        return {
          container: "bg-blue-50 border border-blue-200 rounded-lg", 
          slide: "bg-white border border-blue-200 shadow-sm rounded-lg",
        }
      case "news":
        return {
          container: "bg-gray-50 border border-gray-200 rounded-lg",
          slide: "bg-white border border-gray-200 shadow-sm rounded-lg",
        }
      default:
        return {
          container: "bg-white border border-gray-200 rounded-lg",
          slide: "bg-gray-50 border border-gray-200 shadow-sm rounded-lg",
        }
    }
  }

  const styles = getVariantStyles()

  if (!slides || slides.length === 0) {
    return (
      <div className={cn("p-4 text-center text-gray-500", styles.container, className)}>
        No images to display
      </div>
    )
  }

  return (
    <div className={cn("relative", styles.container, className)}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        loop={slides.length > 1}
        autoplay={autoplay ? { delay: autoplayDelay, disableOnInteraction: false } : false}
        // navigation={showNavigation && slides.length > 1}
        // pagination={showPagination && slides.length > 1 ? { clickable: true } : false}
        className="w-full h-full"
      
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={cn(" ", styles.slide)}>
              <img 
                src={slide.image} 
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover "
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default SwiperCarousel
