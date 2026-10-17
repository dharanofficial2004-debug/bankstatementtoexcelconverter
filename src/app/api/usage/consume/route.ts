import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is no longer used. Entitlements are applied on the conversion job." },
    { status: 410 }
  );
}

export async function GET() {
  return POST();
}
