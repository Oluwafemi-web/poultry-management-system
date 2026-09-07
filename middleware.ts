import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Public read endpoints for marketplaces
  const publicApiGet =
    method === "GET" &&
    (pathname === "/api/marketplace/products" ||
      pathname.startsWith("/api/marketplace/suppliers/") ||
      (pathname === "/api/livestock-market/listings" &&
        !req.nextUrl.searchParams.get("mine")));

  if (publicApiGet) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signIn = new URL("/signin", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  const farmRole = token.farmRole as string | null;
  const onboarded = Boolean(token.onboarded);

  if (
    (pathname.startsWith("/app") || pathname.startsWith("/worker")) &&
    !onboarded &&
    farmRole !== "WORKER"
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (pathname.startsWith("/onboarding") && onboarded) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (pathname.startsWith("/app") && farmRole === "WORKER") {
    return NextResponse.redirect(new URL("/worker", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/worker/:path*",
    "/onboarding/:path*",
    "/api/farm/:path*",
    "/api/marketplace/:path*",
    "/api/livestock-market/:path*",
  ],
};
