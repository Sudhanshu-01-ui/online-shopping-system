"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UserPlus } from "lucide-react";

function RegisterForm() {
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
      const res = await register(formData);
      if (res.success) {
        addToast("Account created successfully!", "success");
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(res.error || "Failed to create account");
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
        <h1 className="text-xl font-bold text-slate-900">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Join ShopEase for seamless online shopping
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              First name
            </label>
            <Input name="firstName" placeholder="Rahul" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Last name
            </label>
            <Input name="lastName" placeholder="Sharma" required />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <Input
            name="email"
            type="email"
            placeholder="rahul@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone number (optional)
          </label>
          <Input name="phone" type="tel" placeholder="+91 9876543210" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <Input
            name="password"
            type="password"
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
            required
            minLength={6}
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          <UserPlus className="h-4 w-4" />
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href={`/auth/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
