"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Txn = {
  id: number;
  type: "EXPENSE" | "REVENUE";
  category: string;
  amount: string | number;
  notes: string | null;
  date: string;
};

type TypeFilter = "ALL" | "REVENUE" | "EXPENSE";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-as-line bg-as-paper/80 px-3.5 py-2.5 text-sm text-as-ink outline-none transition placeholder:text-stone-400 hover:border-as-leaf/40 focus:border-as-leaf focus:bg-white focus:ring-2 focus:ring-as-leaf/20";

const labelClass = "block text-xs font-medium tracking-wide text-as-moss";

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-as-line/70 ${className}`}
      aria-hidden
    />
  );
}

const emptyForm = {
  type: "EXPENSE" as "EXPENSE" | "REVENUE",
  category: "",
  amount: "",
  notes: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function FinancesPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [summary, setSummary] = useState({
    expenses: 0,
    revenue: 0,
    profit: 0,
  });
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/farm/finances?month=${month}`);
    const data = await res.json();
    if (res.ok) {
      setSummary(data.summary);
      setTxns(data.transactions || []);
    }
    return res.ok;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/farm/finances?month=${month}`);
        const data = await res.json();
        if (!cancelled && res.ok) {
          setSummary(data.summary);
          setTxns(data.transactions || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [month]);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, submitting]);

  function openModal() {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) return;
    setModalOpen(false);
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/farm/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          category: form.category,
          amount: Number(form.amount),
          notes: form.notes || undefined,
          date: form.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Could not add transaction");
        return;
      }
      setModalOpen(false);
      toast.success(
        `${form.type === "REVENUE" ? "Revenue" : "Expense"} recorded`
      );
      await load();
    } catch {
      setFormError("Could not add transaction");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    if (typeFilter === "ALL") return txns;
    return txns.filter((t) => t.type === typeFilter);
  }, [txns, typeFilter]);

  const filters: { id: TypeFilter; label: string }[] = [
    { id: "ALL", label: "All" },
    { id: "REVENUE", label: "Revenue" },
    { id: "EXPENSE", label: "Expense" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-as-ink">
            Finances
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-as-moss/80">
            Expenses, revenue, and profit for your farm.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium tracking-wide text-as-moss">
            Month
            <input
              type="month"
              className={`mt-1.5 block ${fieldClass}`}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={openModal}
            className="mt-5 rounded-full bg-as-forest px-5 py-2.5 text-sm font-medium text-white transition hover:bg-as-moss"
          >
            Add new
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Revenue", value: summary.revenue },
          { label: "Expenses", value: summary.expenses },
          { label: "Profit", value: summary.profit },
        ].map((m) => (
          <div key={m.label} className="border-t-2 border-as-leaf/40 pt-3">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              {m.label}
            </p>
            <p className="mt-1 font-display text-2xl text-as-ink">
              {loading ? "—" : naira(m.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-full border border-as-line bg-white p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                typeFilter === f.id
                  ? "bg-as-forest text-white"
                  : "text-as-moss hover:bg-as-mist"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!loading && (
          <p className="text-xs text-stone-500">
            {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {loading ? (
        <ul className="space-y-2" aria-busy="true" aria-label="Loading transactions">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="rounded-2xl border border-as-line bg-white p-4"
            >
              <div className="flex justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-as-line bg-white/60 px-5 py-10 text-center">
          <p className="font-display text-lg text-as-ink">
            No {typeFilter === "ALL" ? "transactions" : typeFilter.toLowerCase()}{" "}
            this month
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Record income or spending with Add new.
          </p>
          <button
            type="button"
            onClick={openModal}
            className="mt-4 rounded-full border border-as-line px-4 py-2 text-sm text-as-forest hover:bg-white"
          >
            Add new
          </button>
        </section>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-as-line bg-white px-4 py-3.5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
                      t.type === "REVENUE"
                        ? "bg-as-mint/40 text-as-forest"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {t.type === "REVENUE" ? "Revenue" : "Expense"}
                  </span>
                  <p className="font-medium text-as-ink">{t.category}</p>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {new Date(t.date).toLocaleDateString()}
                  {t.notes ? ` · ${t.notes}` : ""}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-medium tabular-nums ${
                  t.type === "REVENUE" ? "text-as-moss" : "text-as-ink"
                }`}
              >
                {t.type === "REVENUE" ? "+" : "−"}
                {naira(Number(t.amount))}
              </p>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-as-ink/35 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finance-modal-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-as-line bg-white p-5 shadow-xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="finance-modal-title"
                  className="font-display text-xl text-as-ink"
                >
                  Add transaction
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Log revenue or an expense for this farm.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-full px-2 py-1 text-sm text-stone-500 hover:bg-as-mist hover:text-as-ink disabled:opacity-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={create} className="space-y-4">
              <fieldset className="space-y-1.5">
                <legend className={labelClass}>Type</legend>
                <div className="flex gap-1.5 rounded-full border border-as-line bg-as-paper/80 p-1">
                  {(
                    [
                      { id: "EXPENSE", label: "Expense" },
                      { id: "REVENUE", label: "Revenue" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, type: opt.id })}
                      className={`flex-1 rounded-full px-3 py-2 text-sm transition ${
                        form.type === opt.id
                          ? "bg-as-forest text-white"
                          : "text-as-moss hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className={labelClass}>
                Category
                <input
                  className={fieldClass}
                  placeholder="e.g. Feed, Eggs sold, Labour"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                  disabled={submitting}
                  autoFocus
                />
              </label>

              <label className={labelClass}>
                Amount (₦)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={fieldClass}
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  required
                  disabled={submitting}
                />
              </label>

              <label className={labelClass}>
                Date
                <input
                  type="date"
                  className={fieldClass}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  disabled={submitting}
                />
              </label>

              <label className={labelClass}>
                Notes{" "}
                <span className="font-normal text-stone-400">(optional)</span>
                <input
                  className={fieldClass}
                  placeholder="Optional details"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={submitting}
                />
              </label>

              {formError && (
                <p className="text-sm text-red-600" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-full border border-as-line px-4 py-2.5 text-sm text-as-forest hover:bg-as-mist disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-as-forest px-5 py-2.5 text-sm font-medium text-white transition hover:bg-as-moss disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
