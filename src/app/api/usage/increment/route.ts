import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key to bypass RLS
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

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Upsert: insert row if not exists, then increment conversions_used
    const { data: existing } = await supabaseAdmin
      .from("user_usage")
      .select("id, conversions_used")
      .eq("user_id", user.id)
      .maybeSingle();

    let newCount: number;

    if (existing) {
      newCount = existing.conversions_used + 1;
      const { error: updateError } = await supabaseAdmin
        .from("user_usage")
        .update({ conversions_used: newCount, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("usage/increment update error:", updateError);
        return NextResponse.json({ error: "Failed to increment usage" }, { status: 500 });
      }
    } else {
      newCount = 1;
      const { error: insertError } = await supabaseAdmin
        .from("user_usage")
        .insert({ user_id: user.id, conversions_used: 1 });

      if (insertError) {
        console.error("usage/increment insert error:", insertError);
        return NextResponse.json({ error: "Failed to create usage record" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, conversions_used: newCount });
  } catch (err) {
    console.error("usage/increment unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
