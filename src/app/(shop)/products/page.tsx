import { Suspense } from "react";
import { getProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const [result, categories] = await Promise.all([
    getProducts({ search, category, sort, minPrice, maxPrice, page }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {search ? `Search results for "${search}"` : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{result.total} products found</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {result.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-slate-900">No products found</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters</p>
              <Link
                href="/products"
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {result.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...(search ? { search } : {}),
                        ...(category ? { category } : {}),
                        ...(sort ? { sort } : {}),
                        page: String(page - 1),
                      }).toString()}`}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Link>
                  )}
                  <span className="px-3 py-2 text-sm text-slate-600">
                    Page {page} of {result.pages}
                  </span>
                  {page < result.pages && (
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...(search ? { search } : {}),
                        ...(category ? { category } : {}),
                        ...(sort ? { sort } : {}),
                        page: String(page + 1),
                      }).toString()}`}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

