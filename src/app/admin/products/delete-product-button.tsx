"use client";

import { useState } from "react";
import { adminDeleteProduct } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toast";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    setLoading(true);
    try {
      const res = await adminDeleteProduct(productId);
      if (res.success) {
        addToast("Product deleted successfully", "info");
      } else {
        addToast(res.error || "Failed to delete product", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

