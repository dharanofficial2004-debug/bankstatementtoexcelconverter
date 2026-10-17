import { NextResponse } from "next/server";
import { authenticate, getUsage } from "@/lib/authServer";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth.ok) return auth.response;
  const usage = await getUsage(auth.ctx.userId);
  return NextResponse.json({
    conversions_used: usage.conversionsUsed,
    plan: usage.plan,
    paid_credits: usage.paidCredits,
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Usage is recorded by the conversion worker, not this endpoint." },
    { status: 410 }
  );
}
