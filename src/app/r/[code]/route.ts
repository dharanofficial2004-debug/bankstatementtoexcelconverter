import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const destination = new URL("/", request.url);
  destination.searchParams.set("aff", params.code);
  return NextResponse.redirect(destination, 307);
}
