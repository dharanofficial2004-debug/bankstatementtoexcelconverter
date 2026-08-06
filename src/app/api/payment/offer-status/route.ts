import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LIFETIME_OFFER_LIMIT } from "@/lib/pricing";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("plan", "lifetime")
      .eq("payment_status", "paid");

    if (error) {
      console.error("offer-status count error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const sold = count ?? 0;
    const remaining = Math.max(LIFETIME_OFFER_LIMIT - sold, 0);
    return NextResponse.json({
      soldOut: remaining <= 0,
      remaining,
      limit: LIFETIME_OFFER_LIMIT,
    });
  } catch (err) {
    console.error("offer-status unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
