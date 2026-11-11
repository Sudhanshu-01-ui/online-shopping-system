import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Star, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AddToCartForm } from "./add-to-cart-form";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  const stockStatus =
    product.stock === 0
      ? { label: "Out of Stock", variant: "destructive" as const }
      : product.stock <= 5
        ? { label: `Only ${product.stock} left`, variant: "warning" as const }
        : { label: "In Stock", variant: "success" as const };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-24 w-24 text-slate-300" />
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-2">
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge variant="destructive">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4">
            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            {product.stock > 0 && product.stock <= 10 && (
              <p className="mt-1 text-sm text-slate-500">
                Hurry! Only {product.stock} items remaining
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-900">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>

          {/* Add to Cart */}
          <div className="mt-8">
            <AddToCartForm productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900">Related Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

