import { NextRequest, NextResponse } from "next/server";
import { ProductCategory } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireUser } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const category = req.nextUrl.searchParams.get("category");
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category: category as ProductCategory } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            location: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: Number(user.id) },
    });
    if (!supplier) {
      return NextResponse.json(
        { error: "Create a supplier profile first" },
        { status: 403 }
      );
    }
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        supplierId: supplier.id,
        name: body.name,
        category: body.category,
        description: body.description,
        price: Number(body.price),
        unit: body.unit || "unit",
        stock: Number(body.stock || 0),
        imageUrl: body.imageUrl,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
