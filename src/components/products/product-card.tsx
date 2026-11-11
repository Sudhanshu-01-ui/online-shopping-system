"use client";

import Link from "next/link";
import { Star, ShoppingCart, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    images: string[];
    rating: number;
    reviewCount: number;
    featured: boolean;
    category: { name: string; slug: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);

  const stockStatus =
    product.stock === 0
      ? { label: "Out of Stock", variant: "destructive" as const }
      : product.stock <= 5
        ? { label: `Only ${product.stock} left`, variant: "warning" as const }
        : { label: "In Stock", variant: "success" as const };

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    setAdding(true);
    try {
      const fd = new FormData();
      fd.set("productId", product.id);
      fd.set("quantity", "1");
      const result = await addToCart(fd);
      if (result.success) {
        addToast("Added to cart!", "success");
      } else {
        addToast(result.error || "Failed to add", "error");
      }
    } catch {
      addToast("Please login to add items to cart", "error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="h-16 w-16 text-slate-300" />
        )}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1">
          <span className="text-xs text-slate-500">{product.category.name}</span>
        </div>
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock & Add to Cart */}
        <div className="mt-3 flex items-center justify-between">
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
          <Button
            size="sm"
            variant={product.stock === 0 ? "secondary" : "default"}
            disabled={product.stock === 0 || adding}
            loading={adding}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

