"use client";

import { FormEvent, useEffect, useState } from "react";

type Payment = {
  id: number;
  amount: string | number;
  paidAt: string;
};

type Employee = {
  id: number;
  name: string;
  roleTitle: string;
  wage: string | number;
  wageFrequency: string;
  contact: string | null;
  payments?: Payment[];
};

const fieldClass =
  "w-full rounded-xl border border-as-line bg-as-paper/80 px-3.5 py-2.5 text-sm text-as-ink outline-none transition placeholder:text-stone-400 hover:border-as-leaf/40 focus:border-as-leaf focus:bg-white focus:ring-2 focus:ring-as-leaf/20";

function naira(n: number | string) {
  return `₦${Number(n).toLocaleString()}`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-as-line/70 ${className}`}
      aria-hidden
    />
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    roleTitle: "",
    wage: "" as number | "",
    contact: "",
    email: "",
    password: "",
  });

  async function load() {
    const res = await fetch("/api/farm/employees");
    const data = await res.json();
    if (res.ok) setEmployees(data.employees || []);
    return res.ok;
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

  async function create(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/farm/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: data.error || "Could not add employee",
        });
        return;
      }
      setForm({
        name: "",
        roleTitle: "",
        wage: "",
        contact: "",
        email: "",
        password: "",
      });
      setMessage({
        type: "ok",
        text: `${data.employee?.name || "Employee"} added`,
      });
      await load();
    } catch {
      setMessage({ type: "err", text: "Could not add employee" });
    } finally {
      setSubmitting(false);
    }
  }

  async function pay(emp: Employee) {
    setMessage(null);
    setPayingId(emp.id);
    try {
      const res = await fetch("/api/farm/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: emp.id, action: "pay" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: data.error || "Could not record payment",
        });
        return;
      }
      const amount = data.payment?.amount ?? emp.wage;
      setMessage({
        type: "ok",
        text: `Paid ${naira(amount)} to ${emp.name}`,
      });
      await load();
    } catch {
      setMessage({ type: "err", text: "Could not record payment" });
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-as-ink">
          Employees
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-as-moss/80">
          Manage workers, wages, and payment history.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            message.type === "ok"
              ? "border-as-mint/60 bg-as-mint/20 text-as-forest"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <form
        onSubmit={create}
        className="rounded-2xl border border-as-line bg-white p-5 md:p-6"
      >
        <div className="mb-5">
          <h2 className="font-display text-lg text-as-ink">Add employee</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Optional login lets them sign in as a worker.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-medium tracking-wide text-as-moss">
            Name
            <input
              className={`mt-1.5 ${fieldClass}`}
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={submitting}
            />
          </label>
          <label className="block text-xs font-medium tracking-wide text-as-moss">
            Role
            <input
              className={`mt-1.5 ${fieldClass}`}
              placeholder="e.g. Manager, Farm hand"
              value={form.roleTitle}
              onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
              required
              disabled={submitting}
            />
          </label>
          <label className="block text-xs font-medium tracking-wide text-as-moss">
            Monthly wage (₦)
            <input
              type="number"
              min={0}
              className={`mt-1.5 ${fieldClass}`}
              placeholder="0"
              value={form.wage}
              onChange={(e) =>
                setForm({
                  ...form,
                  wage: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              required
              disabled={submitting}
            />
          </label>
          <label className="block text-xs font-medium tracking-wide text-as-moss">
            Contact{" "}
            <span className="font-normal text-stone-400">(optional)</span>
            <input
              className={`mt-1.5 ${fieldClass}`}
              placeholder="Phone or WhatsApp"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              disabled={submitting}
            />
          </label>
          <label className="block text-xs font-medium tracking-wide text-as-moss">
            Login email{" "}
            <span className="font-normal text-stone-400">(optional)</span>
            <input
              type="email"
              className={`mt-1.5 ${fieldClass}`}
              placeholder="worker@farm.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={submitting}
            />
          </label>
          <label className="block text-xs font-medium tracking-wide text-as-moss">
            Temp password{" "}
            <span className="font-normal text-stone-400">(optional)</span>
            <input
              className={`mt-1.5 ${fieldClass}`}
              placeholder="Set if creating a login"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={submitting}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-full bg-as-forest px-5 py-2.5 text-sm font-medium text-white transition hover:bg-as-moss disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add employee"}
        </button>
      </form>

      {loading ? (
        <ul
          className="space-y-2"
          aria-busy="true"
          aria-label="Loading employees"
        >
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="rounded-2xl border border-as-line bg-white p-4"
            >
              <div className="flex justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : employees.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-as-line bg-white/60 px-5 py-10 text-center">
          <p className="font-display text-lg text-as-ink">No employees yet</p>
          <p className="mt-1 text-sm text-stone-500">
            Add your first worker above to start tracking wages.
          </p>
        </section>
      ) : (
        <ul className="space-y-2">
          {employees.map((emp) => {
            const last = emp.payments?.[0];
            const isPaying = payingId === emp.id;
            return (
              <li
                key={emp.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-as-line bg-white p-4"
              >
                <div>
                  <p className="font-medium text-as-ink">
                    {emp.name}{" "}
                    <span className="font-normal text-stone-500">
                      · {emp.roleTitle}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-as-moss">
                    {naira(emp.wage)}{" "}
                    <span className="text-stone-500">
                      / {emp.wageFrequency.toLowerCase()}
                    </span>
                  </p>
                  {last ? (
                    <p className="mt-1 text-xs text-stone-500">
                      Last paid {naira(last.amount)} ·{" "}
                      {new Date(last.paidAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-stone-400">No payments yet</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => pay(emp)}
                  disabled={payingId !== null}
                  className="rounded-full border border-as-line bg-as-paper/80 px-4 py-2 text-sm text-as-forest transition hover:border-as-leaf/50 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPaying ? "Recording…" : "Record payment"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
