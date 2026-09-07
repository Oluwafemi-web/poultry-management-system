"use client";

import { FormEvent, useEffect, useState } from "react";

type Item = {
  id: number;
  type: string;
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  unitCost: string | number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    type: "FEED",
    name: "",
    unit: "kg",
    quantity: 0,
    lowStockThreshold: 50,
    unitCost: 0,
  });
  const [txn, setTxn] = useState({
    itemId: "",
    txnType: "USAGE",
    quantity: 0,
  });

  async function load() {
    const q = filter ? `?type=${filter}` : "";
    const res = await fetch(`/api/farm/inventory${q}`);
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function createItem(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/farm/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, name: "", quantity: 0 });
    load();
  }

  async function adjust(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/farm/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: Number(txn.itemId),
        txnType: txn.txnType,
        quantity: Number(txn.quantity),
      }),
    });
    setTxn({ itemId: "", txnType: "USAGE", quantity: 0 });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-stone-600">
          Track feed, medicine, equipment, and stock levels.
        </p>
      </div>

      <div className="flex gap-2">
        {["", "FEED", "MEDICINE", "EQUIPMENT", "OTHER"].map((t) => (
          <button
            key={t || "all"}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-sm border ${
              filter === t ? "bg-emerald-800 text-white" : ""
            }`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-left">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const low = i.quantity <= i.lowStockThreshold;
              return (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2">{i.name}</td>
                  <td className="px-4 py-2">{i.type}</td>
                  <td className="px-4 py-2">
                    {i.quantity} {i.unit}
                  </td>
                  <td className="px-4 py-2">
                    <span className={low ? "text-amber-700 font-medium" : "text-emerald-700"}>
                      {low ? "Low" : "Good"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={createItem} className="rounded-xl border bg-white p-4 space-y-3">
          <h2 className="font-medium">Add item</h2>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {["FEED", "MEDICINE", "EQUIPMENT", "OTHER"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="Unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
            <input
              type="number"
              className="rounded-lg border px-3 py-2"
              placeholder="Qty"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
          </div>
          <button className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm">
            Save
          </button>
        </form>

        <form onSubmit={adjust} className="rounded-xl border bg-white p-4 space-y-3">
          <h2 className="font-medium">Record usage / purchase</h2>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={txn.itemId}
            onChange={(e) => setTxn({ ...txn, itemId: e.target.value })}
            required
          >
            <option value="">Select item…</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={txn.txnType}
            onChange={(e) => setTxn({ ...txn, txnType: e.target.value })}
          >
            <option value="USAGE">Usage</option>
            <option value="PURCHASE">Purchase</option>
            <option value="ADJUSTMENT">Adjustment (+)</option>
          </select>
          <input
            type="number"
            className="w-full rounded-lg border px-3 py-2"
            value={txn.quantity}
            onChange={(e) =>
              setTxn({ ...txn, quantity: Number(e.target.value) })
            }
            required
          />
          <button className="rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm">
            Apply
          </button>
        </form>
      </div>
    </div>
  );
}
