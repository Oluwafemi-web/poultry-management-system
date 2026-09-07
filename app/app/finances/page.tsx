"use client";

import { FormEvent, useEffect, useState } from "react";

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function FinancesPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState({
    expenses: 0,
    revenue: 0,
    profit: 0,
  });
  const [txns, setTxns] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: "EXPENSE",
    category: "Feed",
    amount: "",
    notes: "",
  });

  async function load() {
    const res = await fetch(`/api/farm/finances?month=${month}`);
    const data = await res.json();
    if (res.ok) {
      setSummary(data.summary);
      setTxns(data.transactions);
    }
  }

  useEffect(() => {
    load();
  }, [month]);

  async function create(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/farm/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });
    setForm({ ...form, amount: "", notes: "" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Finances</h1>
          <p className="text-sm text-stone-600">
            Expenses, revenue, and profit for your farm.
          </p>
        </div>
        <input
          type="month"
          className="rounded-lg border px-3 py-2"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Revenue", summary.revenue],
          ["Expenses", summary.expenses],
          ["Profit", summary.profit],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="text-2xl font-semibold mt-1">{naira(value as number)}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={create}
        className="rounded-xl border bg-white p-4 grid gap-3 md:grid-cols-4"
      >
        <select
          className="rounded-lg border px-3 py-2"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="EXPENSE">Expense</option>
          <option value="REVENUE">Revenue</option>
        </select>
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <button className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm">
          Add
        </button>
      </form>

      <ul className="rounded-xl border bg-white divide-y">
        {txns.map((t) => (
          <li key={t.id} className="p-3 text-sm flex justify-between">
            <div>
              <p className="font-medium">
                {t.type} · {t.category}
              </p>
              <p className="text-stone-500">
                {new Date(t.date).toLocaleDateString()} {t.notes || ""}
              </p>
            </div>
            <p
              className={
                t.type === "REVENUE" ? "text-emerald-700 font-medium" : "font-medium"
              }
            >
              {naira(Number(t.amount))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
