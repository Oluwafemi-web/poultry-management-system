import type { FinancialType } from "@prisma/client";

export type TrendTxn = {
  date: Date;
  type: FinancialType;
  amount: unknown;
};

export type TrendPoint = {
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(d: Date, withYear = false) {
  return d.toLocaleString("en", {
    month: "short",
    ...(withYear ? { year: "2-digit" } : {}),
  });
}

/** Local calendar date from YYYY-MM-DD (avoids UTC midnight skew). */
export function parseLocalDate(iso: string, endOfDay = false) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return new Date(iso);
  if (endOfDay) return new Date(y, m - 1, d, 23, 59, 59, 999);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** First day of the month, `monthsBack` months before `now` (0 = this month). */
export function monthsBackStart(monthsBack: number, now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
}

/**
 * Build a continuous monthly series (zero-filled) from `start` through `endMonth`
 * (inclusive of the month containing `endMonth`).
 */
export function buildMonthlySeries(
  txns: TrendTxn[],
  start: Date,
  endMonth: Date = new Date(),
  labelWithYear = false
): TrendPoint[] {
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);

  const trendMap = new Map<
    string,
    { label: string; revenue: number; expenses: number; profit: number }
  >();

  const cursor = new Date(startMonth);
  while (cursor <= last) {
    const key = monthKey(cursor);
    trendMap.set(key, {
      label: monthLabel(cursor, labelWithYear),
      revenue: 0,
      expenses: 0,
      profit: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const t of txns) {
    const key = monthKey(new Date(t.date));
    const bucket = trendMap.get(key);
    if (!bucket) continue;
    const amount = Number(t.amount);
    if (t.type === "REVENUE") bucket.revenue += amount;
    else bucket.expenses += amount;
    bucket.profit = bucket.revenue - bucket.expenses;
  }

  return Array.from(trendMap.values());
}
