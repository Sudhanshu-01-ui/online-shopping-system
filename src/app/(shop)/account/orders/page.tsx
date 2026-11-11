import { requireAuth } from "@/lib/auth";
import { getMyOrders } from "@/lib/actions/orders";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";

export default async function CustomerOrdersPage() {
  await requireAuth();
  const res = await getMyOrders();
  const orders = res.success && res.data ? res.data : [];

  const statusVariantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    PROCESSING: "default",
    SHIPPED: "secondary",
    DELIVERED: "success",
    CANCELLED: "destructive",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and view your previous purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-3">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No orders yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            When you place orders, they will appear here.
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {order.orderNumber}
                  </span>
                  <Badge variant={statusVariantMap[order.status] || "default"}>
                    {order.status}
                  </Badge>
                  {order.payment && (
                    <Badge variant={order.payment.status === "SUCCESS" ? "success" : "warning"}>
                      Payment: {order.payment.status}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Placed on: {formatDate(order.createdAt)}</span>
                  <span>Items: {order.items.length}</span>
                  {order.delivery?.trackingNumber && (
                    <span>Tracking: {order.delivery.trackingNumber}</span>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-900">
                  Total: {formatPrice(Number(order.total))}
                </p>
              </div>

              <div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

