import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/lib/actions/cart";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  let cartCount = 0;

  if (user) {
    try {
      const result = await getCartCount();
      if (result.success) cartCount = result.data ?? 0;
    } catch {
      // Not logged in or error
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

