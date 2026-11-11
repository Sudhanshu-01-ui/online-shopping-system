import { requireAuth } from "@/lib/auth";
import { getAddresses } from "@/lib/actions/addresses";
import { AddressManager } from "./address-manager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddressesPage() {
  await requireAuth();
  const res = await getAddresses();
  const addresses = res.success && res.data ? res.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your delivery addresses for seamless checkout
        </p>
      </div>

      <AddressManager initialAddresses={addresses} />
    </div>
  );
}

