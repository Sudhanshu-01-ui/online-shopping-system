"use client";

import { useState } from "react";
import { adminUpdatePaymentStatus } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export function PaymentStatusButton({
  paymentId,
  currentStatus,
}: {
  paymentId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleChange(newStatus: string) {
    if (newStatus === currentStatus) return;
    setLoading(true);

    const fd = new FormData();
    fd.set("paymentId", paymentId);
    fd.set("status", newStatus);

    try {
      const res = await adminUpdatePaymentStatus(fd);
      if (res.success) {
        addToast(`Payment marked as ${newStatus}`, "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update payment", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={currentStatus}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      <option value="PENDING">PENDING</option>
      <option value="SUCCESS">SUCCESS</option>
      <option value="FAILED">FAILED</option>
    </select>
  );
}

