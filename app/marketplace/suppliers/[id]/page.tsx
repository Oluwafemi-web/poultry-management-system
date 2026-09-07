"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function SupplierPage() {
  const params = useParams();
  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/marketplace/suppliers/${params.id}`)
      .then((r) => r.json())
      .then((d) => setSupplier(d.supplier));
  }, [params.id]);

  if (!supplier) return <p className="p-8 text-stone-500">Loading…</p>;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/marketplace" className="text-sm text-emerald-800">
          ← Marketplace
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">{supplier.businessName}</h1>
        <p className="text-sm text-stone-600 mt-1">
          {supplier.location} · ★ {supplier.rating} · {supplier.contact}
        </p>
        <p className="mt-3 text-stone-700">{supplier.description}</p>
        <h2 className="mt-6 font-medium">Products</h2>
        <ul className="mt-2 space-y-2">
          {supplier.products.map((p: any) => (
            <li key={p.id} className="rounded-lg border bg-white p-3 text-sm">
              <p className="font-medium">{p.name}</p>
              <p>
                {naira(p.price)} / {p.unit} · Stock {p.stock}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
