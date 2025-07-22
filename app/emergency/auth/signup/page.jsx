"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { User, Lock, Phone, MapPin, Shield, Mail, Users, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRegions } from "@/hooks/use-regions";
import { useDistricts } from "@/hooks/use-districts";
import { signupSchema } from "@/lib/utils";


export default function NADMOSignupPage() {
  const { signup, user, mounted, isPending, error, isError } = useReporterAuth();
  const router = useRouter();
  const { toast } = useToast();


  
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      region: "",
      district: "",
    },
  });

  const { data: regions, isPending: regionsLoading } = useRegions();
  const selectedRegion = form.watch("region");
  console.log("region", selectedRegion)
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && user) {
      router.push("/emergency");
    }
  }, [user, mounted, router]);

  // Show error toast when signup fails
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Signup Failed",
        description: error?.response?.data?.error || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const onSubmit = async (data) => {
    try {
      await signup(data);
    } catch (error) {
      // Error is handled by the useReporterAuth hook
      console.error("Signup error:", error);
    }
  };

  // Show loading while checking authentication
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Don't show signup if already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-4 text-gray-600">Redirecting...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
                      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                NADMO Emergency
              </h1>
              <p className="text-gray-600 text-sm">Sign up as a Reporter</p>
              {/* <p className="text-xs text-gray-500 mt-1">Guest access for emergency reporting</p> */}
            </CardHeader>

            <CardContent className="pt-0">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Email and Password in one row */}
                <div className="grid grid-cols-1  gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. John Doe"
                      {...form.register("full_name")}
                      className="h-12 border-gray-200 focus:border-red-400 focus:ring-red-200"
                      disabled={isPending}
                      onChange={e => {
                        form.clearErrors("full_name");
                        form.setValue("full_name", e.target.value);
                      }}
                    />
                    {form.formState.errors.full_name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. reporter@example.com"
                        {...form.register("email")}
                        className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200"
                        disabled={isPending}
                        onChange={e => {
                          form.clearErrors("email");
                          form.setValue("email", e.target.value);
                        }}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone_number"
                        type="tel"
                        placeholder="e.g. 0244123456"
                        {...form.register("phone_number")}
                        className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200"
                        disabled={isPending}
                        onChange={e => {
                          form.clearErrors("phone_number");
                          form.setValue("phone_number", e.target.value);
                        }}
                      />
                    </div>
                    {form.formState.errors.phone_number && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.phone_number.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone and Region in one row */}
              
                 

                  {/* Replace the region and district fields section with a grid for side-by-side layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                        Region
                      </Label>
                      <Select
                        value={form.watch("region")}
                        onValueChange={value => {
                          form.clearErrors("region");
                          form.setValue("region", value);
                          form.setValue("district", "");
                        }}
                        disabled={isPending || regionsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {regions && regions.length > 0 ? (
                            regions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Loading regions...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.region && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.region.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                        District
                      </Label>
                      <Select
                        value={form.watch("district")}
                        onValueChange={value => {
                          form.clearErrors("district");
                          form.setValue("district", value);
                        }}
                        disabled={isPending || districtsLoading || !form.watch("region")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {districtsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading districts...
                            </SelectItem>
                          ) : districts && districts.length > 0 ? (
                            districts.map((district) => (
                              <SelectItem key={district.id} value={district.id}>
                                {district.name}
                              </SelectItem>
                            ))
                          ) : form.watch("region") ? (
                            <SelectItem value="no-districts" disabled>
                              No districts found
                            </SelectItem>
                          ) : (
                            <SelectItem value="select-region-first" disabled>
                              Select a region first
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.district && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.district.message}
                        </p>
                      )}
                    </div>
                  </div>
                

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="e.g. StrongPassword123!"
                        {...form.register("password")}
                        className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200 pr-10"
                        disabled={isPending}
                        onChange={e => {
                          form.clearErrors("password");
                          form.setValue("password", e.target.value);
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-4 text-gray-400 hover:text-gray-700"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      {...form.register("confirmPassword")}
                      className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200 pr-10"
                      disabled={isPending}
                      onChange={e => {
                        form.clearErrors("confirmPassword");
                        form.setValue("confirmPassword", e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-4 text-gray-400 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-800">
                    <strong>Note:</strong> You will be registered as a "REPORTER" with limited access to submit emergency reports and track their status.
                  </p>
                </div> */}

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Sign up as Reporter"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/emergency/auth/login" className="text-red-600 hover:text-red-700 font-medium">
                    Sign in here
                  </Link>
                </p>
                {/* <p className="text-sm text-gray-500 mt-2">
                  Reporters can submit emergency reports and track their status
                </p> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Image Card */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-500 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-8 text-center">
          <div className="max-w-md">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-8">
              <Users className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Emergency Response System</h2>
            <p className="text-lg mb-6 opacity-90">
              Join NADMO's network of emergency reporters. Help save lives by reporting disasters and emergencies in real-time.
            </p>
            <div className="space-y-3 text-sm opacity-80">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Submit emergency reports with photos and location</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Track response progress in real-time</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Get updates on emergency resolution</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 