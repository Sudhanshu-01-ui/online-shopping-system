"use client";

import { useState } from "react";
import { adminUpdateDelivery } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export function DeliveryStatusButton({
  deliveryId,
  currentStatus,
}: {
  deliveryId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleChange(newStatus: string) {
    if (newStatus === currentStatus) return;
    setLoading(true);

    const fd = new FormData();
    fd.set("deliveryId", deliveryId);
    fd.set("status", newStatus);

    try {
      const res = await adminUpdateDelivery(fd);
      if (res.success) {
        addToast(`Delivery status updated to ${newStatus}`, "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update delivery", "error");
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
      <option value="SHIPPED">SHIPPED</option>
      <option value="IN_TRANSIT">IN_TRANSIT</option>
      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
      <option value="DELIVERED">DELIVERED</option>
      <option value="RETURNED">RETURNED</option>
    </select>
  );
}

