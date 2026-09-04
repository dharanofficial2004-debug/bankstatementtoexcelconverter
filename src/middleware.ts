import { NextResponse } from "next/server";

// Middleware is intentionally minimal — no x-pathname header injection.
// The root layout is statically generated (lang="en"), so we must NOT
// call headers() there. Locale sub-layouts handle their own lang attributes.
//
// This middleware only runs on API routes (to allow future session refresh
// logic) and does NOT touch marketing/landing pages, keeping them fully
// static and served from Vercel's CDN edge in every region.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only intercept API routes — not marketing pages.
    // This keeps all landing pages statically cached at the CDN edge.
    "/api/:path*",
  ],
};
