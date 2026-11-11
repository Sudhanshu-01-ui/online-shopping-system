"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { addAddress, deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { Plus, Trash2, CheckCircle2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("isDefault", addresses.length === 0 ? "true" : "false");

    try {
      const res = await addAddress(formData);
      if (res.success && res.data) {
        setAddresses([...addresses, res.data]);
        setShowForm(false);
        addToast("Address added successfully!", "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to add address", "error");
      }
    } catch {
      addToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const res = await deleteAddress(id);
    if (res.success) {
      setAddresses(addresses.filter((a) => a.id !== id));
      addToast("Address removed", "info");
      router.refresh();
    } else {
      addToast(res.error || "Failed to delete address", "error");
    }
  }

  async function handleSetDefault(id: string) {
    const res = await setDefaultAddress(id);
    if (res.success) {
      setAddresses(
        addresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      addToast("Default address updated", "success");
      router.refresh();
    } else {
      addToast(res.error || "Failed to set default", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          You have {addresses.length} saved address{addresses.length === 1 ? "" : "es"}.
        </p>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4" />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Add New Address</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Address Label (e.g., Home, Office)
                </label>
                <Input name="label" defaultValue="Home" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <Input name="fullName" placeholder="Rahul Sharma" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <Input name="phone" placeholder="+91 9876543210" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  PIN Code (6 digits)
                </label>
                <Input name="pincode" placeholder="560001" maxLength={6} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Address Line 1 (Flat, House no., Building, Company)
              </label>
              <Input name="addressLine1" placeholder="42, 3rd Cross, Indiranagar" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Address Line 2 (Area, Colony, Street, Landmark)
              </label>
              <Input name="addressLine2" placeholder="Near Metro Station" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City
                </label>
                <Input name="city" placeholder="Bengaluru" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  State
                </label>
                <Input name="state" placeholder="Karnataka" required />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={loading} size="sm">
                Save Address
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <MapPin className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-base font-semibold text-slate-900">No saved addresses</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add your delivery address to speed up checkout.
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-4" size="sm">
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`flex flex-col justify-between rounded-xl border p-5 bg-white shadow-sm transition-colors ${
                addr.isDefault ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 uppercase">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-xs font-medium text-indigo-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Default
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{addr.fullName}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                  <br />
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-slate-500 mt-2">Phone: {addr.phone}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

