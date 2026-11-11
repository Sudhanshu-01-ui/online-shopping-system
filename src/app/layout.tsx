import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "ShopEase - Online Shopping System",
  description: "Discover quality products at great prices. Full-stack DBMS e-commerce system built with Next.js and PostgreSQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
