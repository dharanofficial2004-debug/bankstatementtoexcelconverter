import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data: existing } = await supabaseAdmin
      .from("user_usage")
      .select("paid_credits, plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "No usage record found" }, { status: 400 });
    }

    if (existing.plan === "lifetime") {
      return NextResponse.json({ success: true, paid_credits: existing.paid_credits || 0 });
    }

    if (!existing.paid_credits || existing.paid_credits <= 0) {
      return NextResponse.json({ error: "No paid credits available" }, { status: 400 });
    }

    const newCredits = existing.paid_credits - 1;
    const { error: updateError } = await supabaseAdmin
      .from("user_usage")
      .update({ paid_credits: newCredits, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("usage/consume update error:", updateError);
      return NextResponse.json({ error: "Failed to consume credit" }, { status: 500 });
    }

    return NextResponse.json({ success: true, paid_credits: newCredits });
  } catch (err) {
    console.error("usage/consume unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
