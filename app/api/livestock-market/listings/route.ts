import { NextRequest, NextResponse } from "next/server";
import { FarmRole, ListingStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess, requireUser } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const mine = req.nextUrl.searchParams.get("mine") === "1";
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const status = req.nextUrl.searchParams.get("status") as ListingStatus | null;

    if (mine) {
      const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
      const listings = await prisma.livestockListing.findMany({
        where: { farmId: user.farmId! },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ listings });
    }

    const listings = await prisma.livestockListing.findMany({
      where: {
        status: status || "ACTIVE",
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { animalType: { contains: q, mode: "insensitive" } },
                { location: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        farm: { select: { name: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ listings });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const listing = await prisma.livestockListing.create({
      data: {
        farmId: user.farmId!,
        title: body.title,
        animalType: body.animalType,
        breed: body.breed,
        quantity: Number(body.quantity),
        age: body.age,
        weight: body.weight,
        price: Number(body.price),
        location: body.location,
        description: body.description,
        photos: body.photos || [],
      },
    });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const listing = await prisma.livestockListing.findFirst({
      where: { id: Number(body.id), farmId: user.farmId! },
    });
    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const updated = await prisma.livestockListing.update({
      where: { id: listing.id },
      data: {
        status: body.status,
        title: body.title,
        quantity: body.quantity != null ? Number(body.quantity) : undefined,
        price: body.price != null ? Number(body.price) : undefined,
      },
    });
    return NextResponse.json({ listing: updated });
  } catch (e) {
    return jsonError(e);
  }
}
