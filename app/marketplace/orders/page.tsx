"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/marketplace/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/marketplace" className="text-sm text-emerald-800">
          ← Marketplace
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Purchase history</h1>
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border bg-white p-4">
              <div className="flex justify-between text-sm">
                <p className="font-medium">Order #{o.id}</p>
                <p>{o.status}</p>
              </div>
              <p className="text-stone-600 text-sm mt-1">
                {new Date(o.createdAt).toLocaleString()} · {naira(o.total)}
              </p>
              <ul className="mt-2 text-sm text-stone-700">
                {o.items.map((i: any) => (
                  <li key={i.id}>
                    {i.product.name} × {i.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {!orders.length && (
            <li className="text-stone-500 text-sm">No orders yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
