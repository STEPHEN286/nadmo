"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useReporterAuth } from "@/hooks/use-reporter-auth"
import { 
  User, 
  Settings, 
  FileText, 
  Calendar, 

  Phone, 
  Mail, 
  Edit, 
  Save, 
  X,
 
  CheckCircle,

  Eye
} from "lucide-react"
import { BackButton } from "@/components/ui/back-button"
import useUserReports from "@/hooks/use-user-reports";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, MapPin, Clock, User as UserIcon, Shield } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { disasterTypes } from "@/lib/disaster-data";
import axios from "axios";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import Link from "next/link";
import ReporterViewReportModalContent from "@/components/ReporterViewReportModalContent";
import { useProfile } from "@/hooks/use-user-profile"
import ReporterSettings from "@/components/layout/reporter-settings";
import PhotoGridCard from "@/components/PhotoGridCard";

// Move this hook to the top-level so it is accessible everywhere in the file
function useReporterViewReport(id) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || BASE_URL}/reports/public/${id}/`);
      if (!response.ok) throw new Error("Failed to fetch report");
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Add reportSchema for editing
const reportSchema = z.object({
  disaster_type: z.string().min(1, "Emergency type is required"),
  location_description: z.string().min(1, "Location is required"),
  gps_coordinates: z.string().optional(),
  severity_level: z.string().min(1, "Severity level is required"),
  number_injured: z.string().optional(),
  are_people_hurt: z.boolean(),
  photo: z.array(z.any()).optional(),
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
});

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout, mounted } = useReporterAuth()
  const { profile, isProfileLoading, profileError, refetchProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    phone_number: "",
    region: "",
    district: "",
  })
  const [viewReportId, setViewReportId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use the hook to fetch user reports
  const { data: reports = [], isLoading: reportsLoading, error: reportsError, refetch } = useUserReports(user?.id)

  // console.log("ProfilePage: Component rendered, user:", user, "mounted:", mounted)

  // Redirect if not authenticated (only after auth hook has mounted)
  useEffect(() => {
   
    if (mounted && !user) {
      // console.log("ProfilePage: No user found after mount, redirecting to login")
      router.push("/emergency/")
    } else if (mounted && user) {
      console.log("ProfilePage: User found, staying on profile page")
    }
  }, [user, mounted, router])

  // Set edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        phone_number: user.profile?.phone_number || "",
        region: user.profile?.region || "",
        district: user.profile?.district || "",
      })
    }
  }, [user])

  // Show error toast if reports fail to load
  useEffect(() => {
    if (reportsError) {
      toast({
        title: "Error Loading Reports",
        description: "Failed to load your reports. Please try again.",
        variant: "destructive",
      })
    }
  }, [reportsError, toast])

  // Refetch reports on global report update event
  useEffect(() => {
    const handleReportUpdated = () => {
      refetch();
    };
    window.addEventListener('report:updated', handleReportUpdated);
    return () => {
      window.removeEventListener('report:updated', handleReportUpdated);
    };
  }, [refetch]);



  

  

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-800", icon: Eye },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: X },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const getDisasterIcon = (type) => {
    const icons = {
      flood: "🌊",
      fire: "🔥",
      accident: "🚗",
      landslide: "⛰️",
      storm: "⛈️",
      earthquake: "🌍",
      other: "⚠️",
    }
    return icons[type] || "⚠️"
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-4 text-gray-600">Redirecting to login...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <BackButton variant="ghost" size="sm" onClick={() => router.push("/emergency")}>
              Back to Home
            </BackButton>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and view reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profile_image} />
                    <AvatarFallback className="bg-red-100 text-red-600 text-xl">
                      {profile?.full_name?.charAt(0).toUpperCase() || "R"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{profile?.full_name || ""}</CardTitle>
                    <CardDescription>Emergency Reporter</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{profile?.phone_number || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {profile?.district && profile?.region 
                        ? `${profile.district.name}, ${profile.region.name}`
                        : "Location not set"
                      }
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Reports:</span>
                    <span className="font-medium">{reports.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">
                      {new Date(user.date_joined || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                 
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logout}
                    className="text-red-600 hover:text-red-700"
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="reports" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>My Reports</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Report History</span>
                    </CardTitle>
                    <CardDescription>
                      View all emergency reports you've submitted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reportsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                        <p className="text-gray-600 mb-4">
                          You haven't  submitted any  emergency reports yet.
                        </p>
                        <Button onClick={() => router.push("/emergency/report-disaster")}>
                          Submit Your First Report
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reports.map((report) => {
                          const isReporter = user && report && user.id === report.reporter?.id;
                          const canEdit = isReporter && report.status === "pending";
                          // Normalize report.photo to array of objects with 'image' property for PhotoGridCard
                          let images = [];
                          if (Array.isArray(report.photo)) {
                            images = report.photo.map((img) => typeof img === 'string' ? { image: img } : img);
                          } else if (report.photo) {
                            images = [{ image: report.photo }];
                          }
                          return (
                            <Card key={report.id} className="border-l-4 border-l-red-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3">
                                    <div className="text-2xl">
                                      {getDisasterIcon(report.disaster_type)}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <h3 className="font-medium text-gray-900">
                                          {report.disaster_type.charAt(0).toUpperCase() + report.disaster_type.slice(1)}
                                        </h3>
                                        {getStatusBadge(report.status)}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {report.location_description}
                                      </p>
                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>
                                            {new Date(report.created_at).toLocaleDateString()}
                                          </span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {new Date(report.created_at).toLocaleTimeString()}
                                          </span>
                                        </span>
                                      </div>
                                      {/* Add PhotoGridCard for report images */}
                                      {images.length > 0 && (
                                        <div className="mt-2">
                                          <PhotoGridCard images={images} title="Report Photo(s)" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (user.role?.toLowerCase() === "reporter") {
                                          setViewReportId(report.id);
                                          setModalOpen(true);
                                        } else {
                                          router.push(`/reports/${report.id}`);
                                        }
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                    {canEdit && (
                                      <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Link href={`/emergency/reports/${report.id}`}>
                                          <Edit className="h-4 w-4 mr-1" />
                                          Edit
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <ReporterSettings />
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-600">Delete Account</h4>
                        <p className="text-sm text-gray-600">Permanently delete your account</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Modal for reporter view report */}
      {user.role?.toLowerCase() === "reporter" && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>View your emergency report</DialogDescription>
            </DialogHeader>
            {viewReportId && (
              <ReporterViewReportModalContent reportId={viewReportId} />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 