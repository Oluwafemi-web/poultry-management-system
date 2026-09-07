"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const TYPES = [
  "FEED",
  "WATER",
  "MORTALITY",
  "ANIMALS_ADDED",
  "ANIMALS_REMOVED",
  "PRODUCTION",
  "MEDICATION",
  "VACCINATION",
  "WEIGHT",
  "OTHER",
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "FEED",
    batchId: "",
    quantity: "",
    notes: "",
    inventoryItemId: "",
    revenue: "",
  });

  async function load() {
    const [a, l, inv] = await Promise.all([
      fetch("/api/farm/activities").then((r) => r.json()),
      fetch("/api/farm/livestock").then((r) => r.json()),
      fetch("/api/farm/inventory?type=FEED").then((r) => r.json()),
    ]);
    setActivities(a.activities || []);
    const batchList =
      l.species?.flatMap((s: any) =>
        s.categories.flatMap((c: any) =>
          c.batches.map((b: any) => ({
            id: b.id,
            label: `${b.code} (${s.name}/${c.name})`,
          }))
        )
      ) || [];
    setBatches(batchList);
    setInventory(inv.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/farm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          batchId: form.batchId ? Number(form.batchId) : undefined,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          notes: form.notes,
          inventoryItemId: form.inventoryItemId
            ? Number(form.inventoryItemId)
            : undefined,
          payload: form.revenue
            ? { revenue: Number(form.revenue) }
            : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not save activity");
        return;
      }
      toast.success("Activity saved");
      setForm({
        type: "FEED",
        batchId: "",
        quantity: "",
        notes: "",
        inventoryItemId: "",
        revenue: "",
      });
      load();
    } catch {
      toast.error("Could not save activity");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily activities</h1>
        <p className="text-sm text-stone-600">
          Quick entry for feed, mortality, production, and health events.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-xl border bg-white p-4 grid gap-3 sm:grid-cols-2"
      >
        <label className="text-sm">
          Type
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            disabled={submitting}
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Batch (optional)
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.batchId}
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            disabled={submitting}
          >
            <option value="">None</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Quantity
          <input
            type="number"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="e.g. 50"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            disabled={submitting}
          />
        </label>
        {form.type === "FEED" && (
          <label className="text-sm">
            Feed item
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.inventoryItemId}
              onChange={(e) =>
                setForm({ ...form, inventoryItemId: e.target.value })
              }
              disabled={submitting}
            >
              <option value="">Select…</option>
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {form.type === "PRODUCTION" && (
          <label className="text-sm">
            Revenue (₦)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. 15000"
              value={form.revenue}
              onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              disabled={submitting}
            />
          </label>
        )}
        <label className="text-sm sm:col-span-2">
          Notes
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Optional notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            disabled={submitting}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-800 text-white px-4 py-3 text-sm font-medium sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save activity"}
        </button>
      </form>

      <ul className="rounded-xl border bg-white divide-y">
        {activities.map((a) => (
          <li key={a.id} className="p-3 text-sm flex justify-between gap-3">
            <div>
              <p className="font-medium">
                {a.type}
                {a.batch ? ` · ${a.batch.code}` : ""}
              </p>
              <p className="text-stone-500">
                {new Date(a.date).toLocaleString()} · {a.createdBy?.name}
              </p>
              {a.notes && <p className="text-stone-600 mt-1">{a.notes}</p>}
            </div>
            <p className="font-medium">
              {a.quantity != null ? a.quantity : "—"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
