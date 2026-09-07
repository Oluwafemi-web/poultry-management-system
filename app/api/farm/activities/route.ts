import { NextRequest, NextResponse } from "next/server";
import { ActivityType, FarmRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireFarmAccess();
    const limit = Number(req.nextUrl.searchParams.get("limit") || 50);
    const activities = await prisma.activityLog.findMany({
      where: { farmId: user.farmId! },
      include: {
        batch: { include: { category: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
    });
    return NextResponse.json({ activities });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFarmAccess([
      FarmRole.OWNER,
      FarmRole.MANAGER,
      FarmRole.WORKER,
    ]);
    const body = await req.json();
    const { type, batchId, quantity, unit, notes, payload, date, inventoryItemId } =
      body as {
        type: ActivityType;
        batchId?: number;
        quantity?: number;
        unit?: string;
        notes?: string;
        payload?: Record<string, unknown>;
        date?: string;
        inventoryItemId?: number;
      };

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const activity = await prisma.$transaction(async (tx) => {
      const log = await tx.activityLog.create({
        data: {
          farmId: user.farmId!,
          batchId: batchId ? Number(batchId) : null,
          type,
          quantity: quantity != null ? Number(quantity) : null,
          unit,
          notes,
          payload: (payload as object) ?? undefined,
          date: date ? new Date(date) : new Date(),
          createdById: Number(user.id),
        },
      });

      if (batchId && quantity != null) {
        const batch = await tx.livestockBatch.findFirst({
          where: { id: Number(batchId), farmId: user.farmId! },
        });
        if (batch) {
          let currentQty = batch.currentQty;
          if (type === "MORTALITY" || type === "ANIMALS_REMOVED") {
            currentQty = Math.max(0, currentQty - Number(quantity));
          } else if (type === "ANIMALS_ADDED") {
            currentQty += Number(quantity);
          }
          await tx.livestockBatch.update({
            where: { id: batch.id },
            data: { currentQty },
          });
        }
      }

      if (type === "FEED" && inventoryItemId && quantity != null) {
        const item = await tx.inventoryItem.findFirst({
          where: { id: Number(inventoryItemId), farmId: user.farmId! },
        });
        if (item) {
          await tx.inventoryItem.update({
            where: { id: item.id },
            data: { quantity: Math.max(0, item.quantity - Number(quantity)) },
          });
          await tx.inventoryTxn.create({
            data: {
              itemId: item.id,
              type: "USAGE",
              quantity: Number(quantity),
              notes: notes || "Feed activity",
            },
          });
        }
      }

      if (type === "PRODUCTION" && payload?.revenue) {
        await tx.financialTxn.create({
          data: {
            farmId: user.farmId!,
            type: "REVENUE",
            category: "Production",
            amount: Number(payload.revenue),
            notes: notes || "Production revenue",
            sourceType: "ActivityLog",
            sourceId: log.id,
            batchId: batchId ? Number(batchId) : null,
          },
        });
      }

      return log;
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
