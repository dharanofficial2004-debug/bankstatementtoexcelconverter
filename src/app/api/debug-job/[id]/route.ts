import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  
  try {
    // Get job details
    const { data: job } = await supabaseAdmin
      .from("conversion_jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    // Get chunks
    const { data: chunks } = await supabaseAdmin
      .from("job_chunks")
      .select("*")
      .eq("job_id", params.id)
      .order("seq", { ascending: true });

    // Get recent attempts
    const { data: attempts } = await supabaseAdmin
      .from("gemini_attempts")
      .select("*")
      .eq("job_id", params.id)
      .order("started_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      job,
      chunks,
      attempts,
      now: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}