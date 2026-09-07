import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth-options";
import prisma from "@/app/lib/prisma";
import { requireUser, jsonError } from "@/app/lib/auth";

/** Refresh JWT farm context after onboarding */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const farmId = body.farmId ? Number(body.farmId) : null;

    const membership = await prisma.farmMembership.findFirst({
      where: {
        userId: Number(user.id),
        ...(farmId ? { farmId } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: {
        farm: { include: { modules: true } },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "No farm membership" }, { status: 404 });
    }

    const modules = membership.farm.modules
      .filter((m) => m.enabled)
      .map((m) => m.module);

    return NextResponse.json({
      farmId: membership.farmId,
      farmRole: membership.role,
      modules,
      onboarded: membership.farm.onboarded,
      platformRole: "OWNER",
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(session.user);
}
