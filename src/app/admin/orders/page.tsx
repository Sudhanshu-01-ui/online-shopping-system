import { adminGetOrders } from "@/lib/actions/admin";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const ordersData = await adminGetOrders({ search, status, page, limit: 15 });

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
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {ordersData.total} customer orders placed in system
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            defaultValue={search || ""}
            placeholder="Search by order number or customer name/email..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <form>
          <select
            name="status"
            defaultValue={status || "ALL"}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </form>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordersData.orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">
                      {o.customer.firstName} {o.customer.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{o.customer.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                    {o.items.length} items
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(o.total)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariantMap[o.status] || "default"}>{o.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {o.payment ? (
                      <Badge variant={o.payment.status === "SUCCESS" ? "success" : "warning"}>
                        {o.payment.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}

              {ordersData.orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                    No orders found matching criteria.
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

