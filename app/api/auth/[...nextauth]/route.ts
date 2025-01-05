import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const bcrypt = require("bcrypt");
import prisma from "../../../lib/prisma"; // Import prisma from lib/prisma

// Define the user type

interface User {
  id: string;
  email: string;
  password: string;
  role: "admin" | "worker";
}

// Define auth options
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Return null if credentials are missing
        }

        // Fetch user from the database using Prisma
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // If the user is found and the password matches
        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return {
            id: user.id.toString(), // Ensure id is a string
            email: user.email,
            role: user.role,
          }; // Return user object without password
        }

        return null; // Return null if user not found or password does not match
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User).role; // Add role to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return baseUrl + url; // Redirect to the same base URL
      }
      return baseUrl; // Redirect to the base URL by default
    },
  },
  session: {
    strategy: "jwt",
  },
};

// Export handler for Next.js API routes
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
