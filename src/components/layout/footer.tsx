import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-indigo-600"
            >
              <Package className="h-5 w-5" />
              ShopEase
            </Link>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Your one-stop destination for quality products at great prices.
              Fast delivery, easy returns, and excellent customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "All Products", href: "/products" },
                { label: "DBMS Documentation", href: "/database" },
                { label: "Admin Portal", href: "/admin" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Customer Service
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "My Account", href: "/account" },
                { label: "Order Tracking", href: "/account/orders" },
                { label: "Shipping Policy", href: "/shipping" },
                { label: "Returns & Refunds", href: "/returns" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>support@shopease.in</li>
              <li>+91 98765 43210</li>
              <li>
                123 Commerce Street,
                <br />
                Mumbai, Maharashtra 400001
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
