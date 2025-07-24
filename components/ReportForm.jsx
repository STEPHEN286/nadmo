import React, { useState, useRef, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Camera, MapPin, Upload } from "lucide-react";
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
import { disasterTypes } from "@/lib/disaster-data";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { useToast } from "@/hooks/use-toast";
import { reportSchema } from "@/lib/utils";

const safeString = (val) => (typeof val === "string" ? val : "");
const safeBool = (val) => (typeof val === "boolean" ? val : false);
const safeArray = (val) => (Array.isArray(val) ? val : []);

const SEVERITY_OPTIONS = [
  { value: "minor", label: "Minor - Small issue, no immediate danger" },
  { value: "moderate", label: "Moderate - Some risk, needs attention" },
  { value: "serious", label: "Serious - Significant danger or damage" },
  { value: "critical", label: "Critical - Life-threatening, major emergency" },
];

export default function ReportForm({
  initialValues = {},
  onSubmit,
  mode = "add",
  isPending = false
}) {
  const { user } = useReporterAuth();
  const { toast } = useToast();
  // Camera/photo state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Setup form
  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      disaster_type: safeString(initialValues.disaster_type),
      location_description: safeString(initialValues.location_description),
      gps_coordinates: safeString(initialValues.gps_coordinates),
      severity_level: safeString(initialValues.severity_level) || "minor",
    //   number_injured: safeString(initialValues.number_injured),
    description: safeString(initialValues.description),
      are_people_hurt: safeBool(initialValues.are_people_hurt),
      uploaded_images: safeArray(initialValues.uploaded_images),
      full_name: safeString(initialValues.full_name),
      phone_number: safeString(initialValues.phone_number),
    },
  });
  const { handleSubmit, control, setValue, watch, formState: { errors } } = form;
  const watchedImages = watch("uploaded_images");
  const watchedDisasterType = watch("disaster_type");

  // Update form values when initialValues change (for edit mode)

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      }, 100);
    } catch (error) {
      alert("Camera access error: " + error.message);
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
  // const capturePhoto = () => {
  //   if (videoRef.current && cameraReady) {
  //     const canvas = document.createElement('canvas');
  //     const video = videoRef.current;
  //     canvas.width = video.videoWidth || 640;
  //     canvas.height = video.videoHeight || 480;
  //     const ctx = canvas.getContext('2d');
  //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //     canvas.toBlob((blob) => {
  //       if (blob && blob.size > 0) {
  //         const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
  //         const currentPhotos = watchedImages || [];
  //         setValue("images", [...currentPhotos, file]);
  //         stopCamera();
  //       } else {
  //         alert("Photo capture failed");
  //       }
  //     }, 'image/jpeg', 0.8);
  //   }
  // };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size > 0 && file.type.startsWith('image/'));
    if (validFiles.length > 0) {
      setValue("uploaded_images", [...(watchedImages || []), ...validFiles]);
    }
  };
  const removeImage = (index) => {
    setValue("uploaded_images", (watchedImages || []).filter((_, i) => i !== index));
  };
  // Clean up empty files from the state
  const cleanupEmptyFiles = () => {
    const currentPhotos = watchedImages || [];
    const validPhotos = currentPhotos.filter(file => file && file.size > 0);
    if (validPhotos.length !== currentPhotos.length) {
      setValue("uploaded_images", validPhotos);
    }
  };
  useEffect(() => { cleanupEmptyFiles(); }, [watchedImages]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Emergency Type */}
        <FormField
          control={control}
          name="disaster_type"
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
        {watchedDisasterType === "other" && (
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Please describe the emergency."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* Location */}
        <FormField
          control={control}
          name="location_description"
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
                <Button type="button" variant="outline" onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                          const data = await res.json();
                          setValue("location_description", data.display_name || `${latitude},${longitude}`);
                          setValue("gps_coordinates", `${latitude.toFixed(6)},${longitude.toFixed(6)}`);
                          if (toast) {
                            toast({
                              title: "Location detected",
                              description: data.display_name,
                            });
                          }
                        } catch {
                          setValue("location_description", `${latitude},${longitude}`);
                          setValue("gps_coordinates", `${latitude.toFixed(6)},${longitude.toFixed(6)}`);
                          if (toast) {
                            toast({
                              title: "Location detected",
                              description: `${latitude},${longitude}`,
                            });
                          }
                        }
                      },
                      (error) => {
                        if (toast) {
                          toast({
                            title: "Location error",
                            description: "Unable to detect your location. Please enter manually.",
                            variant: "destructive",
                          });
                        }
                      },
                    );
                  }
                }}>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>How serious is it? *</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
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
                      onCheckedChange={field.onChange}
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
     
        {/* Full Name and Phone Number fields - only show if not logged in */}
        {!user && (
          <>
            <FormField
              control={control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
        {/* Photo Upload */}
        <FormField
          control={control}
          name="uploaded_images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos (Helpful but Optional)</FormLabel>
              <div className="flex flex-wrap gap-4 items-center">
                {Array.isArray(watchedImages) && watchedImages.length > 0 && watchedImages.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={file instanceof File ? URL.createObjectURL(file) : file}
                      alt={`Report photo ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-600 group-hover:bg-opacity-100"
                      onClick={() => removeImage(idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 w-24 border-dashed border-2"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 w-24 border-dashed border-2"
                  onClick={startCamera}
                >
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-xs">Camera</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </FormItem>
          )}
        />
        {/* Camera Modal */}
        {/* {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-2xl max-h-2xl flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover rounded-lg border mb-4"
              />
              <div className="flex space-x-4">
                <Button onClick={capturePhoto} disabled={!cameraReady} className="bg-red-600 hover:bg-red-700 text-white">
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )} */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={mode === "edit" ? () => window.history.back() : undefined}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isPending}>
            {mode === "edit" ? isPending ? "Updating..." : "Update Report" : isPending ? "Submiting..." : "submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 