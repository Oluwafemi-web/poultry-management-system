import { NextRequest, NextResponse } from "next/server";
import { FarmRole, InventoryTxnType } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireFarmAccess();
    const type = req.nextUrl.searchParams.get("type");
    const items = await prisma.inventoryItem.findMany({
      where: {
        farmId: user.farmId!,
        ...(type ? { type: type as never } : {}),
      },
      include: {
        transactions: { orderBy: { date: "desc" }, take: 5 },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const {
      type,
      name,
      unit,
      quantity,
      lowStockThreshold,
      unitCost,
      supplier,
      txnType,
    } = body;

    if (!type || !name) {
      return NextResponse.json(
        { error: "type and name are required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity || 0);
    const cost = Number(unitCost || 0);

    const item = await prisma.inventoryItem.create({
      data: {
        farmId: user.farmId!,
        type,
        name,
        unit: unit || "kg",
        quantity: qty,
        lowStockThreshold: Number(lowStockThreshold || 0),
        unitCost: cost,
        supplier,
        transactions:
          qty > 0
            ? {
                create: {
                  type: (txnType as InventoryTxnType) || "PURCHASE",
                  quantity: qty,
                  unitCost: cost,
                },
              }
            : undefined,
      },
    });

    if (qty > 0 && cost > 0) {
      await prisma.financialTxn.create({
        data: {
          farmId: user.farmId!,
          type: "EXPENSE",
          category: type === "FEED" ? "Feed" : type === "MEDICINE" ? "Medicine" : "Inventory",
          amount: qty * cost,
          notes: `Purchase: ${name}`,
          sourceType: "InventoryItem",
          sourceId: item.id,
        },
      });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireFarmAccess([
      FarmRole.OWNER,
      FarmRole.MANAGER,
      FarmRole.WORKER,
    ]);
    const body = await req.json();
    const { itemId, txnType, quantity, unitCost, notes } = body;

    const item = await prisma.inventoryItem.findFirst({
      where: { id: Number(itemId), farmId: user.farmId! },
    });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const qty = Number(quantity);
    let newQty = item.quantity;
    if (txnType === "PURCHASE" || txnType === "ADJUSTMENT") {
      newQty += qty;
    } else if (txnType === "USAGE") {
      newQty -= qty;
    }

    const [updated] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: item.id },
        data: { quantity: newQty },
      }),
      prisma.inventoryTxn.create({
        data: {
          itemId: item.id,
          type: txnType,
          quantity: qty,
          unitCost: unitCost != null ? Number(unitCost) : item.unitCost,
          notes,
        },
      }),
    ]);

    if (txnType === "PURCHASE" && unitCost != null) {
      await prisma.financialTxn.create({
        data: {
          farmId: user.farmId!,
          type: "EXPENSE",
          category: item.type === "FEED" ? "Feed" : "Inventory",
          amount: qty * Number(unitCost),
          notes: `Purchase: ${item.name}`,
          sourceType: "InventoryTxn",
          sourceId: item.id,
        },
      });
    }

    return NextResponse.json({ item: updated });
  } catch (e) {
    return jsonError(e);
  }
}
