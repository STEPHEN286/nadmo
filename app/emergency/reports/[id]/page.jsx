"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Camera, MapPin, Upload, Phone } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { disasterTypes } from "@/lib/disaster-data";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import ReportForm from "@/components/ReportForm";
import useReportIssue, { useUpdateReport } from "@/hooks/use-report-issue";
import { useViewReport } from "@/hooks/use-user-reports";

const reportSchema = z.object({
  disaster_type: z.string().min(1, "Emergency type is required"),
  location_description: z.string().min(1, "Location is required"),
  gps_coordinates: z.string().optional(),
  severity_level: z.string().min(1, "Severity level is required"),
  are_people_hurt: z.boolean(),
  photo: z.array(z.any()).optional(),
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
});

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, mounted } = useReporterAuth();
  const updateReport = useUpdateReport();
  const { data: report, isLoading: loading, error } = useViewReport(params.id);

  // Permission check
  const canEdit = user && report && user.id === report.reporter?.id && report.status === "pending";

  // Location function for ReportForm
  const getCurrentLocation = (setValue) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("gps_coordinates", `${latitude.toFixed(6)},${longitude.toFixed(6)}`);
          toast({ title: "Location detected", description: "Your current location has been added to the report." });
        },
        (error) => {
          toast({ title: "Location error", description: "Unable to detect your location. Please enter manually.", variant: "destructive" });
        },
      );
    }
  };

  // Handler for form submit
  const handleSubmit = (data) => {
    updateReport.mutate({ id: params.id, data });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Could not load report or you do not have permission.</h3>
          <Button onClick={() => router.push("/emergency/profile")}>Go Back</Button>
        </div>
      </div>
    );
  }
  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">You do not have permission to edit this report.</h3>
          <Button onClick={() => router.push("/emergency/profile")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <BackButton variant="ghost" size="sm" onClick={() => router.push("/emergency")}>Back to Home</BackButton>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Emergency Report</h1>
                <p className="text-sm text-gray-600">Update your emergency report details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Edit Emergency Report
            </CardTitle>
            <CardDescription>Update your report details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {report && (
              <>
                {/* View-only info section */}
                <div className="mb-6">
                  {Array.isArray(report.photo) && report.photo.length > 0 && (
                    <div className="mb-2">
                      <div className="font-semibold mb-1">Photo(s):</div>
                      <div className="flex flex-wrap gap-2">
                        {report.photo.map((img, idx) => (
                          <img
                            key={idx}
                            src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                            alt={`Report photo ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {report.are_people_hurt && (
                    <div className="mb-1 text-sm font-medium text-red-700">Are people hurt: <span className="font-bold">Yes</span></div>
                  )}
                  {report.description && (
                    <div className="mb-1">
                      <span className="font-semibold">Description:</span> {report.description}
                    </div>
                  )}
                </div>
                <ReportForm
                  initialValues={report}
                  onSubmit={handleSubmit}
                  loading={loading}
                  getCurrentLocation={getCurrentLocation}
                  mode="edit"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 