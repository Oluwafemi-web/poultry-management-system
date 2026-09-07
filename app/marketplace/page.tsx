"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const res = await fetch(`/api/marketplace/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function loadCart() {
    if (!session?.user) return;
    const res = await fetch("/api/marketplace/cart");
    if (!res.ok) return;
    const data = await res.json();
    setCartCount(data.cart?.items?.length || 0);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadCart();
  }, [session]);

  async function addToCart(productId: number) {
    if (!session?.user) {
      setMessage("Sign in to add items to cart");
      return;
    }
    const res = await fetch("/api/marketplace/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (res.ok) {
      setMessage("Added to cart");
      loadCart();
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-display text-lg tracking-tight text-as-forest">
              AgroSolve
            </Link>
            <p className="text-xs text-stone-500">Agricultural marketplace</p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/livestock-market">Livestock market</Link>
            <Link href="/marketplace/cart">Cart ({cartCount})</Link>
            <Link href="/marketplace/orders">Orders</Link>
            {session?.user ? (
              <Link href={session.user.farmId ? "/app" : "/onboarding"}>
                My farm
              </Link>
            ) : (
              <Link href="/signin">Sign in</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Buy farm supplies</h1>
        <p className="text-sm text-stone-600 mt-1">
          Feed, medicine, equipment, and services from verified suppliers.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className="rounded-lg border px-3 py-2 flex-1 min-w-[200px]"
            placeholder="Search products…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {[
              "FEED",
              "MEDICINE",
              "SUPPLEMENTS",
              "EQUIPMENT",
              "TOOLS",
              "SERVICES",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={loadProducts}
            className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm"
          >
            Search
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-emerald-800">{message}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border bg-white p-4 flex flex-col"
            >
              <p className="text-xs uppercase text-stone-500">{p.category}</p>
              <h2 className="mt-1 font-medium">{p.name}</h2>
              <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                {p.description}
              </p>
              <p className="mt-3 text-lg font-semibold">
                {naira(p.price)}
                <span className="text-sm font-normal text-stone-500">
                  {" "}
                  / {p.unit}
                </span>
              </p>
              <Link
                href={`/marketplace/suppliers/${p.supplier.id}`}
                className="text-xs text-emerald-800 mt-1"
              >
                {p.supplier.businessName} · ★ {p.supplier.rating}
              </Link>
              <button
                onClick={() => addToCart(p.id)}
                className="mt-4 rounded-lg bg-emerald-800 text-white px-3 py-2 text-sm"
              >
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
