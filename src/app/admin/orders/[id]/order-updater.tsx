"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  adminUpdateOrderStatus,
  adminUpdateDelivery,
  adminUpdatePaymentStatus,
} from "@/lib/actions/admin";
import { RefreshCw, Truck, CreditCard } from "lucide-react";

interface OrderUpdaterProps {
  orderId: string;
  currentStatus: string;
  delivery?: {
    id: string;
    status: string;
    trackingNumber?: string | null;
    carrier?: string | null;
  } | null;
  payment?: {
    id: string;
    status: string;
    method: string;
  } | null;
}

export function OrderUpdater({
  orderId,
  currentStatus,
  delivery,
  payment,
}: OrderUpdaterProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [status, setStatus] = useState(currentStatus);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Delivery state
  const [deliveryStatus, setDeliveryStatus] = useState(delivery?.status || "PENDING");
  const [trackingNumber, setTrackingNumber] = useState(delivery?.trackingNumber || "");
  const [carrier, setCarrier] = useState(delivery?.carrier || "BlueDart Express");
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  // Payment state
  const [paymentStatus, setPaymentStatus] = useState(payment?.status || "PENDING");
  const [loadingPayment, setLoadingPayment] = useState(false);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoadingStatus(true);
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("status", status);

    try {
      const res = await adminUpdateOrderStatus(fd);
      if (res.success) {
        addToast(`Order status updated to ${status}`, "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update order status", "error");
      }
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleDeliveryUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!delivery) return;

    setLoadingDelivery(true);
    const fd = new FormData();
    fd.set("deliveryId", delivery.id);
    fd.set("status", deliveryStatus);
    if (trackingNumber) fd.set("trackingNumber", trackingNumber);
    if (carrier) fd.set("carrier", carrier);

    try {
      const res = await adminUpdateDelivery(fd);
      if (res.success) {
        addToast("Delivery information updated", "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update delivery", "error");
      }
    } finally {
      setLoadingDelivery(false);
    }
  }

  async function handlePaymentUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!payment) return;

    setLoadingPayment(true);
    const fd = new FormData();
    fd.set("paymentId", payment.id);
    fd.set("status", paymentStatus);

    try {
      const res = await adminUpdatePaymentStatus(fd);
      if (res.success) {
        addToast(`Payment marked as ${paymentStatus}`, "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update payment", "error");
      }
    } finally {
      setLoadingPayment(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Status Box */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-indigo-600" />
          Update Order Status
        </h2>

        <form onSubmit={handleStatusUpdate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Lifecycle Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED (Restores Stock)</option>
            </select>
          </div>

          <Button type="submit" loading={loadingStatus} size="sm" className="w-full">
            Save Status
          </Button>
        </form>
      </div>

      {/* Delivery Tracking Box */}
      {delivery && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-indigo-600" />
            Update Delivery Tracking
          </h2>

          <form onSubmit={handleDeliveryUpdate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Delivery Status
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Carrier Name
              </label>
              <Input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Delhivery, BlueDart"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tracking Number
              </label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TRK..."
                className="h-9 text-xs font-mono"
              />
            </div>

            <Button type="submit" loading={loadingDelivery} size="sm" variant="outline" className="w-full">
              Update Delivery
            </Button>
          </form>
        </div>
      )}

      {/* Payment Status Box */}
      {payment && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            Update Payment Status
          </h2>

          <form onSubmit={handlePaymentUpdate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Status ({payment.method})
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <Button type="submit" loading={loadingPayment} size="sm" variant="outline" className="w-full">
              Update Payment
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

