"use client";

import { FormEvent, useEffect, useState } from "react";

type Species = {
  id: number;
  name: string;
  categories: {
    id: number;
    name: string;
    batches: {
      id: number;
      code: string;
      currentQty: number;
      initialQty: number;
      arrivalDate: string;
      avgWeight: number | null;
      location: string | null;
    }[];
  }[];
};

export default function LivestockPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [code, setCode] = useState("");
  const [initialQty, setInitialQty] = useState(100);
  const [arrivalDate, setArrivalDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [breed, setBreed] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/farm/livestock");
    const data = await res.json();
    if (res.ok) setSpecies(data.species || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/farm/livestock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: Number(categoryId),
        code,
        breed,
        initialQty,
        arrivalDate,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed");
      return;
    }
    setCode("");
    setMessage("Batch created");
    load();
  }

  const categoryOptions = species.flatMap((s) =>
    s.categories.map((c) => ({
      id: c.id,
      label: `${s.name} · ${c.name}`,
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Livestock</h1>
        <p className="text-sm text-stone-600">
          Manage animals by your configured categories and batches.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="rounded-xl bg-white border p-4 grid gap-3 md:grid-cols-2"
      >
        <h2 className="md:col-span-2 font-medium">New batch</h2>
        <label className="text-sm">
          Category
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Batch code
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BR-002"
            required
          />
        </label>
        <label className="text-sm">
          Initial quantity
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={initialQty}
            onChange={(e) => setInitialQty(Number(e.target.value))}
            required
          />
        </label>
        <label className="text-sm">
          Arrival date
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            required
          />
        </label>
        <label className="text-sm md:col-span-2">
          Breed
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </label>
        <button className="md:col-span-2 rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm w-fit">
          Create batch
        </button>
        {message && <p className="md:col-span-2 text-sm text-stone-600">{message}</p>}
      </form>

      <div className="space-y-6">
        {species.map((s) => (
          <section key={s.id} className="rounded-xl bg-white border p-4">
            <h2 className="text-lg font-medium">{s.name}</h2>
            {s.categories.map((c) => (
              <div key={c.id} className="mt-4">
                <p className="text-sm font-medium text-stone-700">
                  {c.name} —{" "}
                  {c.batches.reduce((sum, b) => sum + b.currentQty, 0)}
                </p>
                <ul className="mt-2 divide-y text-sm">
                  {c.batches.map((b) => (
                    <li key={b.id} className="py-2 flex justify-between gap-4">
                      <div>
                        <p className="font-medium">{b.code}</p>
                        <p className="text-stone-500">
                          Arrived {new Date(b.arrivalDate).toLocaleDateString()}
                          {b.location ? ` · ${b.location}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>
                          {b.currentQty} / {b.initialQty}
                        </p>
                        {b.avgWeight != null && (
                          <p className="text-stone-500">{b.avgWeight} kg avg</p>
                        )}
                      </div>
                    </li>
                  ))}
                  {c.batches.length === 0 && (
                    <li className="py-2 text-stone-500">No batches</li>
                  )}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
