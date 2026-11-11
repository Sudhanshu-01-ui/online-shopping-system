"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/actions/admin";
import { Plus, Edit, Trash2, Layers, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: {
    products: number;
  };
}

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryWithCount[];
}) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await adminCreateCategory(formData);
      if (res.success) {
        addToast("Category created successfully", "success");
        setShowAddForm(false);
        router.refresh();
      } else {
        addToast(res.error || "Failed to create category", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    setLoading(true);
    const formData = new FormData();
    formData.set("name", editName);
    if (editDesc) formData.set("description", editDesc);

    try {
      const res = await adminUpdateCategory(id, formData);
      if (res.success) {
        setCategories(
          categories.map((c) =>
            c.id === id ? { ...c, name: editName, description: editDesc } : c
          )
        );
        setEditingId(null);
        addToast("Category updated", "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update category", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    const res = await adminDeleteCategory(id);
    if (res.success) {
      setCategories(categories.filter((c) => c.id !== id));
      addToast("Category deleted", "info");
      router.refresh();
    } else {
      addToast(res.error || "Failed to delete category", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {categories.length} product categories registered
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Add New Category</h2>
          <form onSubmit={handleAdd} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category Name *
              </label>
              <Input name="name" placeholder="e.g. Gaming & VR" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Brief category summary..."
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={loading} size="sm">
                Save Category
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Products Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => {
                const isEditing = editingId === c.id;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-500" />
                          <span className="font-semibold text-slate-900">{c.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{c.slug}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {isEditing ? (
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        c.description || "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {c._count.products} products
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdate(c.id)}
                            disabled={loading}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingId(c.id);
                              setEditName(c.name);
                              setEditDesc(c.description || "");
                            }}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            disabled={c._count.products > 0}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:text-slate-400"
                            title={
                              c._count.products > 0
                                ? "Cannot delete category with products"
                                : "Delete category"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                    No categories created yet.
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

