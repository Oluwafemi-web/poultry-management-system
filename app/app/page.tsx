"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FinanceTrendChart,
  type TrendPoint,
} from "@/app/components/AnalyticsCharts";

type Dashboard = {
  totalLivestock: number;
  feedStock: number;
  expenses: number;
  revenue: number;
  profit: number;
  lowStockCount: number;
  animalsAttention: number;
  upcomingVaccinations: number;
  batches: { code: string; currentQty: number; category: { name: string } }[];
  chartSeries: TrendPoint[];
  insight: string;
};

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/farm/dashboard")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed");
        setData(j);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!data) {
    return <p className="text-stone-500">Loading farm overview…</p>;
  }

  const metrics = [
    { label: "Livestock", value: data.totalLivestock.toLocaleString() },
    { label: "Feed stock", value: `${data.feedStock.toLocaleString()} kg` },
    { label: "Revenue", value: naira(data.revenue) },
    { label: "Profit", value: naira(data.profit) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-as-ink">
            Farm board
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-as-moss/80">
            {data.insight}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/app/activities"
            className="rounded-full bg-as-forest px-4 py-2 text-sm font-medium text-white hover:bg-as-moss"
          >
            Log activity
          </Link>
          <Link
            href="/marketplace"
            className="rounded-full border border-as-line px-4 py-2 text-sm text-as-forest hover:bg-white"
          >
            Buy supplies
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="border-t-2 border-as-leaf/40 pt-3">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              {m.label}
            </p>
            <p className="mt-1 font-display text-2xl text-as-ink">{m.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-as-line bg-white p-5 md:p-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-as-ink">
            Revenue vs expenses
          </h2>
          <p className="text-xs text-stone-500">Last 6 months</p>
        </div>
        <FinanceTrendChart data={data.chartSeries} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-as-line bg-white p-5">
          <h2 className="font-display text-lg text-as-ink">Needs attention</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between border-b border-as-mist pb-2">
              <span className="text-stone-600">Low stock items</span>
              <span className="font-medium">{data.lowStockCount}</span>
            </li>
            <li className="flex justify-between border-b border-as-mist pb-2">
              <span className="text-stone-600">Animals needing care</span>
              <span className="font-medium">{data.animalsAttention}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-stone-600">Upcoming vaccinations</span>
              <span className="font-medium">{data.upcomingVaccinations}</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-as-line bg-white p-5">
          <h2 className="font-display text-lg text-as-ink">Recent batches</h2>
          <ul className="mt-3 divide-y divide-as-mist">
            {data.batches.map((b) => (
              <li key={b.code} className="flex justify-between py-2.5 text-sm">
                <span>
                  {b.code} · {b.category.name}
                </span>
                <span className="font-medium">{b.currentQty}</span>
              </li>
            ))}
            {data.batches.length === 0 && (
              <li className="py-2 text-sm text-stone-500">No batches yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
