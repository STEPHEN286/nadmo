"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetPassword } from "@/hooks/use-set-password";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { setPassword: setPasswordMutation, isLoading, error: hookError, isSuccess } = useSetPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPasswordMutation(
      { uid, token, password },
      {
        onSuccess: () => {
          setSuccess("Password set successfully! You can now log in.");
          setTimeout(() => router.push("/login"), 2000);
        },
        onError: () => {
          // handled by hookError
        },
      }
    );
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Set Your Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {(error || hookError) && <div className="text-red-600 text-sm">{error || hookError?.response?.data?.message || hookError?.message}</div>}
        {(success || isSuccess) && <div className="text-green-600 text-sm">{success || "Password set successfully! You can now log in."}</div>}
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Setting..." : "Set Password"}
        </button>
      </form>
    </div>
  );
} 