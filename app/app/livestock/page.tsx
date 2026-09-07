"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-as-line bg-as-paper/80 px-3.5 py-2.5 text-sm text-as-ink outline-none transition placeholder:text-stone-400 hover:border-as-leaf/40 focus:border-as-leaf focus:bg-white focus:ring-2 focus:ring-as-leaf/20";

const labelClass = "block text-xs font-medium tracking-wide text-as-moss";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-as-line/70 ${className}`}
      aria-hidden
    />
  );
}

function LivestockSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading livestock">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-t-2 border-as-line pt-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-16" />
          </div>
        ))}
      </div>
      {[0, 1].map((i) => (
        <section
          key={i}
          className="rounded-2xl border border-as-line bg-white p-5 md:p-6"
        >
          <Skeleton className="h-6 w-28" />
          <div className="mt-6 space-y-5">
            {[0, 1].map((j) => (
              <div key={j}>
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="mt-3 space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function occupancyTone(ratio: number) {
  if (ratio >= 0.95) return "bg-as-gold/80";
  if (ratio >= 0.7) return "bg-as-leaf";
  return "bg-as-moss";
}

export default function LivestockPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [code, setCode] = useState("");
  const [initialQty, setInitialQty] = useState(100);
  const [arrivalDate, setArrivalDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [breed, setBreed] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function load() {
    const res = await fetch("/api/farm/livestock");
    const data = await res.json();
    if (res.ok) setSpecies(data.species || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
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
        setMessage({ type: "err", text: data.error || "Could not create batch" });
        return;
      }
      setCode("");
      setBreed("");
      setMessage({ type: "ok", text: "Batch created" });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions = species.flatMap((s) =>
    s.categories.map((c) => ({
      id: c.id,
      label: `${s.name} · ${c.name}`,
    }))
  );

  const stats = useMemo(() => {
    let headcount = 0;
    let batches = 0;
    for (const s of species) {
      for (const c of s.categories) {
        batches += c.batches.length;
        for (const b of c.batches) headcount += b.currentQty;
      }
    }
    return { headcount, batches, species: species.length };
  }, [species]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-as-ink">
          Livestock
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-as-moss/80">
          Track batches by species and category — headcount, arrival, and housing
          at a glance.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="rounded-2xl border border-as-line bg-white p-5 md:p-6"
      >
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-lg text-as-ink">New batch</h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Record animals when they arrive on the farm.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Category
            <select
              className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231f5c40'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loading || categoryOptions.length === 0}
            >
              <option value="">
                {loading
                  ? "Loading categories…"
                  : categoryOptions.length === 0
                    ? "No categories yet"
                    : "Choose category"}
              </option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Batch code
            <input
              className={fieldClass}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. BR-002"
              required
            />
          </label>

          <label className={labelClass}>
            Initial quantity
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={initialQty}
              onChange={(e) => setInitialQty(Number(e.target.value))}
              required
            />
          </label>

          <label className={labelClass}>
            Arrival date
            <input
              type="date"
              className={fieldClass}
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              required
            />
          </label>

          <label className={`${labelClass} md:col-span-2`}>
            Breed{" "}
            <span className="font-normal text-stone-400">(optional)</span>
            <input
              className={fieldClass}
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Cobb 500, Isa Brown"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting || categoryOptions.length === 0}
            className="rounded-full bg-as-forest px-5 py-2.5 text-sm font-medium text-white transition hover:bg-as-moss disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create batch"}
          </button>
          {message && (
            <p
              className={`text-sm ${
                message.type === "ok" ? "text-as-moss" : "text-red-600"
              }`}
              role="status"
            >
              {message.text}
            </p>
          )}
        </div>
      </form>

      {loading ? (
        <LivestockSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "On farm",
                value: stats.headcount.toLocaleString(),
              },
              {
                label: "Active batches",
                value: stats.batches.toLocaleString(),
              },
              {
                label: "Species",
                value: stats.species.toLocaleString(),
              },
            ].map((m) => (
              <div key={m.label} className="border-t-2 border-as-leaf/40 pt-3">
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  {m.label}
                </p>
                <p className="mt-1 font-display text-2xl text-as-ink">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {species.length === 0 && (
            <section className="rounded-2xl border border-dashed border-as-line bg-white/60 px-5 py-10 text-center">
              <p className="font-display text-lg text-as-ink">No livestock yet</p>
              <p className="mt-1 text-sm text-stone-500">
                Finish onboarding categories, then create your first batch above.
              </p>
            </section>
          )}

          {species.map((s) => {
            const speciesTotal = s.categories.reduce(
              (sum, c) =>
                sum + c.batches.reduce((n, b) => n + b.currentQty, 0),
              0
            );
            return (
              <section
                key={s.id}
                className="rounded-2xl border border-as-line bg-white p-5 md:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg text-as-ink">{s.name}</h2>
                  <p className="text-xs text-stone-500">
                    {speciesTotal.toLocaleString()} animals
                  </p>
                </div>

                <div className="mt-5 space-y-6">
                  {s.categories.map((c) => {
                    const categoryTotal = c.batches.reduce(
                      (sum, b) => sum + b.currentQty,
                      0
                    );
                    return (
                      <div key={c.id}>
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-as-forest">
                            {c.name}
                          </p>
                          <p className="text-xs tabular-nums text-stone-500">
                            {categoryTotal.toLocaleString()} total
                          </p>
                        </div>

                        {c.batches.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-as-mist bg-as-paper/50 px-4 py-3 text-sm text-stone-500">
                            No batches in this category
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {c.batches.map((b) => {
                              const ratio =
                                b.initialQty > 0
                                  ? Math.min(1, b.currentQty / b.initialQty)
                                  : 0;
                              const pct = Math.round(ratio * 100);
                              return (
                                <li
                                  key={b.id}
                                  className="rounded-xl border border-as-mist bg-as-paper/40 px-4 py-3 transition hover:border-as-line hover:bg-white"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-medium text-as-ink">
                                        {b.code}
                                      </p>
                                      <p className="mt-0.5 text-xs text-stone-500">
                                        Arrived{" "}
                                        {new Date(
                                          b.arrivalDate
                                        ).toLocaleDateString()}
                                        {b.location ? ` · ${b.location}` : ""}
                                        {b.avgWeight != null
                                          ? ` · ${b.avgWeight} kg avg`
                                          : ""}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium tabular-nums text-as-ink">
                                        {b.currentQty.toLocaleString()}
                                        <span className="font-normal text-stone-400">
                                          {" "}
                                          / {b.initialQty.toLocaleString()}
                                        </span>
                                      </p>
                                      <p className="text-xs text-stone-500">
                                        {pct}% remaining
                                      </p>
                                    </div>
                                  </div>
                                  <div
                                    className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-as-line/60"
                                    title={`${pct}% of initial stock`}
                                  >
                                    <div
                                      className={`h-full rounded-full transition-all ${occupancyTone(ratio)}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
