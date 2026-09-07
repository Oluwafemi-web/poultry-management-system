import { NextRequest, NextResponse } from "next/server";
import { FarmRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const speciesId = req.nextUrl.searchParams.get("speciesId");
    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const batchId = req.nextUrl.searchParams.get("batchId");

    const dateFilter =
      from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {};

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
          ...(from || to
            ? {
                date: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {}),
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

    const monthMap = new Map<
      string,
      { label: string; revenue: number; expenses: number; profit: number; sort: number }
    >();
    for (const f of financials) {
      const d = new Date(f.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          label: d.toLocaleString("en", { month: "short", year: "2-digit" }),
          revenue: 0,
          expenses: 0,
          profit: 0,
          sort: d.getFullYear() * 100 + d.getMonth(),
        });
      }
      const bucket = monthMap.get(key)!;
      const amount = Number(f.amount);
      if (f.type === "REVENUE") bucket.revenue += amount;
      else bucket.expenses += amount;
      bucket.profit = bucket.revenue - bucket.expenses;
    }
    const chartSeries = Array.from(monthMap.values())
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, revenue, expenses, profit }) => ({
        label,
        revenue,
        expenses,
        profit,
      }));

    return NextResponse.json({
      financial: { revenue, expenses, profit: revenue - expenses },
      livestock: { population, mortality, batches: byBatch },
      feed: { consumed: feedConsumed, cost: feedCost },
      chartSeries,
    });
  } catch (e) {
    return jsonError(e);
  }
}
