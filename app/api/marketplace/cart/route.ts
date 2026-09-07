import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { jsonError, requireUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    let cart = await prisma.cart.findUnique({
      where: { userId: Number(user.id) },
      include: {
        items: {
          include: {
            product: { include: { supplier: true } },
          },
        },
      },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: Number(user.id) },
        include: {
          items: {
            include: {
              product: { include: { supplier: true } },
            },
          },
        },
      });
    }
    const total = cart.items.reduce(
      (s, i) => s + Number(i.product.price) * i.quantity,
      0
    );
    return NextResponse.json({ cart, total });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { productId, quantity } = await req.json();
    let cart = await prisma.cart.findUnique({
      where: { userId: Number(user.id) },
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: Number(user.id) } });
    }

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: Number(productId),
        },
      },
      create: {
        cartId: cart.id,
        productId: Number(productId),
        quantity: Number(quantity || 1),
      },
      update: {
        quantity: { increment: Number(quantity || 1) },
      },
    });

    return NextResponse.json({ item });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const productId = Number(req.nextUrl.searchParams.get("productId"));
    const cart = await prisma.cart.findUnique({
      where: { userId: Number(user.id) },
    });
    if (!cart) return NextResponse.json({ ok: true });
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
