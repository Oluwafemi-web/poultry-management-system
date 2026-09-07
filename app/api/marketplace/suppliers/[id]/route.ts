import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { jsonError } from "@/app/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: Number(id) },
      include: {
        products: { where: { active: true } },
        user: { select: { name: true, email: true } },
      },
    });
    if (!supplier) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ supplier });
  } catch (e) {
    return jsonError(e);
  }
}
