import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  // Paths that require authentication
  const protectedPaths = ["/student", "/business"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !authToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (authToken && (pathname === "/login" || pathname === "/register")) {
    // Note: We don't know the role here from just the token existence, 
    // but the client-side useAuth will handle the final redirection.
    // For now, let's just let it pass or redirect to a generic home.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/business/:path*",
    "/login",
    "/register",
  ],
};
