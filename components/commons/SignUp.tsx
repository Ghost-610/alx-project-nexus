// components/commons/SignIn.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ApiResponse = {
  success: boolean;
  message?: string;
  user?: { id: string; firstname:string; lastname:string; username: string; email: string };
  token?: string;
};

const SignIn: React.FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted18, setAccepted18] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [returnedUser, setReturnedUser] = useState<ApiResponse["user"] | null>(
    null
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (!accepted18)
      e.accepted18 = "You must confirm you are 18+ and accept the terms.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showTemporaryToast = (
    type: "success" | "error",
    message: string,
    duration = 2500
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const onSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data: ApiResponse = await resp.json();

      if (!resp.ok || !data.success) {
        setErrors({ form: data.message || "Registration failed. Try again." });
        showTemporaryToast("error", data.message || "Registration failed.");
        return;
      }

      // Save token + user (mock)
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setReturnedUser(data.user ?? null);

      // Show success toast
      showTemporaryToast("success", "Registration successful! Redirecting...");

      // Show returned info briefly before redirecting
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch {
      setErrors({ form: "Network error. Please try again." });
      showTemporaryToast("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simulated social sign-in flow
  const handleSocialSignIn = async (provider: "google" | "facebook") => {
    setSocialLoading((s) => ({ ...s, [provider]: true }));
    try {
      const resp = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data: ApiResponse = await resp.json();
      if (!resp.ok || !data.success) {
        setErrors({ form: data.message || `${provider} sign-in failed.` });
        showTemporaryToast(
          "error",
          data.message || `${provider} sign-in failed.`
        );
        return;
      }

      // Save token + user (mock)
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setReturnedUser(data.user ?? null);
      showTemporaryToast(
        "success",
        `${provider} sign-in successful. Redirecting...`
      );

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setErrors({ form: "Social sign-in error. Try again." });
      showTemporaryToast("error", "Social sign-in error. Try again.");
    } finally {
      setSocialLoading((s) => ({ ...s, [provider]: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 relative">
        {/* Toast */}
        {toast && (
          <div
            role="status"
            className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-md text-sm ${
              toast.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {toast.message}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Create account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Join us — enter your details below.
        </p>

        {errors.form && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 p-2 rounded">
            {errors.form}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
    

          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              name="username"
              autoComplete="username"
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-amber-300 ${
                errors.username ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Choose your username"
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              autoComplete="email"
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-amber-300 ${
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </label>

          <label className="block mb-2 relative">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <div className="mt-1">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                className={`block w-full rounded-md border px-3 py-2 pr-10 focus:ring-2 focus:ring-amber-300 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Enter a secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[38px] text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </label>

          <label className="flex items-start space-x-3 mt-4">
            <input
              type="checkbox"
              checked={accepted18}
              onChange={(e) => setAccepted18(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-amber-300"
            />
            <div className="text-sm text-gray-700">
              I confirm I am at least <strong>18 years old</strong> and accept
              the{" "}
              <a href="/terms" className="text-amber-600 hover:underline">
                Terms &amp; Conditions
              </a>
              .
              {errors.accepted18 && (
                <p className="text-xs text-red-600 mt-1">{errors.accepted18}</p>
              )}
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-[#F2AA4C] px-4 py-2 text-white font-semibold shadow hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="mb-3 text-sm text-gray-500">Or sign up with</div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleSocialSignIn("google")}
              disabled={!!socialLoading.google}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              {socialLoading.google ? "Signing in..." : "Google"}
            </button>

            <button
              onClick={() => handleSocialSignIn("facebook")}
              disabled={!!socialLoading.facebook}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              {socialLoading.facebook ? "Signing in..." : "Facebook"}
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
         <Link href="/auth/login" className="text-amber-600 hover:underline">
  Log In
</Link>
        </div>

        {/* Returned user preview (display before redirect) */}
        {returnedUser && (
          <div className="mt-4 border-t pt-3 text-sm text-gray-700">
            <div className="font-medium text-gray-800">
              Welcome, {returnedUser.username}!
            </div>
            <div className="text-xs text-gray-500">
              Email: {returnedUser.email}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Redirecting to your dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;





      {/* <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">First Name</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              name="username"
              autoComplete="firstname"
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-amber-300 ${
                errors.username ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Enter your first name"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Last Name </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              name="username"
              autoComplete="lastname"
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-amber-300 ${
                errors.username ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Enter your last name"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </label> */}