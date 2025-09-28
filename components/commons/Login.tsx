// components/commons/Login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

type ApiResponse = {
  success: boolean;
  message?: string;
  user?: { id: string; username: string; email: string };
  token?: string;
};

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showTemporaryToast = (
    type: "success" | "error",
    message: string,
    duration = 2200
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const onSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse = await resp.json();

      if (!resp.ok || !data.success) {
        setErrors({ form: data.message || "Login failed" });
        showTemporaryToast("error", data.message || "Login failed");
        return;
      }

      // store mock token and user
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      showTemporaryToast("success", "Login successful. Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1300);
    } catch (err) {
      setErrors({ form: "Network error" });
      showTemporaryToast("error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-8 relative">
        {toast && (
          <div
            className={`absolute top-4 right-4 px-4 py-2 rounded-md text-sm ${
              toast.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {toast.message}
          </div>
        )}
        <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to continue to your dashboard.
        </p>

        {errors.form && (
          <div className="mb-3 text-red-700 text-sm bg-red-50 p-2 rounded">
            {errors.form}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label className="block mb-3">
            <span className="text-sm text-gray-700">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              placeholder="you@example.com"
            />
            {errors.email && (
              <div className="text-xs text-red-600 mt-1">{errors.email}</div>
            )}
          </label>

          <label className="block mb-3 relative">
            <span className="text-sm text-gray-700">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="mt-1 block w-full rounded-md border px-3 py-2 pr-10"
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-[38px] text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <div className="text-xs text-red-600 mt-1">{errors.password}</div>
            )}
          </label>

          <button
            disabled={loading}
            type="submit"
            className="mt-2 w-full bg-[#1A2037] text-white py-2 rounded-md"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signin" className="text-amber-600 hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
