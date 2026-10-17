import { NextResponse } from "next/server";

// Middleware only adds security headers.
// Page view tracking was removed — it blocked responses.
// API events (extract, convert, export) are tracked inside their own routes.
export function middleware() {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};

