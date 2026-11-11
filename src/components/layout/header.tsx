"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  cartCount?: number;
}

export function Header({ user, cartCount = 0 }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);

  // Close account dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-indigo-600 shrink-0"
          >
            <Package className="h-6 w-6" />
            <span>ShopEase</span>
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/products"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Catalog
            </Link>
            <Link
              href="/database"
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors"
            >
              DBMS Docs
            </Link>
          </div>
        </div>

        {/* Search - Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors duration-150"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account - Desktop */}
          {user ? (
            <div ref={accountMenuRef} className="relative hidden md:block">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <span className="font-medium">{user.firstName}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <Link
                    href="/auth/logout"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-150"
            >
              <User className="h-4 w-4" />
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors duration-150 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-3 px-4 py-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Mobile nav links */}
            <nav className="space-y-1">
              <Link
                href="/products"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </Link>
              <Link
                href="/database"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                DBMS Project Documentation
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/auth/logout"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
