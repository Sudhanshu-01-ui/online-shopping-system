"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Save } from "lucide-react";

interface ProfileFormProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        addToast("Profile updated successfully", "success");
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            First Name
          </label>
          <Input name="firstName" defaultValue={user.firstName} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Last Name
          </label>
          <Input name="lastName" defaultValue={user.lastName} required />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <Input
          name="email"
          type="email"
          defaultValue={user.email}
          disabled
          className="bg-slate-50 text-slate-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-slate-400">
          Email address cannot be changed.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Phone Number
        </label>
        <Input
          name="phone"
          type="tel"
          defaultValue={user.phone || ""}
          placeholder="+91 9876543210"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

