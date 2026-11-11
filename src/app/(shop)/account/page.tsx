import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "./profile-form";
import Link from "next/link";
import { Package, MapPin, User, ArrowRight } from "lucide-react";

export default async function AccountPage() {
  const sessionUser = await requireAuth();

  const customer = await prisma.customer.findUnique({
    where: { id: sessionUser.userId },
    include: {
      _count: {
        select: {
          orders: true,
          addresses: true,
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, view orders, and manage delivery addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <Link
          href="/account"
          className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 transition-colors hover:bg-indigo-50"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Profile Details</p>
              <p className="text-xs text-slate-500">Edit personal information</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-600" />
        </Link>

        <Link
          href="/account/orders"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">My Orders</p>
              <p className="text-xs text-slate-500">{customer._count.orders} orders placed</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          href="/account/addresses"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Saved Addresses</p>
              <p className="text-xs text-slate-500">{customer._count.addresses} saved addresses</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Details</h2>
        <ProfileForm user={customer} />
      </div>
    </div>
  );
}

