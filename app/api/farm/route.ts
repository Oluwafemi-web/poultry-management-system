import { NextRequest, NextResponse } from "next/server";
import { FarmRole, ModuleKey } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { AuthError, jsonError, requireUser } from "@/app/lib/auth";
import { DEFAULT_MODULES, SPECIES_PRESETS } from "@/app/lib/constants";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.farmId) {
      return NextResponse.json({ farm: null });
    }
    const farm = await prisma.farm.findUnique({
      where: { id: user.farmId },
      include: {
        modules: true,
        species: { include: { categories: true } },
        customFields: true,
        memberships: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    return NextResponse.json({ farm, farmRole: user.farmRole });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const {
      name,
      farmTypes,
      location,
      size,
      workerCount,
      description,
      species,
      modules,
      customFields,
    } = body as {
      name: string;
      farmTypes: string[];
      location?: string;
      size?: string;
      workerCount?: number;
      description?: string;
      species: { name: string; categories: string[] }[];
      modules?: string[];
      customFields?: {
        entity: string;
        key: string;
        label: string;
        fieldType?: string;
      }[];
    };

    if (!name || !farmTypes?.length || !species?.length) {
      return NextResponse.json(
        { error: "Farm name, types, and at least one species are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.farmMembership.findFirst({
      where: { userId: Number(user.id), role: FarmRole.OWNER },
    });
    if (existing) {
      throw new AuthError("You already own a farm", 409);
    }

    const enabledModules = (modules?.length
      ? modules
      : DEFAULT_MODULES) as ModuleKey[];

    const farm = await prisma.farm.create({
      data: {
        name,
        farmTypes,
        location,
        size,
        workerCount,
        description,
        onboarded: true,
        memberships: {
          create: {
            userId: Number(user.id),
            role: FarmRole.OWNER,
          },
        },
        modules: {
          create: Object.values(ModuleKey).map((module) => ({
            module,
            enabled: enabledModules.includes(module),
          })),
        },
        species: {
          create: species.map((s) => ({
            name: s.name,
            categories: {
              create: (s.categories?.length
                ? s.categories
                : SPECIES_PRESETS[s.name] || ["General"]
              ).map((c) => ({
                name: c,
                isCustom: !(SPECIES_PRESETS[s.name] || []).includes(c),
              })),
            },
          })),
        },
        customFields: customFields?.length
          ? {
              create: customFields.map((f) => ({
                entity: f.entity as never,
                key: f.key,
                label: f.label,
                fieldType: (f.fieldType as never) || "TEXT",
              })),
            }
          : undefined,
      },
      include: {
        modules: true,
        species: { include: { categories: true } },
      },
    });

    await prisma.user.update({
      where: { id: Number(user.id) },
      data: { platformRole: "OWNER" },
    });

    return NextResponse.json({ farm });
  } catch (e) {
    return jsonError(e);
  }
}
