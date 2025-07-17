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
import ReportForm from "@/components/ReportForm";




export default function ReportDisasterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useReporterAuth();
  const { mutate: reportIssue, isPending } = useReportIssue();

  // Handler for form submit
  const handleSubmit = (data) => {
console.log("data", data)
    const payload = {
      ...data,
      status: "pending",
      reporter: user ? user.id : null,
    };
    reportIssue(payload);
  };

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
                  Call immediately: <strong>Police (191)</strong> • <strong>Fire (192)</strong> • <strong>Ambulance (193)</strong>
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
            <ReportForm
              initialValues={{}}
              onSubmit={handleSubmit}
              isPending={isPending}
              mode="add"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
