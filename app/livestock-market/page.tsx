"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function LivestockMarketPage() {
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/livestock-market/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function inquire(listingId: number) {
    if (!session?.user) {
      setMessage("Sign in to contact the seller");
      return;
    }
    const res = await fetch("/api/livestock-market/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        body: "Hello, I'm interested in this listing. Is it still available?",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed");
      return;
    }
    setMessage("Inquiry sent to the seller");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex justify-between">
          <Link href="/" className="font-display tracking-tight text-as-forest">
            AgroSolve Livestock Market
          </Link>
          <div className="flex gap-3 text-sm">
            <Link href="/marketplace">Supplies</Link>
            {session?.user?.farmId && (
              <Link href="/app/listings">My listings</Link>
            )}
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Livestock & farm products</h1>
        <div className="mt-4 flex gap-2">
          <input
            className="rounded-lg border px-3 py-2 flex-1"
            placeholder="Search by animal, location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={load}
            className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm"
          >
            Search
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-emerald-800">{message}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {listings.map((l) => (
            <article key={l.id} className="rounded-xl border bg-white p-4">
              <h2 className="font-medium">{l.title}</h2>
              <p className="text-sm text-stone-600 mt-1">
                {l.animalType}
                {l.breed ? ` · ${l.breed}` : ""} · Qty {l.quantity}
                {l.age ? ` · ${l.age}` : ""}
              </p>
              <p className="mt-2 text-lg font-semibold">{naira(l.price)}</p>
              <p className="text-xs text-stone-500 mt-1">
                {l.location || l.farm?.location} · {l.farm?.name}
              </p>
              <p className="text-sm mt-2 text-stone-700">{l.description}</p>
              <button
                onClick={() => inquire(l.id)}
                className="mt-3 rounded-lg border px-3 py-1.5 text-sm"
              >
                Contact seller
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
