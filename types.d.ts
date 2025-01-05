// types.d.ts
import "next-auth";
import { Session, JWT } from "next-auth";
import { TypeScriptConfig } from "next/dist/server/config-shared";

// Augmenting the JWT interface to include the id, email, and role properties
declare module "next-auth" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}
