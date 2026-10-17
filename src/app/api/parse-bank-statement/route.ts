import { NextResponse } from "next/server";
import { customerMessage } from "@/lib/customerErrors";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { success: false, error: customerMessage("convert_failed"), code: "legacy_disabled" },
    { status: 410 }
  );
}
