import { adminGetPayments } from "@/lib/actions/admin";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PaymentStatusButton } from "./payment-status-button";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const data = await adminGetPayments({ status, page, limit: 15 });

  const statusVariantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    SUCCESS: "success",
    FAILED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.total} recorded transactions in system
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
          <option value="ALL">All Payment Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/orders/${p.orderId}`}
                      className="font-mono font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {p.order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-medium">
                    {p.order.customer.firstName} {p.order.customer.lastName}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-600">{p.method}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(p.amount)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariantMap[p.status] || "default"}>{p.status}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.transactionId || "—"}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {p.paidAt ? formatDateTime(p.paidAt) : formatDate(p.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <PaymentStatusButton paymentId={p.id} currentStatus={p.status} />
                  </td>
                </tr>
              ))}

              {data.payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                    No payment records found.
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

