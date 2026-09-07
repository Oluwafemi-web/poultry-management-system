"use client";

import { FormEvent, useEffect, useState } from "react";

function naira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    animalType: "Chicken",
    breed: "",
    quantity: 100,
    age: "",
    weight: "",
    price: 4000,
    location: "",
    description: "",
  });

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
    await fetch("/api/livestock-market/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, title: "", description: "" });
    load();
  }

  async function markSold(id: number) {
    await fetch("/api/livestock-market/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "SOLD" }),
    });
    load();
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
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Animal type"
          value={form.animalType}
          onChange={(e) => setForm({ ...form, animalType: e.target.value })}
          required
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Breed"
          value={form.breed}
          onChange={(e) => setForm({ ...form, breed: e.target.value })}
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
          required
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <textarea
          className="rounded-lg border px-3 py-2 md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="w-fit rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm">
          Publish listing
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
                className="text-sm rounded-lg border px-3 py-1.5"
              >
                Mark sold
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
