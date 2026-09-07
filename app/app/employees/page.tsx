"use client";

import { FormEvent, useEffect, useState } from "react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    roleTitle: "Farm Worker",
    wage: 50000,
    contact: "",
    email: "",
    password: "",
  });

  async function load() {
    const res = await fetch("/api/farm/employees");
    const data = await res.json();
    if (res.ok) setEmployees(data.employees);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/farm/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      name: "",
      roleTitle: "Farm Worker",
      wage: 50000,
      contact: "",
      email: "",
      password: "",
    });
    load();
  }

  async function pay(id: number) {
    await fetch("/api/farm/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: id, action: "pay" }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p className="text-sm text-stone-600">
          Manage workers, wages, and payment history.
        </p>
      </div>

      <form
        onSubmit={create}
        className="rounded-xl border bg-white p-4 grid gap-3 md:grid-cols-2"
      >
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Role"
          value={form.roleTitle}
          onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
          required
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2"
          placeholder="Wage"
          value={form.wage}
          onChange={(e) => setForm({ ...form, wage: Number(e.target.value) })}
          required
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Contact"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Login email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Temp password (optional)"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="md:col-span-2 w-fit rounded-lg bg-emerald-800 text-white px-4 py-2 text-sm">
          Add employee
        </button>
      </form>

      <ul className="rounded-xl border bg-white divide-y">
        {employees.map((emp) => (
          <li key={emp.id} className="p-4 flex justify-between gap-4 items-start">
            <div>
              <p className="font-medium">
                {emp.name} · {emp.roleTitle}
              </p>
              <p className="text-sm text-stone-600">
                ₦{Number(emp.wage).toLocaleString()} / {emp.wageFrequency}
              </p>
              {emp.payments?.[0] && (
                <p className="text-xs text-stone-500 mt-1">
                  Last paid{" "}
                  {new Date(emp.payments[0].paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => pay(emp.id)}
              className="text-sm rounded-lg border px-3 py-1.5"
            >
              Record payment
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
