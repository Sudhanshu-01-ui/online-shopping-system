import { getCart } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CartView } from "./cart-view";

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?redirect=/cart");
  }

  const result = await getCart();
  const rawItems = result.success && result.data?.items ? result.data.items : [];
  const items = rawItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      stock: item.product.stock,
      images: item.product.images,
      category: { name: item.product.category.name },
    },
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
      <CartView initialItems={items} />
    </div>
  );
}
