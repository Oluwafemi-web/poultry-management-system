import { NextRequest, NextResponse } from "next/server";
import { FarmRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess, requireUser } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const listingId = Number(req.nextUrl.searchParams.get("listingId"));
    const user = await requireUser();

    const inquiries = await prisma.listingInquiry.findMany({
      where: {
        listingId: listingId || undefined,
        OR: [
          { buyerId: Number(user.id) },
          {
            listing: {
              farm: {
                memberships: {
                  some: {
                    userId: Number(user.id),
                    role: { in: [FarmRole.OWNER, FarmRole.MANAGER] },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true } } },
        },
        listing: true,
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ inquiries });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    if (body.messageId == null && body.inquiryId && body.body) {
      const inquiry = await prisma.listingInquiry.findUnique({
        where: { id: Number(body.inquiryId) },
        include: { listing: { include: { farm: { include: { memberships: true } } } } },
      });
      if (!inquiry) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const isBuyer = inquiry.buyerId === Number(user.id);
      const isSeller = inquiry.listing.farm.memberships.some(
        (m) =>
          m.userId === Number(user.id) &&
          (m.role === FarmRole.OWNER || m.role === FarmRole.MANAGER)
      );
      if (!isBuyer && !isSeller) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const message = await prisma.listingInquiryMessage.create({
        data: {
          inquiryId: inquiry.id,
          senderId: Number(user.id),
          body: body.body,
        },
      });
      return NextResponse.json({ message }, { status: 201 });
    }

    const { listingId, subject, body: messageBody } = body;
    const listing = await prisma.livestockListing.findUnique({
      where: { id: Number(listingId) },
    });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const inquiry = await prisma.listingInquiry.create({
      data: {
        listingId: listing.id,
        buyerId: Number(user.id),
        subject: subject || `Inquiry about ${listing.title}`,
        messages: {
          create: {
            senderId: Number(user.id),
            body: messageBody || "I'm interested in this listing.",
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
