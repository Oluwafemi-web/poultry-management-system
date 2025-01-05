import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define restricted paths and roles
const roleBasedPaths = {
  admin: ["/admin", "/admin"],
  worker: ["/worker", "/worker"],
};

// Secret for JWT (should match the one used in your NextAuth config)
const secret = process.env.NEXTAUTH_SECRET;

// Middleware to handle role-based access
export async function middleware(req: NextRequest) {
  // Extract token from request
  const token = await getToken({ req, secret });

  const url = req.nextUrl.pathname;

  // If token is missing or invalid, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Extract user role from the token
  const userRole = token.role as "admin" | "worker";

  // Allow requests to public or unrestricted pages
  const unrestrictedPaths = ["/"];
  if (unrestrictedPaths.includes(url)) {
    return NextResponse.next();
  }

  // Validate role-based access
  const allowedPaths = roleBasedPaths[userRole];
  if (allowedPaths && allowedPaths.some((path) => url.startsWith(path))) {
    return NextResponse.next();
  }

  // Deny access for unauthorized users
  return NextResponse.redirect(new URL("/", req.url));
}

// Match routes where middleware should be applied
export const config = {
  matcher: [
    "/admin/:path*",
    "/worker/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
