import Link from "next/link";
import { ArrowRight, Truck, Shield, Headphones } from "lucide-react";
import { getFeaturedProducts, getNewArrivals } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { ProductCard } from "@/components/products/product-card";

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Discover Quality Products
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Shop from a curated collection of electronics, fashion, home essentials,
              books, and more — all at great prices with fast delivery.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-150"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Truck className="h-5 w-5 text-indigo-600 shrink-0" />
              <span>Free shipping on orders over ₹500</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Shield className="h-5 w-5 text-indigo-600 shrink-0" />
              <span>Secure payments & buyer protection</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Headphones className="h-5 w-5 text-indigo-600 shrink-0" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-center hover:border-indigo-200 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors duration-150">
                  <span className="text-lg font-bold">{cat.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{cat._count.products} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Trending Products</h2>
              <Link
                href="/products"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">New Arrivals</h2>
              <Link
                href="/products?sort=newest"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

