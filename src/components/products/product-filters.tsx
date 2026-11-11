"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products..."
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilters({ search: (e.target as HTMLInputElement).value });
            }
          }}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <div className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
        {/* Sort */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Sort By</label>
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
          <select
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={currentMinPrice}
              onBlur={(e) => updateFilters({ minPrice: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Max"
              defaultValue={currentMaxPrice}
              onBlur={(e) => updateFilters({ maxPrice: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Clear filters */}
        <button
          onClick={() => router.push("/products")}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

