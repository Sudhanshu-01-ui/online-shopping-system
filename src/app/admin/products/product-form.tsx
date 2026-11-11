"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { adminCreateProduct, adminUpdateProduct } from "@/lib/actions/admin";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    stock: number;
    categoryId: string;
    images: string[];
    featured: boolean;
    isActive: boolean;
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(initialData);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      let res;
      if (isEditing && initialData) {
        res = await adminUpdateProduct(initialData.id, formData);
      } else {
        res = await adminCreateProduct(formData);
      }

      if (res.success) {
        addToast(
          isEditing ? "Product updated successfully!" : "Product created successfully!",
          "success"
        );
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(res.error || "Failed to save product");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Name *
            </label>
            <Input
              name="name"
              defaultValue={initialData?.name || ""}
              placeholder="e.g. Wireless Noise Cancelling Headphones"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description || ""}
              rows={4}
              placeholder="Comprehensive product specifications, features, and details..."
              required
              className="w-full rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Selling Price (₹) *
              </label>
              <Input
                name="price"
                type="number"
                step="0.01"
                min="1"
                defaultValue={initialData?.price || ""}
                placeholder="1999"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Compare Price / MRP (₹)
              </label>
              <Input
                name="comparePrice"
                type="number"
                step="0.01"
                min="1"
                defaultValue={initialData?.comparePrice || ""}
                placeholder="2999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Quantity *
              </label>
              <Input
                name="stock"
                type="number"
                min="0"
                defaultValue={initialData?.stock ?? 10}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                defaultValue={initialData?.categoryId || categories[0]?.id}
                required
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Image URLs (comma separated)
              </label>
              <Input
                name="images"
                defaultValue={initialData?.images?.join(", ") || ""}
                placeholder="https://images.unsplash.com/..., https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                value="true"
                defaultChecked={initialData?.featured ?? false}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Featured Product (Show on homepage)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={initialData?.isActive ?? true}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Active (Visible in store)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4" />
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
            <Link
              href="/admin/products"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

