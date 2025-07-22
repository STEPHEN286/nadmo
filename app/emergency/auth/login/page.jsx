"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { Shield, User, Lock, Heart, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

export default function NADMOLoginPage() {
  const { login, user, mounted, isPending, error, isError } = useReporterAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && user) {
      router.push("/emergency");
    }
  }, [user, mounted, router]);

  // Show error toast when login fails
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Login Failed",
        description: error?.response?.data?.error || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is handled by the useReporterAuth hook
      console.error("Login error:", error);
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

  // Don't show login if already authenticated
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
              <p className="text-gray-600 text-sm">Sign in to your Reporter account</p>
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
                      className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200"
                      disabled={isPending}
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
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...form.register("password")}
                      className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200 pr-10"
                      disabled={isPending}
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

                <div className="flex items-center justify-between">
                  {/* <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe" {...form.register("rememberMe")} />
                    <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div> */}
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in as Reporter"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                {/* <p className="text-sm text-gray-600">
                  Need help? Contact your NADMO administrator
                </p> */}
                <p className="text-sm text-gray-600 mt-2">
                  Don't have an account?{" "}
                  <Link href="/emergency/auth/signup" className="text-red-600 hover:text-red-700 font-medium">
                    Sign up as Reporter
                  </Link>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Reporters can submit emergency reports and track their status
                </p>
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
              <Heart className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
            <p className="text-lg mb-6 opacity-90">
              Access your NADMO emergency reporting dashboard. Continue helping communities by reporting and tracking emergency situations.
            </p>
            <div className="space-y-3 text-sm opacity-80">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>View your submitted emergency reports</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Track response progress and updates</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Submit new emergency reports</span>
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