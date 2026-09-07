import { NextRequest, NextResponse } from "next/server";
import { FarmRole, FinancialType } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireFarmAccess([
      FarmRole.OWNER,
      FarmRole.MANAGER,
    ]);
    const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
    let dateFilter = {};
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFilter = {
        date: {
          gte: new Date(y, m - 1, 1),
          lt: new Date(y, m, 1),
        },
      };
    }

    const txns = await prisma.financialTxn.findMany({
      where: { farmId: user.farmId!, ...dateFilter },
      orderBy: { date: "desc" },
    });

    const expenses = txns
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + Number(t.amount), 0);
    const revenue = txns
      .filter((t) => t.type === "REVENUE")
      .reduce((s, t) => s + Number(t.amount), 0);

    return NextResponse.json({
      transactions: txns,
      summary: {
        expenses,
        revenue,
        profit: revenue - expenses,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const { type, category, amount, notes, date, batchId } = body as {
      type: FinancialType;
      category: string;
      amount: number;
      notes?: string;
      date?: string;
      batchId?: number;
    };

    if (!type || !category || amount == null) {
      return NextResponse.json(
        { error: "type, category, and amount are required" },
        { status: 400 }
      );
    }

    const txn = await prisma.financialTxn.create({
      data: {
        farmId: user.farmId!,
        type,
        category,
        amount: Number(amount),
        notes,
        date: date ? new Date(date) : new Date(),
        batchId: batchId ? Number(batchId) : null,
      },
    });

    return NextResponse.json({ transaction: txn }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
