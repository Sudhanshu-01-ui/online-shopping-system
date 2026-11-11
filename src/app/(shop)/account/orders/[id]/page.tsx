import { requireAuth } from "@/lib/auth";
import { getOrderDetails } from "@/lib/actions/orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, CreditCard, MapPin, CheckCircle2 } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const res = await getOrderDetails(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const order = res.data;

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
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <Badge variant={statusVariantMap[order.status] || "default"}>
                {order.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Order Items ({order.items.length})
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        Qty: {item.quantity} × {formatPrice(Number(item.price))}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatPrice(Number(item.total))}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-slate-200 pt-4 mt-2 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{Number(order.shipping) === 0 ? "FREE" : formatPrice(Number(order.shipping))}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-slate-900">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Delivery Tracking */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              Delivery Information
            </h2>

            {order.delivery ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={order.delivery.status === "DELIVERED" ? "success" : "default"}>
                    Status: {order.delivery.status}
                  </Badge>
                  {order.delivery.trackingNumber && (
                    <span className="text-xs font-mono text-slate-600">
                      Tracking: {order.delivery.trackingNumber}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  {order.delivery.carrier && (
                    <div>
                      <span className="font-semibold text-slate-700">Carrier:</span> {order.delivery.carrier}
                    </div>
                  )}
                  {order.delivery.shippedAt && (
                    <div>
                      <span className="font-semibold text-slate-700">Shipped:</span> {formatDate(order.delivery.shippedAt)}
                    </div>
                  )}
                  {order.delivery.estimatedDate && (
                    <div>
                      <span className="font-semibold text-slate-700">Estimated Delivery:</span> {formatDate(order.delivery.estimatedDate)}
                    </div>
                  )}
                  {order.delivery.deliveredAt && (
                    <div className="text-emerald-700 font-medium">
                      <span className="font-semibold">Delivered on:</span> {formatDateTime(order.delivery.deliveredAt)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Delivery details being processed.</p>
            )}
          </div>
        </div>

        {/* Right Column: Payment & Shipping Address */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Status Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Payment Details
            </h2>

            {order.payment ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium text-slate-900">{order.payment.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <Badge variant={order.payment.status === "SUCCESS" ? "success" : "warning"}>
                    {order.payment.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-slate-900">{formatPrice(Number(order.payment.amount))}</span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="font-mono text-slate-700">{order.payment.transactionId}</span>
                  </div>
                )}
                {order.payment.paidAt && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Paid At</span>
                    <span>{formatDateTime(order.payment.paidAt)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No payment record.</p>
            )}
          </div>

          {/* Delivery Address Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              Delivery Address
            </h2>

            {order.address ? (
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">{order.address.fullName}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="pt-2 text-xs text-slate-500">
                  Phone: {order.address.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No address details available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

