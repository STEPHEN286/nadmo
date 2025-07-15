"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Camera, MapPin, Upload, Phone } from "lucide-react"
// import Link from "next/link"
import { BackButton } from "@/components/ui/back-button"
import useReportIssue from "@/hooks/use-report-issue";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const disasterTypes = [
  { value: "flood", label: "Flood", icon: "🌊", description: "Water overflow, heavy rainfall" },
  { value: "fire", label: "Fire", icon: "🔥", description: "Building fire, bush fire, explosion" },
  { value: "accident", label: "Accident", icon: "🚗", description: "Road accident, collision" },
  { value: "landslide", label: "Landslide", icon: "⛰️", description: "Soil erosion, slope failure" },
  { value: "storm", label: "Storm", icon: "⛈️", description: "Heavy winds, thunderstorm" },
  { value: "earthquake", label: "Earthquake", icon: "🌍", description: "Ground shaking, tremors" },
  { value: "other", label: "Other", icon: "⚠️", description: "Other emergency situations" },
]

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

export default function ReportDisasterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useReporterAuth();
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      disaster_type: "",
      location_description: "",
      gps_coordinates: "",
      severity_level: "",
      number_injured: "",
      are_people_hurt: false,
      photo: [],
      full_name: "",
      phone_number: ""
    },
  });
  const { handleSubmit, control, register, setValue, watch, formState: { errors } } = form;
  const watchedImages = watch("photo");

  // Add useReportIssue with onSuccess redirect
  const { mutate: reportIssue, isLoading } = useReportIssue();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("gps_coordinates", `${latitude.toFixed(6)},${longitude.toFixed(6)}`);
          toast({
            title: "Location detected",
            description: "Your current location has been added to the report.",
          });
        },
        (error) => {
          console.log(error)
          toast({
            title: "Location error",
            description: "Unable to detect your location. Please enter manually.",
            variant: "destructive",
          });
        },
      );
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      // console.log('Stream obtained:', stream);
      setCameraStream(stream);
      setShowCamera(true);
      
      // Wait for the video element to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('Video element set');
          
          // Set ready immediately
          setCameraReady(true);
          console.log('Camera ready state set to true');
          console.log('Camera should be ready now!');
        } else {
          console.error('Video ref is still null after delay');
        }
      }, 100); // Small delay to ensure video element is rendered
      
    } catch (error) {
      console.error('Camera access error:', error);
      console.error('Error details:', error.message);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraReady) {
      try {
        console.log('Capturing photo...');
        
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        
        // Use actual video dimensions or fallback to reasonable size
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const currentPhotos = watchedImages || [];
            const newPhotos = [...currentPhotos, file];
            setValue("photo", newPhotos);
            
            console.log('Photo captured successfully:', file);
            console.log('File size:', file.size);
            
            stopCamera();
            toast({
              title: "Photo captured",
              description: "Photo has been added to your report.",
            });
          } else {
            console.error('Failed to create blob');
            toast({
              title: "Photo capture failed",
              description: "Failed to capture photo. Please try again.",
              variant: "destructive",
            });
          }
        }, 'image/jpeg', 0.8);
        
      } catch (error) {
        console.error('Error capturing photo:', error);
        toast({
          title: "Photo capture failed",
          description: "An error occurred while capturing the photo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files before adding
    const validFiles = files.filter(file => {
      if (file.size === 0) {
        console.error('Skipping empty file:', file.name);
        toast({
          title: "Invalid file",
          description: `${file.name} is empty and cannot be uploaded.`,
          variant: "destructive",
        });
        return false;
      }
      if (!file.type.startsWith('image/')) {
        console.error('Skipping non-image file:', file.name, file.type);
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setValue("photo", [...(watchedImages || []), ...validFiles]);
      console.log('Added valid files:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    }
  };

  const removeImage = (index) => {
    setValue(
      "photo",
      (watchedImages || []).filter((_, i) => i !== index)
    );
  };

  // Clean up empty files from the state
  const cleanupEmptyFiles = () => {
    const currentPhotos = watchedImages || [];
    const validPhotos = currentPhotos.filter(file => file && file.size > 0);
    
    if (validPhotos.length !== currentPhotos.length) {
      console.log('Cleaning up empty files:', currentPhotos.length - validPhotos.length, 'removed');
      setValue("photo", validPhotos);
    }
  };

  // Run cleanup when component mounts and when watchedImages changes
  useEffect(() => {
    cleanupEmptyFiles();
  }, [watchedImages]);

  const onSubmit = (data) => {
    console.log("Form data:", data);
    const payload = {
      disaster_type: data.disaster_type,
      location_description: data.location_description,
      gps_coordinates: data.gps_coordinates,
      severity_level: data.severity_level,
      are_people_hurt: data.number_injured > 0,
      status: "pending",
      reporter: user? user?.id : null,
      photo: data.photo,
      full_name: data.full_name ? data.full_name : null,
      phone_number: data.phone_number
      // photo: data.photo,
    };

    reportIssue(payload);
    
    // console.log("Submitting payload:", payload);
   
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <BackButton variant="ghost" size="sm" onClick={() => router.push("/emergency")}>
              Back to Home
            </BackButton>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Report Emergency</h1>
                <p className="text-sm text-gray-600">Ghana Disaster Alert System</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <Phone className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">For Life-Threatening Emergencies:</p>
                <p>
                  Call immediately: <strong>Police (191)</strong> • <strong>Fire (192)</strong> •{" "}
                  <strong>Ambulance (193)</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Emergency Report Form
            </CardTitle>
            <CardDescription>Provide detailed information to help emergency responders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Emergency Type */}
                <FormField
                  control={control}
                  name="disaster_type"
                  rules={{ required: "Emergency type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What type of emergency are you reporting? *</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {disasterTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => field.onChange(type.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-red-300 ${
                              field.value === type.value ? "border-red-500 bg-red-50" : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{type.icon}</span>
                              <div>
                                <h3 className="font-medium text-gray-900">{type.label}</h3>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={control}
                  name="location_description"
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g., Accra Central, near Makola Market"
                          rows={4}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* GPS Coordinates */}
                <FormField
                  control={control}
                  name="gps_coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPS Coordinates (Optional)</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Auto-detect or enter manually"
                          />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={getCurrentLocation}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Severity and Casualties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="severity_level"
                    rules={{ required: "Severity level is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How serious is it? *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minor">Minor - Small issue, no immediate danger</SelectItem>
                              <SelectItem value="moderate">Moderate - Some risk, needs attention</SelectItem>
                              <SelectItem value="serious">Serious - Significant danger or damage</SelectItem>
                              <SelectItem value="critical">Critical - Life-threatening, major emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="are_people_hurt"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-2 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (!checked) setValue("number_injured", "");
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium">
                            Are people hurt or injured?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload */}
                <FormField
                  control={control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photos (Helpful but Optional)</FormLabel>
                      
                      {/* Camera Interface */}
                      {showCamera && (
                        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                          <div className="relative w-full h-full max-w-2xl max-h-2xl">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Camera Status Indicator */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                              <div className="flex items-center space-x-2">
                                {!cameraReady ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Starting camera...</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    <span>Camera Ready!</span>
                                  </>
                                )}
                              </div>
                              <div className="text-xs mt-1">
                                Debug: cameraReady = {cameraReady.toString()}
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                              <Button
                                onClick={capturePhoto}
                                disabled={!cameraReady}
                                className={`px-6 py-3 rounded-full ${
                                  cameraReady 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                              >
                                <Camera className="h-5 w-5 mr-2" />
                                {cameraReady ? 'Capture Photo' : 'Initializing...'}
                              </Button>
                              
                              {!cameraReady && (
                                <Button
                                  onClick={() => {
                                    console.log('Force ready clicked');
                                    setCameraReady(true);
                                    toast({
                                      title: "Camera Ready (Manual)",
                                      description: "Camera manually enabled for capture.",
                                    });
                                  }}
                                  variant="outline"
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full"
                                >
                                  Force Ready
                                </Button>
                              )}
                              
                              <Button
                                onClick={stopCamera}
                                variant="outline"
                                className="bg-white text-gray-900 px-6 py-3 rounded-full"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload Interface */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center mb-4">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-4">
                            Take photos to help emergency responders understand the situation
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={startCamera}
                            className="flex items-center justify-center"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Open Camera
                          </Button>
                          
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photos
                          </Button>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Image Preview */}
                      {watchedImages && watchedImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Uploaded Photos ({watchedImages.length})
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {watchedImages.map((file, index) => {
                              console.log('Rendering file:', file, 'at index:', index, 'size:', file.size);
                              
                              // Skip rendering if file is empty
                              if (!file || file.size === 0) {
                                console.error('Skipping empty file at index:', index);
                                return null;
                              }
                              
                              return (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border"
                                    onError={(e) => {
                                      console.error('Image failed to load:', file);
                                      // Use a data URL placeholder instead of a file
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC4wMDAxIDgxIDEwMCA4MUMxMTEuMDQ2IDgxIDExOSA4OS41NDQ3IDExOSAxMDBDMTE5IDExMC40NTUgMTExLjA0NiAxMTkgMTAwIDExOUM4OC4wMDAxIDExOSA4MCAxMTAuNDU1IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHAgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5QaG90byBFcnJvcjwvcD4KPC9zdmc+';
                                    }}
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                  >
                                    ×
                                  </Button>
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    Photo {index + 1}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />


{/* Full Name */}
{!user && <div className="grid grid-cols-2 gap-3">
  <FormField
                    control={control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your full name"  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Phone Number */}
                  <FormField
                    control={control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your phone number"  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
</div>}
                {/* Report Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Report Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Type:</span>
                      <span className="font-medium">{disasterTypes.find((t) => t.value === form.watch("disaster_type"))?.label || "Not selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{form.watch("location_description") || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span className="font-medium capitalize">{form.watch("severity_level") || "Not selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Photos:</span>
                      <span className="font-medium">{(watchedImages?.length || 0)} uploaded</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">What happens next:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your report will be sent immediately to NADMO emergency services</li>
                        <li>You'll receive a tracking ID to check the status of your report</li>
                        <li>Emergency responders will be dispatched based on the severity</li>
                        <li>If you provided contact details, we may call for additional information</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading }
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Report...
                      </>
                    ) : (
                      "Submit Emergency Report"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
