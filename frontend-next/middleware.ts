import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/admin",
  "/contests",
  "/challenges",
  "/leaderboard",
  "/timer",
  "/results",
];

// Define auth routes that should redirect authenticated users
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // TEMPORARILY DISABLED - Let AuthContext handle authentication
  // If accessing a protected route without token, redirect to login
  // if (isProtectedRoute && !token) {
  //   const loginUrl = new URL("/login", request.url);
  //   loginUrl.searchParams.set("redirect", pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // If accessing an auth route with token, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
