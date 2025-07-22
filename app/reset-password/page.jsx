"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: async ({ password }) => {
      const res = await axios.post(`${BASE_URL}/auth/reset-password/`, {
        uid,
        token,
        new_password: password,
      });
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
        variant: "default",
      });
      setTimeout(() => router.push("/login"), 2000);
    },
    onError: (err) => {
      toast({
        title: "Failed to Reset Password",
        description: err?.response?.data?.message || err.message || "Failed to reset password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ password: data.password });
  };

  return (
    <div className="min-h-screen flex bg-red-50 items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 text-sm">Enter your new password below</p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="e.g. StrongPassword123!"
                    {...form.register("password")}
                    className="pl-10 h-12 border-gray-200 focus:border-red-400 focus:ring-red-200 pr-10"
                    disabled={mutation.isPending}
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
                    disabled={mutation.isPending}
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
              <Button
                type="submit"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 