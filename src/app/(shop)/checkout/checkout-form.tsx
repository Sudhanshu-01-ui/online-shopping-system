"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/orders";
import { addAddress } from "@/lib/actions/addresses";
import { useToast } from "@/components/ui/toast";
import { Plus, CreditCard, Building, Smartphone, Banknote, ShieldCheck, MapPin } from "lucide-react";

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

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string | number;
  };
}

export function CheckoutForm({
  items,
  addresses: initialAddresses,
}: {
  items: CartItem[];
  addresses: Address[];
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);

  // Address form state
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(newAddress).forEach(([k, v]) => fd.set(k, v));
    fd.set("isDefault", addresses.length === 0 ? "true" : "false");

    const res = await addAddress(fd);
    if (res.success && res.data) {
      setAddresses([...addresses, res.data]);
      setSelectedAddressId(res.data.id);
      setShowAddressForm(false);
      addToast("Address added!", "success");
    } else {
      addToast(res.error || "Failed to add address", "error");
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      addToast("Please select a delivery address", "error");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("addressId", selectedAddressId);
      fd.set("paymentMethod", paymentMethod);
      if (notes) fd.set("notes", notes);

      const res = await createOrder(fd);
      if (res.success && res.data) {
        addToast("Order placed successfully!", "success");
        router.push(`/account/orders/${res.data.id}`);
      } else {
        addToast(res.error || "Failed to place order", "error");
      }
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-6">
        {/* Step 1: Address */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              1. Delivery Address
            </h2>
            {!showAddressForm && (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add New
              </button>
            )}
          </div>

          {showAddressForm ? (
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Address Line 1</label>
                <input
                  required
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <input
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code</label>
                  <input
                    required
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Address</Button>
                {addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? "border-indigo-600 bg-indigo-50/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold uppercase text-slate-500">{addr.label}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{addr.fullName}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Phone: {addr.phone}</p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Payment Method */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            2. Payment Method
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { id: "UPI", label: "UPI / QR Code", icon: Smartphone },
              { id: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
              { id: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
              { id: "NET_BANKING", label: "Net Banking", icon: Building },
              { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Banknote },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-indigo-600 bg-indigo-50/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <Icon className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">{method.label}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>Demo Payment:</strong> This is an academic project. No real payment will be processed.
            </span>
          </div>
        </div>

        {/* Order Notes */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Order Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions for delivery..."
            rows={2}
            className="w-full rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4 sticky top-24">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="py-2 flex justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-900 truncate max-w-[180px]">
                    {item.product.name}
                  </p>
                  <p className="text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-base text-slate-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            loading={loading}
            disabled={!selectedAddressId || loading}
            className="w-full"
            size="lg"
          >
            Place Order ({formatPrice(total)})
          </Button>
        </div>
      </div>
    </div>
  );
}
