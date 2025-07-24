import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { AlertTriangle, MapPin, Clock, User as UserIcon, Shield } from "lucide-react";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/lib/utils";
import axios from "axios";
import { disasterTypes, severityConfig } from "@/lib/disaster-data";

import { useViewReport } from "@/hooks/use-user-reports";
import PhotoGridCard from "./PhotoGridCard";

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



export default function ReporterViewReportModalContent({ reportId }) {
  const { data: report, isLoading, error, refetch } = useViewReport(reportId);
  const { user } = useReporterAuth();
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();
  // Setup form for editing
  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: report ? {
      disaster_type: report.disaster_type || "",
      location_description: report.location_description || "",
      gps_coordinates: report.gps_coordinates || "",
      severity_level: report.severity_level || "",
      number_injured: report.number_injured || "",
      are_people_hurt: report.are_people_hurt || false,
      photo: [],
      full_name: report.full_name || "",
      phone_number: report.phone_number || "",
    } : {},
    values: report ? undefined : {},
  });
  const { handleSubmit, control, register, setValue, watch, formState: { errors } } = form;
  const onEditSubmit = async (data) => {
    try {
      await axios.patch(`${BASE_URL}/reports/${reportId}/`, data);
      toast({
        title: "Report Updated",
        description: "Your report has been updated.",
      });
      setEditOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update report.",
        variant: "destructive",
      });
    }
  };
  const statusConfig = {
    pending: {
      label: "Pending",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    },
    in_progress: {
      label: "In Progress",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
    },
    resolved: {
      label: "Resolved",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    fake: {
      label: "Fake",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }
  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
        <h3 className="text-base font-medium text-gray-900 mb-1">Report Not Found</h3>
        <p className="text-gray-600 mb-2 text-sm">Unable to load this report. Please check the link or try again.</p>
      </div>
    );
  }
  const status = report.status;
  const statusCfg = statusConfig[status] || {};
  const severity = report.severity_level;
  const severityCfg = severityConfig[severity] || {};
  const isReporter = user && report && user.id === report.reporter?.id;
  const canEdit = isReporter && report.status === "pending";
  return (
    <div className="space-y-4">
      {/* Details */}
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusCfg.bgColor || "bg-gray-100"} ${statusCfg.textColor || "text-gray-700"} ${statusCfg.borderColor || "border-gray-200"}`}>{statusCfg.label || status}</span>
        <span className="text-xs text-gray-500">ID: {report.id}</span>
      </div>
      {/* Disaster Type Row */}
      <div className="flex items-center space-x-2">
        {(() => {
          const type = disasterTypes.find((t) => t.value === report.disaster_type);
          return type ? (
            <>
              <span className="text-xl">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </>
          ) : (
            <span className="text-sm font-medium">{report.disaster_type}</span>
          );
        })()}
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{new Date(report.created_at).toLocaleString("en-GB")}</span>
      </div>
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{report.location_description}</span>
      </div>
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-gray-500" />
        <span className={`px-2 py-1 rounded text-xs font-semibold ${severityCfg.bgColor || "bg-gray-100"} ${severityCfg.textColor || "text-gray-700"}`}>{severityCfg.label || severity}</span>
      </div>
      {/* PhotoGridCard for images */}
      {Array.isArray(report.images) && report.images.length > 0 && (
        <PhotoGridCard images={report.images} title="Report Photo(s)" />
      )}
      {/* Custom view-only info */}
      {report.are_people_hurt && (
        <div className="mb-1 text-sm font-medium text-red-700">Are people hurt: <span className="font-bold">Yes</span></div>
      )}
      {report.description && (
        <div className="mb-1">
          <span className="font-semibold">Description:</span> {report.description}
        </div>
      )}
      <div>
        <h4 className="font-medium mb-1">Description</h4>
        <p className="text-gray-700 text-sm">{report.description || <span className="italic text-gray-400">No description provided.</span>}</p>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <UserIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm">Reported by: {report.reporter?.email || "Anonymous"}</span>
      </div>
      {report.reporter?.profile?.phone_number && (
        <div className="flex items-center space-x-2 mt-1">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Phone: {report.reporter.profile.phone_number}</span>
        </div>
      )}
     
    </div>
  );
} 