import { adminGetDeliveries } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DeliveryStatusButton } from "./delivery-status-button";

export default async function AdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const data = await adminGetDeliveries({ status, page, limit: 15 });

  const statusVariantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    SHIPPED: "secondary",
    IN_TRANSIT: "default",
    OUT_FOR_DELIVERY: "default",
    DELIVERED: "success",
    RETURNED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deliveries Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.total} shipment and dispatch records
          </p>
        </div>
      </div>

      {/* Filter */}
      <form className="max-w-xs">
        <select
          name="status"
          defaultValue={status || "ALL"}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Delivery Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SHIPPED">Shipped</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="RETURNED">Returned</option>
        </select>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Shipped / Delivered</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/orders/${d.orderId}`}
                      className="font-mono font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {d.order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">
                      {d.order.customer.firstName} {d.order.customer.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {d.order.address.city}, {d.order.address.state}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                    {d.carrier || "—"}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {d.trackingNumber || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariantMap[d.status] || "default"}>{d.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {d.deliveredAt
                      ? `Delivered: ${formatDate(d.deliveredAt)}`
                      : d.shippedAt
                      ? `Shipped: ${formatDate(d.shippedAt)}`
                      : "Awaiting dispatch"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DeliveryStatusButton deliveryId={d.id} currentStatus={d.status} />
                  </td>
                </tr>
              ))}

              {data.deliveries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                    No delivery records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

