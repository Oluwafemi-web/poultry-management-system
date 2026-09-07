import { getServerSession } from "next-auth";
import { FarmRole, ModuleKey } from "@prisma/client";
import prisma from "./prisma";
import { authOptions } from "./auth-options";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  platformRole: string;
  farmId: number | null;
  farmRole: FarmRole | null;
  modules: ModuleKey[];
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new AuthError("Unauthorized", 401);
  }
  return session.user as SessionUser;
}

export async function requireFarmAccess(
  allowedRoles: FarmRole[] = [FarmRole.OWNER, FarmRole.MANAGER, FarmRole.WORKER]
) {
  const user = await requireUser();
  if (!user.farmId || !user.farmRole) {
    throw new AuthError("No farm selected. Complete onboarding first.", 403);
  }
  if (!allowedRoles.includes(user.farmRole)) {
    throw new AuthError("Forbidden", 403);
  }
  return user;
}

export async function getMembership(userId: number, farmId: number) {
  return prisma.farmMembership.findUnique({
    where: { userId_farmId: { userId, farmId } },
    include: {
      farm: {
        include: {
          modules: true,
        },
      },
    },
  });
}

export async function getPrimaryMembership(userId: number) {
  return prisma.farmMembership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      farm: {
        include: { modules: true },
      },
    },
  });
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
