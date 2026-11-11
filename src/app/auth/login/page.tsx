"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
      if (res.success) {
        addToast("Logged in successfully!", "success");
        if (res.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(redirectUrl);
        }
        router.refresh();
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and password to access your account
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign up
        </Link>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100">
        <p className="font-semibold text-slate-700">Demo Accounts:</p>
        <p className="mt-0.5">Admin: <span className="font-mono text-slate-800">admin@shopease.com</span> / <span className="font-mono text-slate-800">admin123</span></p>
        <p className="mt-0.5">Customer: <span className="font-mono text-slate-800">rahul.sharma@example.com</span> / <span className="font-mono text-slate-800">password123</span></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
