import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { jsonError, requireUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: Number(user.id) },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(_req: NextRequest) {
  try {
    const user = await requireUser();
    const cart = await prisma.cart.findUnique({
      where: { userId: Number(user.id) },
      include: { items: { include: { product: true } } },
    });
    if (!cart?.items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cart.items.reduce(
      (s, i) => s + Number(i.product.price) * i.quantity,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          userId: Number(user.id),
          total,
          status: "CONFIRMED",
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Insufficient")) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return jsonError(e);
  }
}
