"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const TYPES = [
  "FEED",
  "WATER",
  "MORTALITY",
  "PRODUCTION",
  "MEDICATION",
  "VACCINATION",
  "WEIGHT",
  "OTHER",
];

export default function WorkerActivitiesPage() {
  const params = useSearchParams();
  const [batches, setBatches] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: params.get("type") || "FEED",
    batchId: "",
    quantity: "",
    notes: "",
    inventoryItemId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/farm/livestock").then((r) => r.json()),
      fetch("/api/farm/inventory?type=FEED").then((r) => r.json()),
    ]).then(([l, inv]) => {
      const batchList =
        l.species?.flatMap((s: any) =>
          s.categories.flatMap((c: any) =>
            c.batches.map((b: any) => ({
              id: b.id,
              label: `${b.code}`,
            }))
          )
        ) || [];
      setBatches(batchList);
      setInventory(inv.items || []);
    });
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not save activity");
        return;
      }
      toast.success("Activity saved");
      setForm({ ...form, quantity: "", notes: "" });
    } catch {
      toast.error("Could not save activity");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-emerald-950 text-white px-4 py-4 flex justify-between">
        <Link href="/worker">← Back</Link>
        <span className="font-medium">Log activity</span>
        <span />
      </div>
      <form onSubmit={submit} className="p-4 max-w-lg mx-auto space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            className="mt-1 w-full rounded-xl border px-4 py-3 text-base"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            disabled={submitting}
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Batch</span>
          <select
            className="mt-1 w-full rounded-xl border px-4 py-3 text-base"
            value={form.batchId}
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            disabled={submitting}
          >
            <option value="">Optional</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Quantity</span>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-3 text-base"
            placeholder="e.g. 50"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            disabled={submitting}
          />
        </label>
        {form.type === "FEED" && (
          <label className="block">
            <span className="text-sm font-medium">Feed item</span>
            <select
              className="mt-1 w-full rounded-xl border px-4 py-3 text-base"
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
        <label className="block">
          <span className="text-sm font-medium">Notes</span>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-3 text-base"
            placeholder="Optional notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            disabled={submitting}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-emerald-800 text-white py-4 text-lg font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
