"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ email }) => {
      const res = await axios.post(`${BASE_URL}/auth/forgot-password/`, { email });
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "If an account with this email exists, you will receive a password reset link shortly.",
      });
      setSubmitted(true);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || error.message || 'An error occurred while sending the reset email';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const { isPending } = mutation;

  const onSubmit = (data) => {
    mutation.mutate({ email: data.email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image section */}
        <div className="hidden md:block md:w-1/2 relative min-h-[500px] bg-gradient-to-br from-red-500 to-red-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-8 text-center h-full">
            <div className="max-w-md">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-8">
                <AlertTriangle className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">NADMO Emergency</h2>
              <p className="text-lg mb-6 opacity-90">
                Reset your password to regain access to your NADMO account.
              </p>
              <div className="space-y-3 text-sm opacity-80">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Secure password reset process</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Receive a reset link via email</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Contact support if you need help</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Forgot password form section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <Card className="shadow-none border-0">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Forgot Password
                </h1>
                <p className="text-gray-600 text-sm">Enter your email to reset your password</p>
              </CardHeader>
              <CardContent className="pt-0">
                {submitted ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
                      <Mail className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-red-700">Check your email</h2>
                    <p className="text-gray-600 text-sm">
                      If an account with <span className="font-medium">{form.getValues("email")}</span> exists, you will receive a password reset link shortly.
                    </p>
                    <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push('/login/edu-track')}>Back to Login</Button>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
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
                    <Button
                      type="submit"
                      className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => router.push('/login/edu-track')}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}