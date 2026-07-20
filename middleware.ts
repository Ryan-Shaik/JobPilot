import { updateSession } from "@insforge/sdk/ssr/middleware";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/find-jobs"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Early exit for assets
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isLogin = pathname === "/login";
  const isCallback = pathname === "/callback";

  if (!isProtected && !isLogin && !isCallback) return NextResponse.next();

  // Create base response
  let response = NextResponse.next({ request });

  // Sync session cookies across protected routes, login, and callback pages
  const { accessToken, error } = await updateSession({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    requestCookies: request.cookies as any,
    responseCookies: response.cookies as any,
  });

  const isAuthenticated = !error && !!accessToken;

  // Routing Guards
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};