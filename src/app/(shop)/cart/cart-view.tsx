"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateCartItem, removeCartItem, clearCart } from "@/lib/actions/cart";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  stock: number;
  images: string[];
  category: { name: string };
}

interface CartItemData {
  id: string;
  quantity: number;
  product: CartProduct;
}

export function CartView({ initialItems }: { initialItems: CartItemData[] }) {
  const [items, setItems] = useState<CartItemData[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  async function handleQuantityChange(cartItemId: string, newQty: number) {
    if (newQty < 1) return;
    setLoadingId(cartItemId);
    try {
      const fd = new FormData();
      fd.set("cartItemId", cartItemId);
      fd.set("quantity", String(newQty));
      const res = await updateCartItem(fd);
      if (res.success) {
        setItems(
          items.map((item) =>
            item.id === cartItemId ? { ...item, quantity: newQty } : item
          )
        );
        router.refresh();
      } else {
        addToast(res.error || "Failed to update", "error");
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRemove(cartItemId: string) {
    setLoadingId(cartItemId);
    try {
      const res = await removeCartItem(cartItemId);
      if (res.success) {
        setItems(items.filter((item) => item.id !== cartItemId));
        addToast("Item removed", "info");
        router.refresh();
      } else {
        addToast(res.error || "Failed to remove", "error");
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleClear() {
    const res = await clearCart();
    if (res.success) {
      setItems([]);
      addToast("Cart cleared", "info");
      router.refresh();
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-500">
          Looks like you haven&apos;t added any items to your cart yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Items List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <span className="text-sm font-medium text-slate-500">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <button
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 items-center"
          >
            {/* Image */}
            <div className="h-20 w-20 rounded-md bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
              {item.product.images && item.product.images.length > 0 ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-slate-300" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate block"
              >
                {item.product.name}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.product.category.name}
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatPrice(Number(item.product.price))}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || loadingId === item.id}
                className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-medium">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock || loadingId === item.id}
                className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Total */}
            <div className="w-24 text-right">
              <span className="text-sm font-bold text-slate-900">
                {formatPrice(Number(item.product.price) * item.quantity)}
              </span>
            </div>

            {/* Remove */}
            <button
              onClick={() => handleRemove(item.id)}
              disabled={loadingId === item.id}
              className="text-slate-400 hover:text-red-600 p-1"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary Sidebar */}
      <div className="lg:col-span-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated GST (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-indigo-600">
                Add {formatPrice(500 - subtotal)} more for FREE shipping
              </p>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-base text-slate-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
