import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { FarmRole, ModuleKey } from "@prisma/client";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            memberships: {
              orderBy: { createdAt: "asc" },
              take: 1,
              include: {
                farm: { include: { modules: true } },
              },
            },
          },
        });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          return null;
        }

        const membership = user.memberships[0];
        const modules =
          membership?.farm.modules
            .filter((m) => m.enabled)
            .map((m) => m.module) ?? [];

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          platformRole: user.platformRole,
          farmId: membership?.farmId ?? null,
          farmRole: membership?.role ?? null,
          modules,
          onboarded: membership?.farm.onboarded ?? false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          id: string;
          email: string;
          name?: string | null;
          platformRole: string;
          farmId: number | null;
          farmRole: FarmRole | null;
          modules: ModuleKey[];
          onboarded: boolean;
        };
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.platformRole = u.platformRole;
        token.farmId = u.farmId;
        token.farmRole = u.farmRole;
        token.modules = u.modules;
        token.onboarded = u.onboarded;
      }

      if (trigger === "update" && session) {
        if (session.farmId !== undefined) token.farmId = session.farmId;
        if (session.farmRole !== undefined) token.farmRole = session.farmRole;
        if (session.modules !== undefined) token.modules = session.modules;
        if (session.onboarded !== undefined) token.onboarded = session.onboarded;
        if (session.platformRole !== undefined)
          token.platformRole = session.platformRole;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: (token.name as string) ?? null,
        platformRole: (token.platformRole as string) ?? "BUYER",
        farmId: (token.farmId as number | null) ?? null,
        farmRole: (token.farmRole as FarmRole | null) ?? null,
        modules: (token.modules as ModuleKey[]) ?? [],
        onboarded: Boolean(token.onboarded),
      };
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
