import { NextResponse } from "next/server";
import { customerMessage } from "@/lib/customerErrors";

export const dynamic = "force-dynamic";

function gone() {
  return NextResponse.json(
    { success: false, error: customerMessage("pdf_unreadable"), code: "legacy_disabled" },
    { status: 410 }
  );
}

export async function POST() {
  return gone();
}

export async function GET() {
  return gone();
}
