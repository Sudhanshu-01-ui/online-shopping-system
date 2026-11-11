import Link from "next/link";
import { Package } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600"
          >
            <Package className="h-8 w-8" />
            <span>ShopEase</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

