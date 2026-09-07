import { NextRequest, NextResponse } from "next/server";
import { FarmRole, WageFrequency } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { jsonError, requireFarmAccess } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireFarmAccess([
      FarmRole.OWNER,
      FarmRole.MANAGER,
    ]);
    const employees = await prisma.employee.findMany({
      where: { farmId: user.farmId! },
      include: {
        payments: { orderBy: { paidAt: "desc" }, take: 5 },
        user: { select: { id: true, email: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ employees });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const {
      name,
      roleTitle,
      contact,
      wage,
      wageFrequency,
      responsibilities,
      startDate,
      email,
      password,
    } = body;

    if (!name || !roleTitle || wage == null) {
      return NextResponse.json(
        { error: "name, roleTitle, and wage are required" },
        { status: 400 }
      );
    }

    let linkedUserId: number | undefined;
    if (email && password) {
      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash(password, 10);
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        linkedUserId = existing.id;
        await prisma.farmMembership.upsert({
          where: {
            userId_farmId: { userId: existing.id, farmId: user.farmId! },
          },
          create: {
            userId: existing.id,
            farmId: user.farmId!,
            role: FarmRole.WORKER,
          },
          update: { role: FarmRole.WORKER },
        });
      } else {
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashed,
            platformRole: "WORKER",
            memberships: {
              create: { farmId: user.farmId!, role: FarmRole.WORKER },
            },
          },
        });
        linkedUserId = newUser.id;
      }
    }

    const employee = await prisma.employee.create({
      data: {
        farmId: user.farmId!,
        userId: linkedUserId,
        name,
        roleTitle,
        contact,
        wage: Number(wage),
        wageFrequency: (wageFrequency as WageFrequency) || "MONTHLY",
        responsibilities,
        startDate: startDate ? new Date(startDate) : new Date(),
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);
    const body = await req.json();
    const { employeeId, amount, notes, action } = body;

    const employee = await prisma.employee.findFirst({
      where: { id: Number(employeeId), farmId: user.farmId! },
    });
    if (!employee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (action === "pay") {
      const payment = await prisma.wagePayment.create({
        data: {
          employeeId: employee.id,
          amount: Number(amount ?? employee.wage),
          notes,
        },
      });
      await prisma.financialTxn.create({
        data: {
          farmId: user.farmId!,
          type: "EXPENSE",
          category: "Labour",
          amount: Number(amount ?? employee.wage),
          notes: `Wage: ${employee.name}`,
          sourceType: "WagePayment",
          sourceId: payment.id,
        },
      });
      return NextResponse.json({ payment });
    }

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        isActive: body.isActive ?? employee.isActive,
        wage: body.wage != null ? Number(body.wage) : undefined,
        roleTitle: body.roleTitle,
        contact: body.contact,
        responsibilities: body.responsibilities,
      },
    });
    return NextResponse.json({ employee: updated });
  } catch (e) {
    return jsonError(e);
  }
}
