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
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Save, 
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react"
import { BackButton } from "@/components/ui/back-button"
import useUserReports from "@/hooks/use-user-reports";

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout, mounted } = useReporterAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    phone_number: "",
    region: "",
    district: "",
  })

  // Use the hook to fetch user reports
  const { data: reports = [], isLoading: reportsLoading, error: reportsError } = useUserReports(user?.id)

  console.log("ProfilePage: Component rendered, user:", user, "mounted:", mounted)

  // Redirect if not authenticated (only after auth hook has mounted)
  useEffect(() => {
    console.log("ProfilePage: useEffect triggered, user:", user, "mounted:", mounted)
    if (mounted && !user) {
      console.log("ProfilePage: No user found after mount, redirecting to login")
      router.push("/emergency/auth/login")
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

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    try {
      // TODO: Replace with actual API call
      // await axios.put(`${BASE_URL}/profile/update`, editForm)
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      phone_number: user.profile?.phone_number || "",
      region: user.profile?.region || "",
      district: user.profile?.district || "",
    })
    setIsEditing(false)
  }

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
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.email}</CardTitle>
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
                    <span className="text-gray-600">{user.profile?.phone_number || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {user.profile?.district && user.profile?.region 
                        ? `${user.profile.district}, ${user.profile.region}`
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
                    onClick={handleEditProfile}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
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
                        {reports.map((report) => (
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
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/emergency/track-report?id=${report.id}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Profile Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Update your contact information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Phone Number</Label>
                          <Input
                            id="phone_number"
                            value={editForm.phone_number}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Region</Label>
                          <Input
                            id="region"
                            value={editForm.region}
                            onChange={(e) => setEditForm(prev => ({ ...prev, region: e.target.value }))}
                            placeholder="Enter your region"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">District</Label>
                          <Input
                            id="district"
                            value={editForm.district}
                            onChange={(e) => setEditForm(prev => ({ ...prev, district: e.target.value }))}
                            placeholder="Enter your district"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleSaveProfile} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <p className="text-sm text-gray-600">{user.profile?.phone_number || "Not provided"}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Region</Label>
                          <p className="text-sm text-gray-600">{user.profile?.region || "Not provided"}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>District</Label>
                          <p className="text-sm text-gray-600">{user.profile?.district || "Not provided"}</p>
                        </div>
                        <Button onClick={handleEditProfile}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about your reports</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
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
    </div>
  )
} 