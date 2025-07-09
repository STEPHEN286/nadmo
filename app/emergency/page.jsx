"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Phone,
  Search,
  MapPin,
  Clock,
  Flame,
  Waves,
  Car,
  Mountain,
  Zap,
  Globe,
  Heart,
  AlertCircle,
  CheckCircle,
  Users,
  LogIn,
  User
} from "lucide-react"
import Link from "next/link"
import SwiperCarousel from "@/components/ui/swiper-carousel"
import { useRouter } from "next/navigation"
import { EmergencyLayout } from "@/components/layout/emergency-layout"

export default function EmergencyPage() {
  const router = useRouter()

  // Image slides for the hero section
  const heroSlides = [
    {
      image: "https://res.cloudinary.com/disgj6wx5/image/upload/v1750726020/k9vw3u3tcgxmbuhhsmw4.png",
    },
    {
      image: "https://res.cloudinary.com/disgj6wx5/image/upload/v1750726020/o63sifns6lqsgzkokh0c.png",
    },
    {
      image: "https://res.cloudinary.com/disgj6wx5/image/upload/v1750726019/ccztyxh1kywm8vploona.jpg", 
    },
    {
      image: "https://res.cloudinary.com/disgj6wx5/image/upload/v1750726019/ccztyxh1kywm8vploona.jpg",
    },
    {
      image: "https://res.cloudinary.com/disgj6wx5/image/upload/v1750726019/th5dtf19fj8nqxzakesb.jpg",
    }
  ]

  return (
    <EmergencyLayout>
      {/* Hero Section */}
      <div className="h-[300px]  sm:h-[400px] md:h-[500px] lg:h-[600px] relative">
        <div className="absolute inset-0 bg-red-600/30 z-10"></div>
        <SwiperCarousel
          slides={heroSlides}
          variant="hero"
          autoplay={true}
          autoplayDelay={5000}
          effect="fade"
          className="absolute inset-0 "
      
        />
        
        {/* Dark overlay for text readability */}
      

        <div className="relative z-20     mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-center text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 leading-tight">Emergency Response</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
            Report disasters and emergencies directly to Ghana's National Disaster Management Organisation (NADMO)
          </p>

          {/* Emergency Hotlines */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-4 opacity-90">EMERGENCY HOTLINES</p>
            <div className="flex flex-row gap-2 justify-center max-w-xs sm:max-w-md mx-auto">
              <div className="bg-red-600 rounded-lg p-2 sm:p-3 lg:p-4 text-center flex-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">191</div>
                <div className="text-[10px] sm:text-xs lg:text-sm opacity-90">Police</div>
              </div>
              <div className="bg-red-600 rounded-lg p-2 sm:p-3 lg:p-4 text-center flex-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">192</div>
                <div className="text-[10px] sm:text-xs lg:text-sm opacity-90">Fire Service</div>
              </div>
              <div className="bg-red-600 rounded-lg p-2 sm:p-3 lg:p-4 text-center flex-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">193</div>
                <div className="text-[10px] sm:text-xs lg:text-sm opacity-90">Ambulance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20  p-4 sm:p-6 mt-8 sm:-mt-20 lg:-mt-32 sm:relative sm:z-10">
          <Link href="emergency/report-disaster">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="bg-red-600 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Report Emergency</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Submit a detailed emergency report with photos, location, and description. Our response teams will be
                  notified immediately for rapid deployment.
                </p>
                <Button className="bg-black text-white hover:bg-gray-800 w-full py-2 sm:py-3 text-sm sm:text-base">Start Emergency Report</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/emergency/track-report">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="bg-gray-900 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Track Your Report</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Monitor the status of your emergency report in real-time. Get updates on response progress and
                  estimated resolution times.
                </p>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full py-2 sm:py-3 text-sm sm:text-base">
                  Track Report Status
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* How Emergency Reporting Works */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">How Emergency Reporting Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process ensures rapid response to emergency situations across Ghana
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: Shield,
                title: "Report Emergency",
                description: "Submit detailed emergency information with photos, location, and severity assessment",
              },
              {
                icon: Zap,
                title: "Instant Alert",
                description: "NADMO receives immediate notification and begins emergency response coordination",
              },
              {
                icon: Users,
                title: "Team Dispatch",
                description: "Trained emergency response teams are deployed to the incident location",
              },
              {
                icon: CheckCircle,
                title: "Resolution",
                description: "Emergency is handled professionally with status updates provided throughout",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-100 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <item.icon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Categories */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Emergency Categories</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Report any of these emergency situations for immediate NADMO response
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Waves,
                label: "Floods & Water",
                desc: "Flooding, dam overflows, water emergencies",
              },
              {
                icon: Flame,
                label: "Fires & Explosions",
                desc: "Building fires, bush fires, gas explosions",
              },
              {
                icon: Car,
                label: "Traffic Accidents",
                desc: "Vehicle collisions, road blockages",
              },
              {
                icon: Mountain,
                label: "Landslides",
                desc: "Soil erosion, slope failure, rockfall",
              },
              {
                icon: Zap,
                label: "Severe Weather",
                desc: "Storms, high winds, lightning strikes",
              },
              {
                icon: Globe,
                label: "Earthquakes",
                desc: "Ground shaking, structural damage",
              },
              {
                icon: Heart,
                label: "Medical Emergency",
                desc: "Mass casualties, disease outbreaks",
              },
              {
                icon: AlertCircle,
                label: "Other Emergencies",
                desc: "Any life-threatening situation",
              },
            ].map((type, index) => (
              <Card key={index} className="text-center p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="bg-gray-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <type.icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900">{type.label}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{type.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 24/7 Emergency Support */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">24/7 Emergency Support</h2>
            <p className="text-lg sm:text-xl text-gray-600">Professional emergency response teams standing by around the clock</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-red-600 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2 text-gray-900">NADMO Emergency Line</h3>
              <p className="text-3xl font-bold text-red-600 mb-2">0800-111-222</p>
              <p className="text-gray-600">Toll-free nationwide</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-900 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">National Headquarters</h3>
              <p className="text-gray-700 font-medium mb-1">NADMO Head Office</p>
              <p className="text-gray-600">Accra, Greater Accra Region</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-700 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">Response Time</h3>
              <p className="text-gray-700 font-medium mb-1">Average: 15-30 minutes</p>
              <p className="text-gray-600">24/7 Emergency Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </EmergencyLayout>
  )
}
