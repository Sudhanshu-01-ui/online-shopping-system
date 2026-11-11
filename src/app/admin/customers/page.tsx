import { adminGetCustomers } from "@/lib/actions/admin";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Search, Eye, Users } from "lucide-react";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const data = await adminGetCustomers({ search, page, limit: 15 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.total} registered customer accounts
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          name="search"
          defaultValue={search || ""}
          placeholder="Search customer by name or email..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Orders Placed</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {c.firstName} {c.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.email}</td>
                  <td className="py-3 px-4 text-slate-500">{c.phone || "—"}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {c._count.orders} orders
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{formatDate(c.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {data.customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    No customers found.
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

