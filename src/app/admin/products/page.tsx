import { adminGetProducts, adminGetCategories } from "@/lib/actions/admin";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Package } from "lucide-react";
import { DeleteProductButton } from "./delete-product-button";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const [productsData, categories] = await Promise.all([
    adminGetProducts({ search, category, page, limit: 15 }),
    adminGetCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {productsData.total} products registered in inventory
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            defaultValue={search || ""}
            placeholder="Search by product name or description..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <form>
          <select
            name="category"
            defaultValue={category || ""}
            // auto submit on change can be handled or done via form
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productsData.products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                        {p.featured && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.category.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{formatPrice(p.price)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold text-xs px-2 py-0.5 rounded ${
                        p.stock === 0
                          ? "bg-red-50 text-red-700"
                          : p.stock <= 5
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.isActive ? "success" : "secondary"}>
                      {p.isActive ? "Active" : "Draft"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              ))}

              {productsData.products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    No products found matching criteria.
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

