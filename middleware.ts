import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/account", "/checkout", "/admin"];

// Routes that are always public
const publicRoutes = ["/", "/shop", "/product", "/about", "/stores", "/sign-in", "/verify", "/auth-callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtectedRoute) {
    const response = NextResponse.next();
    // Disable caching for auth-related pages
    if (pathname === "/auth-callback" || pathname.startsWith("/sign-in")) {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    }
    return response;
  }

  // Check for session cookie (BetterAuth uses this cookie name)
  const sessionToken = request.cookies.get("better-auth.session_token");

  if (!sessionToken) {
    // Redirect to sign-in with callback URL
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Note: Admin role check is done in the admin layout component
  // since we can't easily query the database in middleware

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
     * - public folder assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logos|fonts|public).*)",
  ],
};
