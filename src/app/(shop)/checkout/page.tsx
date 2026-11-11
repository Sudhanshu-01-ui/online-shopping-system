import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import { getAddresses } from "@/lib/actions/addresses";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?redirect=/checkout");
  }

  const [cartRes, addressRes] = await Promise.all([
    getCart(),
    getAddresses(),
  ]);

  const rawItems = cartRes.success && cartRes.data?.items ? cartRes.data.items : [];
  const items = rawItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
    },
  }));

  const addresses = addressRes.success && addressRes.data ? addressRes.data : [];

  if (items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>
      <CheckoutForm items={items} addresses={addresses} />
    </div>
  );
}
