import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key so it can bypass RLS for upserts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Base fields always exist on user_usage
    const { data, error } = await supabaseAdmin
      .from("user_usage")
      .select("conversions_used")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("usage/get error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Extra fields require migration 004 — read them defensively
    let plan = "free";
    let paidCredits = 0;
    try {
      const { data: extra } = await supabaseAdmin
        .from("user_usage")
        .select("plan, paid_credits")
        .eq("user_id", user.id)
        .maybeSingle();
      if (extra) {
        plan = extra.plan ?? "free";
        paidCredits = extra.paid_credits ?? 0;
      }
    } catch (e) {
      console.warn("usage/get extra fields unavailable:", (e as Error).message);
    }

    // First-time user: no row yet → 0 conversions, free plan
    return NextResponse.json({
      conversions_used: data?.conversions_used ?? 0,
      plan,
      paid_credits: paidCredits,
    });
  } catch (err) {
    console.error("usage/get unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
