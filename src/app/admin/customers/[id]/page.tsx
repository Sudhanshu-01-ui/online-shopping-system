import { adminGetCustomerDetails } from "@/lib/actions/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Package, MapPin, Eye } from "lucide-react";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await adminGetCustomerDetails(id);

  if (!customer) {
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
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            {customer.firstName[0]}
            {customer.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-xs text-slate-500">
              Member since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{customer.email}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{customer.phone || "Not provided"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{customer.orders.length} placed</p>
        </div>
      </div>

      {/* Customer's Order History */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/75">
          <h2 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600" />
            Order History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customer.orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{o.orderNumber}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="py-3 px-4 text-xs text-slate-700">{o.items.length} items</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(Number(o.total))}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariantMap[o.status] || "default"}>{o.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {o.payment ? (
                      <Badge variant={o.payment.status === "SUCCESS" ? "success" : "warning"}>
                        {o.payment.status}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {customer.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-slate-400">
                    No orders placed by this customer yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Addresses */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          Saved Delivery Addresses ({customer.addresses.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customer.addresses.map((a) => (
            <div key={a.id} className="rounded-lg border border-slate-200 p-4 text-xs text-slate-600">
              <span className="font-semibold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {a.label}
              </span>
              <p className="mt-2 font-medium text-slate-900">{a.fullName}</p>
              <p className="mt-0.5">
                {a.addressLine1}
                {a.addressLine2 && `, ${a.addressLine2}`}
              </p>
              <p>
                {a.city}, {a.state} - {a.pincode}
              </p>
              <p className="mt-1 text-slate-400">Phone: {a.phone}</p>
            </div>
          ))}

          {customer.addresses.length === 0 && (
            <p className="text-xs text-slate-400">No addresses saved.</p>
          )}
        </div>
      </div>
    </div>
  );
}

