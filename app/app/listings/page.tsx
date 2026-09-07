"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

const emptyForm = {
  title: "",
  animalType: "",
  breed: "",
  quantity: "",
  age: "",
  weight: "",
  price: "",
  location: "",
  description: "",
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sellingId, setSellingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/livestock-market/listings?mine=1");
    const data = await res.json();
    if (res.ok) setListings(data.listings);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/livestock-market/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not publish listing");
        return;
      }
      toast.success("Listing published");
      setForm(emptyForm);
      load();
    } catch {
      toast.error("Could not publish listing");
    } finally {
      setSubmitting(false);
    }
  }

  async function markSold(id: number) {
    setSellingId(id);
    try {
      const res = await fetch("/api/livestock-market/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "SOLD" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not update listing");
        return;
      }
      toast.success("Marked as sold");
      load();
    } catch {
      toast.error("Could not update listing");
    } finally {
      setSellingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My listings</h1>
        <p className="text-sm text-stone-600">
          Sell livestock and farm products on the marketplace.
        </p>
      </div>

      <form
        onSubmit={create}
        className="rounded-xl border bg-white p-4 grid gap-3 md:grid-cols-2"
      >
        <input
          className="rounded-lg border px-3 py-2 md:col-span-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          disabled={submitting}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Animal type (e.g. Chicken)"
          value={form.animalType}
          onChange={(e) => setForm({ ...form, animalType: e.target.value })}
          required
          disabled={submitting}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Breed"
          value={form.breed}
          onChange={(e) => setForm({ ...form, breed: e.target.value })}
          disabled={submitting}
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
          disabled={submitting}
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2"
          placeholder="Price (₦)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          disabled={submitting}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          disabled={submitting}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          disabled={submitting}
        />
        <textarea
          className="rounded-lg border px-3 py-2 md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Publishing…" : "Publish listing"}
        </button>
      </form>

      <ul className="rounded-xl border bg-white divide-y">
        {listings.map((l) => (
          <li key={l.id} className="p-4 flex justify-between gap-3">
            <div>
              <p className="font-medium">
                {l.title} · {l.status}
              </p>
              <p className="text-sm text-stone-600">
                {l.quantity} · {naira(l.price)}
              </p>
            </div>
            {l.status === "ACTIVE" && (
              <button
                onClick={() => markSold(l.id)}
                disabled={sellingId !== null}
                className="text-sm rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sellingId === l.id ? "Updating…" : "Mark sold"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
