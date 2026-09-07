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
};

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<Report | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/farm/reports?${params}`);
    const data = await res.json();
    if (res.ok) setReport(data);
  }

  useEffect(() => {
    load();
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
        <label className="text-sm">
          From
          <input
            type="date"
            className="mt-1 block rounded-xl border border-as-line bg-white px-3 py-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          To
          <input
            type="date"
            className="mt-1 block rounded-xl border border-as-line bg-white px-3 py-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          onClick={load}
          className="rounded-full bg-as-forest px-4 py-2 text-sm font-medium text-white hover:bg-as-moss"
        >
          Apply
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
            <h2 className="font-display text-lg text-as-ink">
              Monthly revenue & expenses
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Interactive — hover a month for exact amounts.
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
