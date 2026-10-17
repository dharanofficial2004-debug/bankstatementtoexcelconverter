import { NextRequest, NextResponse } from "next/server";
import { authenticate, getUsage } from "@/lib/authServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth.ok) return auth.response;

    const usage = await getUsage(auth.ctx.userId);
    return NextResponse.json({
      conversions_used: usage.conversionsUsed,
      plan: usage.plan,
      paid_credits: usage.paidCredits,
    });
  } catch (err) {
    console.error("usage/get unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
