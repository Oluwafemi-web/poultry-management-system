import { NextRequest, NextResponse } from "next/server";
import { FarmRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";
import {
  buildMonthlySeries,
  monthsBackStart,
} from "@/app/lib/finance-charts";

export async function GET() {
  try {
    const user = await requireFarmAccess();
    const now = new Date();
    const trendStart = monthsBackStart(5, now);

    const [batches, inventory, financials, lowStock, upcomingHealth, trendTxns] =
      await Promise.all([
        prisma.livestockBatch.findMany({
          where: { farmId: user.farmId! },
          include: { category: { include: { species: true } } },
        }),
        prisma.inventoryItem.findMany({ where: { farmId: user.farmId! } }),
        prisma.financialTxn.findMany({
          where: {
            farmId: user.farmId!,
            date: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        }),
        prisma.inventoryItem.findMany({
          where: { farmId: user.farmId! },
        }),
        prisma.activityLog.findMany({
          where: {
            farmId: user.farmId!,
            type: { in: ["VACCINATION", "MEDICATION"] },
            date: { gte: now },
          },
          take: 5,
          orderBy: { date: "asc" },
        }),
        prisma.financialTxn.findMany({
          where: {
            farmId: user.farmId!,
            date: { gte: trendStart },
          },
          orderBy: { date: "asc" },
        }),
      ]);

    const totalLivestock = batches.reduce((s, b) => s + b.currentQty, 0);
    const feedStock = inventory
      .filter((i) => i.type === "FEED")
      .reduce((s, i) => s + i.quantity, 0);
    const expenses = financials
      .filter((f) => f.type === "EXPENSE")
      .reduce((s, f) => s + Number(f.amount), 0);
    const revenue = financials
      .filter((f) => f.type === "REVENUE")
      .reduce((s, f) => s + Number(f.amount), 0);
    const lowStockItems = lowStock.filter(
      (i) => i.quantity <= i.lowStockThreshold
    );

    const chartSeries = buildMonthlySeries(trendTxns, trendStart, now);

    const prev = chartSeries[chartSeries.length - 2];
    const curr = chartSeries[chartSeries.length - 1];
    let insight = "Track revenue and expenses as activity lands this month.";
    if (curr) {
      if (prev && prev.profit !== 0) {
        const delta =
          ((curr.profit - prev.profit) / Math.abs(prev.profit)) * 100;
        const dir = delta >= 0 ? "up" : "down";
        const tail =
          delta >= 0
            ? curr.profit >= 0
              ? "you're ahead"
              : "losses are shrinking"
            : curr.profit >= 0
              ? "behind last month"
              : "costs are outrunning sales";
        insight = `Profit is ${dir} ${Math.abs(delta).toFixed(0)}% vs last month — ${tail}.`;
      } else if (curr.revenue > 0 || curr.expenses > 0) {
        insight = `This month: ₦${curr.revenue.toLocaleString()} in, ₦${curr.expenses.toLocaleString()} out.`;
      }
    }

    return NextResponse.json({
      totalLivestock,
      feedStock,
      expenses,
      revenue,
      profit: revenue - expenses,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      animalsAttention: batches.filter(
        (b) => b.healthStatus && b.healthStatus !== "Healthy"
      ).length,
      upcomingVaccinations: upcomingHealth.length,
      batches: batches.slice(0, 5),
      chartSeries,
      insight,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(_req: NextRequest) {
  try {
    await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
