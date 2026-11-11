"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export function AddToCartForm({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleAdd() {
    if (stock === 0) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("productId", productId);
      fd.set("quantity", String(quantity));
      const res = await addToCart(fd);
      if (res.success) {
        addToast("Added to cart!", "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to add to cart", "error");
      }
    } catch {
      addToast("Please login to add items to cart", "error");
    } finally {
      setLoading(false);
    }
  }

  if (stock === 0) {
    return (
      <Button disabled variant="secondary" className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Quantity:</span>
        <div className="flex items-center rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
            disabled={quantity >= stock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleAdd}
          loading={loading}
          className="flex-1"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
