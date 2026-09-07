"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = {
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
};

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`;
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #d5e3db",
  background: "#fff",
  boxShadow: "0 8px 24px rgba(12, 26, 18, 0.08)",
};

export function FinanceTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-500">
        No financial activity in this period yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="asRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d8b65" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3d8b65" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="asExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a227" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#c9a227" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8f0eb" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5c6f64", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5c6f64", fontSize: 12 }}
            tickFormatter={(v) =>
              v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
            }
            width={42}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              naira(Number(value ?? 0)),
              name === "revenue"
                ? "Revenue"
                : name === "expenses"
                  ? "Expenses"
                  : "Profit",
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#1f5c40"
            strokeWidth={2.5}
            fill="url(#asRevenue)"
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#c9a227"
            strokeWidth={2.5}
            fill="url(#asExpenses)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProfitBarChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-stone-500">
        No profit data to chart yet.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e8f0eb" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5c6f64", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5c6f64", fontSize: 12 }}
            tickFormatter={(v) =>
              v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
            }
            width={42}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [naira(Number(value ?? 0)), "Profit"]}
          />
          <Bar
            dataKey="profit"
            name="Profit"
            fill="#3d8b65"
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type BatchBarPoint = {
  label: string;
  population: number;
  profit: number;
};

export function LivestockBarChart({ data }: { data: BatchBarPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-stone-500">
        No livestock batches to chart yet.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e8f0eb" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5c6f64", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5c6f64", fontSize: 12 }}
            width={36}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              name === "population"
                ? Number(value ?? 0).toLocaleString()
                : naira(Number(value ?? 0)),
              name === "population" ? "Animals" : "Profit",
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 12 }}
          />
          <Bar
            dataKey="population"
            name="Population"
            fill="#1f5c40"
            radius={[8, 8, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
