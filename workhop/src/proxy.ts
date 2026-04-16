import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const authToken = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  // Paths that strictly require authentication
  const protectedPaths = ["/student", "/business"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // 1. Safe Routing: Allow public paths explicitly
  if (pathname === "/" || pathname === "/favicon.ico" || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users from protected routes to login
  if (isProtectedPath && !authToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 3. Do not block if logged in
  return NextResponse.next();
}

// Next.js 16+ Proxy configuration
export const config = {
  matcher: [
    /*
     * Safely match routes, avoiding API layer, next static,
     * static files, and the root path.
     */
    "/student/:path*",
    "/business/:path*",
    "/login",
    "/register",
  ],
};
