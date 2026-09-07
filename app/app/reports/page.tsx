"use client";

import { useEffect, useState } from "react";
import {
  FinanceTrendChart,
  LivestockBarChart,
  ProfitBarChart,
  type TrendPoint,
} from "@/app/components/AnalyticsCharts";

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Same default window as the farm dashboard chart (last 6 calendar months). */
function defaultRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { from: toIsoDate(from), to: toIsoDate(now) };
}

type Report = {
  financial: { revenue: number; expenses: number; profit: number };
  livestock: {
    population: number;
    mortality: number;
    batches: {
      id: number;
      code: string;
      species: string;
      category: string;
      population: number;
      profit: number;
    }[];
  };
  feed: { consumed: number; cost: number };
  chartSeries: TrendPoint[];
  range?: { from: string; to: string; defaulted: boolean };
};

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(nextFrom = from, nextTo = to) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextFrom) params.set("from", nextFrom);
      if (nextTo) params.set("to", nextTo);
      const res = await fetch(`/api/farm/reports?${params}`);
      const data = await res.json();
      if (res.ok) setReport(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const { from: initialFrom, to: initialTo } = defaultRange();
    setFrom(initialFrom);
    setTo(initialTo);
    void load(initialFrom, initialTo);
  }, []);

  const livestockBars =
    report?.livestock.batches.map((b) => ({
      label: b.code,
      population: b.population,
      profit: b.profit,
    })) ?? [];

  const insight = report
    ? report.financial.profit >= 0
      ? `Net profit ${naira(report.financial.profit)} across this range — revenue is clearing expenses.`
      : `You're ${naira(Math.abs(report.financial.profit))} underwater in this range — check feed and mortality costs.`
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-as-ink">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-as-moss/80">
          Financial, livestock, and feed summaries with live charts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-sm text-as-moss">
          From
          <input
            type="date"
            className="mt-1 block rounded-xl border border-as-line bg-white px-3 py-2 outline-none focus:border-as-leaf focus:ring-2 focus:ring-as-leaf/20"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm text-as-moss">
          To
          <input
            type="date"
            className="mt-1 block rounded-xl border border-as-line bg-white px-3 py-2 outline-none focus:border-as-leaf focus:ring-2 focus:ring-as-leaf/20"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="rounded-full bg-as-forest px-4 py-2 text-sm font-medium text-white hover:bg-as-moss disabled:opacity-60"
        >
          {loading ? "Loading…" : "Apply"}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = defaultRange();
            setFrom(next.from);
            setTo(next.to);
            load(next.from, next.to);
          }}
          className="rounded-full border border-as-line px-4 py-2 text-sm text-as-forest hover:bg-white"
        >
          Last 6 months
        </button>
      </div>

      {!report ? (
        <p className="text-stone-500">Loading…</p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-as-moss/90">{insight}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Revenue", report.financial.revenue],
              ["Expenses", report.financial.expenses],
              ["Profit", report.financial.profit],
            ].map(([label, value]) => (
              <div key={label as string} className="border-t-2 border-as-leaf/40 pt-3">
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  {label}
                </p>
                <p className="mt-1 font-display text-2xl">
                  {naira(value as number)}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-as-line bg-white p-5 md:p-6">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg text-as-ink">
                Monthly revenue & expenses
              </h2>
              <p className="text-xs text-stone-500">
                {from && to
                  ? `${new Date(from + "T12:00:00").toLocaleString("en", { month: "short", year: "numeric" })} – ${new Date(to + "T12:00:00").toLocaleString("en", { month: "short", year: "numeric" })}`
                  : "Selected range"}
              </p>
            </div>
            <p className="text-xs text-stone-500">
              Hover a month for exact amounts.
            </p>
            <div className="mt-4">
              <FinanceTrendChart data={report.chartSeries} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-as-line bg-white p-5">
              <h2 className="font-display text-lg text-as-ink">Monthly profit</h2>
              <div className="mt-3">
                <ProfitBarChart data={report.chartSeries} />
              </div>
            </section>

            <section className="rounded-2xl border border-as-line bg-white p-5">
              <h2 className="font-display text-lg text-as-ink">
                Livestock by batch
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Population {report.livestock.population} · Mortality{" "}
                {report.livestock.mortality}
              </p>
              <div className="mt-3">
                <LivestockBarChart data={livestockBars} />
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-as-line bg-white p-5">
            <h2 className="font-display text-lg text-as-ink">Feed report</h2>
            <p className="mt-2 text-sm text-stone-600">
              Consumed: {report.feed.consumed} · Cost: {naira(report.feed.cost)}
            </p>
          </section>

          <section className="rounded-2xl border border-as-line bg-white p-5">
            <h2 className="font-display text-lg text-as-ink">Batch detail</h2>
            <ul className="mt-3 divide-y divide-as-mist text-sm">
              {report.livestock.batches.map((b) => (
                <li key={b.id} className="flex justify-between py-2">
                  <span>
                    {b.code} · {b.species}/{b.category}
                  </span>
                  <span>
                    {b.population} · P/L {naira(b.profit)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
