import { clsx } from "clsx"
import { da } from "date-fns/locale";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


// ZOD SCHEMA
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  full_name: z.string().min(3,"Please enter  your fullname"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  phone_number: z.string().min(10, "Please enter a valid phone number"),
  region: z.string().min(1, "Please select a region"),
  district: z.string().min(1, "Please select a district"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
;



export const reportSchema = z.object({
  disaster_type: z.string().min(1, "Emergency type is required"),
  location_description: z.string().min(1, "Location is required"),
  gps_coordinates: z.string().optional(),
  severity_level: z.string().min(1, "Severity level is required"),
//   number_injured: z.string().optional(),
description: z.string().optional(),
  are_people_hurt: z.boolean(),
  uploaded_images: z.array(z.any()).optional(),
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
});
