import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PlatformRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, intent } = body as {
      name?: string;
      email?: string;
      password?: string;
      intent?: "farm" | "buyer" | "supplier";
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const platformRole =
      intent === "farm" ? PlatformRole.OWNER : PlatformRole.BUYER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        platformRole,
      },
    });

    if (intent === "supplier") {
      await prisma.supplierProfile.create({
        data: {
          userId: user.id,
          businessName: `${name}'s Supply`,
        },
      });
    }

    await prisma.cart.create({ data: { userId: user.id } });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
