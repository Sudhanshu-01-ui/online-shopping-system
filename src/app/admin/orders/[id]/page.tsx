import { adminGetOrderDetails } from "@/lib/actions/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";
import { OrderUpdater } from "./order-updater";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await adminGetOrderDetails(id);

  if (!order) {
    notFound();
  }

  const statusVariantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    PROCESSING: "default",
    SHIPPED: "secondary",
    DELIVERED: "success",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <Badge variant={statusVariantMap[order.status] || "default"}>
              {order.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Line Items & Customer Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Purchased Items ({order.items.length})
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} × {formatPrice(Number(item.price))}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatPrice(Number(item.total))}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-4 mt-2 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST 18%)</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>{Number(order.shipping) === 0 ? "FREE" : formatPrice(Number(order.shipping))}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-slate-900">
                <span>Total Settled</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Customer Info
              </h2>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900 text-sm">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p>Email: {order.customer.email}</p>
                {order.customer.phone && <p>Phone: {order.customer.phone}</p>}
                <Link
                  href={`/admin/customers/${order.customer.id}`}
                  className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View full customer history →
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Delivery Address
              </h2>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900 text-sm">{order.address.fullName}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="pt-1 text-slate-500">Contact: {order.address.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Updaters */}
        <div className="lg:col-span-4">
          <OrderUpdater
            orderId={order.id}
            currentStatus={order.status}
            delivery={order.delivery}
            payment={order.payment}
          />
        </div>
      </div>
    </div>
  );
}

