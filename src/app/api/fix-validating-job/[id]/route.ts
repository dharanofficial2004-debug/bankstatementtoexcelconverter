import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { processJob } from "@/lib/workerProcess";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  
  try {
    // Step 1: Reset the lease for validating jobs with expired leases
    const result = await supabaseAdmin
      .from("conversion_jobs")
      .update({ 
        status: "queued", 
        progress_stage: "queued",
        lease_owner: null, 
        lease_expires_at: null 
      })
      .eq("id", params.id)
      .eq("status", "validating")
      .lt("lease_expires_at", new Date().toISOString())
      .select("*")
      .single();
    
    if (!result.data) {
      return NextResponse.json({ 
        ok: false, 
        error: "Job not found or lease not expired" 
      });
    }
    
    // Step 2: Process the job again
    const processResult = await processJob(params.id);
    
    return NextResponse.json({
      ok: true,
      message: "Job lease reset and processing triggered",
      resetResult: result.data,
      processResult
    });
    
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: String(error) 
    }, { status: 500 });
  }
}