"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, User, Lock, GraduationCap, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

export function LoginForm({ systemType = "EDU_TRACK" }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { isSubmitting } = form.formState;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (systemType === "NADMO") {
        router.push("/nadmo/dashboard");
      } else {
        router.push("/edu-track/dashboard");
      }
    }
  }, [user, router, systemType]);

  // Show error toast when login fails
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const onSubmit = async (data) => {
    await login(data.email, data.password, systemType);
  };

  // Show loading while checking authentication
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't show login if already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Redirecting...</span>
      </div>
    );
  }

  const isNADMO = systemType === "NADMO";
  const buttonColor = isNADMO ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700";
  const iconColor = isNADMO ? "text-red-600" : "text-green-600";
  const bgColor = isNADMO ? "bg-red-100" : "bg-green-100";
  const focusColor = isNADMO ? "focus:border-red-400 focus:ring-red-200" : "focus:border-green-400 focus:ring-green-200";
  const systemName = isNADMO ? "NADMO Emergency" : "EDU-Track";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className={`mx-auto w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mb-4`}>
              {isNADMO ? (
                <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
              ) : (
                <GraduationCap className={`h-6 w-6 ${iconColor}`} />
              )}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {systemName}
            </h1>
            <p className="text-gray-600 text-sm">Sign in to your account</p>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email or Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email or username"
                    {...form.register("email")}
                    className={`pl-10 h-12 border-gray-200 ${focusColor}`}
                    disabled={isSubmitting}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...form.register("password")}
                    className={`pl-10 h-12 border-gray-200 ${focusColor}`}
                    disabled={isSubmitting}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" {...form.register("rememberMe")} />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className={`w-full h-12 ${buttonColor} text-white font-medium`}
                disabled={isSubmitting}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  `Sign in to ${systemName}`
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact your system administrator
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
