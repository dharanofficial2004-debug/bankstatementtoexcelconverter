import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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

    // Single query for all fields
    const { data, error } = await supabaseAdmin
      .from("user_usage")
      .select("conversions_used, plan, paid_credits")
      .eq("user_id", user.id)
      .order("conversions_used", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("usage/get error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // First-time user: no row yet → 0 conversions, free plan
    return NextResponse.json({
      conversions_used: data?.conversions_used ?? 0,
      plan: data?.plan ?? "free",
      paid_credits: data?.paid_credits ?? 0,
    });
  } catch (err) {
    console.error("usage/get unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
