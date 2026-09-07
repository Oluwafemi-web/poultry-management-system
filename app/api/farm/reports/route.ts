import { NextRequest, NextResponse } from "next/server";
import { FarmRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";
import {
  buildMonthlySeries,
  monthsBackStart,
  parseLocalDate,
} from "@/app/lib/finance-charts";

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const fromParam = req.nextUrl.searchParams.get("from");
    const toParam = req.nextUrl.searchParams.get("to");
    const speciesId = req.nextUrl.searchParams.get("speciesId");
    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const batchId = req.nextUrl.searchParams.get("batchId");

    const now = new Date();
    // Match dashboard: default to last 6 calendar months when no range is set.
    const defaultFrom = monthsBackStart(5, now);
    const rangeStart = fromParam
      ? parseLocalDate(fromParam)
      : defaultFrom;
    const rangeEnd = toParam ? parseLocalDate(toParam, true) : now;
    const chartStart = new Date(
      rangeStart.getFullYear(),
      rangeStart.getMonth(),
      1
    );

    const dateFilter = {
      date: {
        gte: rangeStart,
        lte: rangeEnd,
      },
    };

    const batchWhere = {
      farmId: user.farmId!,
      ...(batchId ? { id: Number(batchId) } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(speciesId
        ? { category: { speciesId: Number(speciesId) } }
        : {}),
    };

    const [financials, batches, activities, feedUsage] = await Promise.all([
      prisma.financialTxn.findMany({
        where: { farmId: user.farmId!, ...dateFilter },
      }),
      prisma.livestockBatch.findMany({
        where: batchWhere,
        include: { category: { include: { species: true } } },
      }),
      prisma.activityLog.findMany({
        where: {
          farmId: user.farmId!,
          ...dateFilter,
          ...(batchId ? { batchId: Number(batchId) } : {}),
        },
      }),
      prisma.inventoryTxn.findMany({
        where: {
          type: "USAGE",
          item: { farmId: user.farmId!, type: "FEED" },
          date: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        include: { item: true },
      }),
    ]);

    const expenses = financials
      .filter((f) => f.type === "EXPENSE")
      .reduce((s, f) => s + Number(f.amount), 0);
    const revenue = financials
      .filter((f) => f.type === "REVENUE")
      .reduce((s, f) => s + Number(f.amount), 0);
    const mortality = activities
      .filter((a) => a.type === "MORTALITY")
      .reduce((s, a) => s + Number(a.quantity || 0), 0);
    const population = batches.reduce((s, b) => s + b.currentQty, 0);
    const feedConsumed = feedUsage.reduce((s, t) => s + t.quantity, 0);
    const feedCost = feedUsage.reduce(
      (s, t) => s + t.quantity * Number(t.unitCost ?? t.item.unitCost),
      0
    );

    const byBatch = batches.map((b) => {
      const batchRev = financials
        .filter((f) => f.batchId === b.id && f.type === "REVENUE")
        .reduce((s, f) => s + Number(f.amount), 0);
      const batchExp = financials
        .filter((f) => f.batchId === b.id && f.type === "EXPENSE")
        .reduce((s, f) => s + Number(f.amount), 0);
      return {
        id: b.id,
        code: b.code,
        species: b.category.species.name,
        category: b.category.name,
        population: b.currentQty,
        revenue: batchRev,
        expenses: batchExp,
        profit: batchRev - batchExp,
      };
    });

    const spanMonths =
      (rangeEnd.getFullYear() - chartStart.getFullYear()) * 12 +
      (rangeEnd.getMonth() - chartStart.getMonth());
    const labelWithYear = spanMonths > 11;

    const chartSeries = buildMonthlySeries(
      financials,
      chartStart,
      rangeEnd,
      labelWithYear
    );

    return NextResponse.json({
      financial: { revenue, expenses, profit: revenue - expenses },
      livestock: { population, mortality, batches: byBatch },
      feed: { consumed: feedConsumed, cost: feedCost },
      chartSeries,
      range: {
        from: toIsoDate(rangeStart),
        to: toIsoDate(rangeEnd),
        defaulted: !fromParam && !toParam,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
