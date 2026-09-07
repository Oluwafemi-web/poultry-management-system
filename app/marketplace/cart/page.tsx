"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/marketplace/cart");
    const data = await res.json();
    if (res.ok) {
      setCart(data.cart);
      setTotal(data.total);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(productId: number) {
    setRemovingId(productId);
    try {
      const res = await fetch(`/api/marketplace/cart?productId=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Could not remove item");
        return;
      }
      toast.success("Item removed");
      load();
    } catch {
      toast.error("Could not remove item");
    } finally {
      setRemovingId(null);
    }
  }

  async function checkout() {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/marketplace/orders", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Checkout failed");
        return;
      }
      toast.success(`Order #${data.order.id} confirmed`);
      load();
    } catch {
      toast.error("Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/marketplace" className="text-sm text-emerald-800">
          ← Back to marketplace
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Cart</h1>
        <ul className="mt-4 rounded-xl border bg-white divide-y">
          {cart?.items?.map((i: any) => (
            <li key={i.id} className="p-4 flex justify-between gap-3">
              <div>
                <p className="font-medium">{i.product.name}</p>
                <p className="text-sm text-stone-600">
                  Qty {i.quantity} · {naira(i.product.price)} each
                </p>
              </div>
              <button
                onClick={() => remove(i.productId)}
                disabled={removingId !== null || checkingOut}
                className="text-sm text-red-700 disabled:opacity-60"
              >
                {removingId === i.productId ? "Removing…" : "Remove"}
              </button>
            </li>
          ))}
          {!cart?.items?.length && (
            <li className="p-4 text-stone-500 text-sm">Your cart is empty.</li>
          )}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-semibold">Total: {naira(total)}</p>
          <button
            onClick={checkout}
            disabled={!cart?.items?.length || checkingOut}
            className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm disabled:opacity-50"
          >
            {checkingOut ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}
