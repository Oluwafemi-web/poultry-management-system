import { NextRequest, NextResponse } from "next/server";
import { FarmRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireFarmAccess();
    const species = await prisma.animalSpecies.findMany({
      where: { farmId: user.farmId! },
      include: {
        categories: {
          include: {
            batches: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });
    return NextResponse.json({ species });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const {
      categoryId,
      code,
      breed,
      initialQty,
      arrivalDate,
      location,
      avgWeight,
      metadata,
    } = body;

    if (!categoryId || !code || initialQty == null || !arrivalDate) {
      return NextResponse.json(
        { error: "categoryId, code, initialQty, arrivalDate required" },
        { status: 400 }
      );
    }

    const category = await prisma.animalCategory.findFirst({
      where: {
        id: Number(categoryId),
        species: { farmId: user.farmId! },
      },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const batch = await prisma.livestockBatch.create({
      data: {
        farmId: user.farmId!,
        categoryId: Number(categoryId),
        code,
        breed,
        initialQty: Number(initialQty),
        currentQty: Number(initialQty),
        arrivalDate: new Date(arrivalDate),
        location,
        avgWeight: avgWeight != null ? Number(avgWeight) : null,
        metadata: metadata ?? undefined,
      },
      include: { category: { include: { species: true } } },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
