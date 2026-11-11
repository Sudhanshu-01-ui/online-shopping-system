import { getDashboardStats } from "@/lib/actions/admin";
import { StatsCard } from "@/components/admin/stats-card";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statusVariantMap: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    PROCESSING: "default",
    SHIPPED: "secondary",
    DELIVERED: "success",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time metrics derived from PostgreSQL database
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          description="Registered buyers"
          icon={Users}
          color="text-blue-600 bg-blue-50"
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          description="Active catalog items"
          icon={Package}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          description="Customer orders placed"
          icon={ShoppingCart}
          color="text-amber-600 bg-amber-50"
        />
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          description="Settled payment volume"
          icon={IndianRupee}
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.orderStatusCounts.map((item) => (
            <div
              key={item.status}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-center"
            >
              <Badge variant={statusVariantMap[item.status] || "default"}>
                {item.status}
              </Badge>
              <p className="mt-2 text-xl font-bold text-slate-900">{item.count}</p>
            </div>
          ))}
          {stats.orderStatusCounts.length === 0 && (
            <p className="text-xs text-slate-400 col-span-6">No order records yet.</p>
          )}
        </div>
      </div>

      {/* Two columns: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.customer.firstName} {order.customer.lastName} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatPrice(order.total)}
                    </p>
                    <div className="mt-0.5">
                      <Badge variant={statusVariantMap[order.status] || "default"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {stats.recentOrders.length === 0 && (
                <p className="py-4 text-xs text-slate-400 text-center">No orders yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-slate-900">Low Stock Alert</h2>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Manage stock <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {product.category.name} • {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} units left`}
                    </span>
                  </div>
                </div>
              ))}

              {stats.lowStockProducts.length === 0 && (
                <p className="py-4 text-xs text-emerald-600 text-center">All inventory stock levels healthy!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

