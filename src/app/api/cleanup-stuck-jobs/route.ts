import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  
  try {
    const stuckCutoff = new Date(Date.now() - 300_000).toISOString();
    
    const { data: stuckJobs } = await supabaseAdmin
      .from("conversion_jobs")
      .select("id, chunks_total, chunks_done, lease_expires_at, updated_at")
      .eq("status", "validating")
      .or(`lease_expires_at.lt.${new Date().toISOString()},updated_at.lt.${stuckCutoff}`);

    if (!stuckJobs || stuckJobs.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No stuck jobs found",
        cleaned: 0
      });
    }

    // Filter jobs where all chunks are completed
    const completedJobs = stuckJobs.filter(j => j.chunks_done === j.chunks_total);

    if (completedJobs.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No fully completed stuck jobs found",
        cleaned: 0
      });
    }

    let cleaned = 0;
    
    for (const job of completedJobs) {
      try {
        const { data: chunks } = await supabaseAdmin
          .from("job_chunks")
          .select("*")
          .eq("job_id", job.id)
          .eq("status", "succeeded")
          .order("seq", { ascending: true });

        if (!chunks || chunks.length === 0) continue;

        const firstChunk = chunks[0];
        const outputJson = firstChunk.output_json as Record<string, unknown>;
        
        if (!outputJson || !outputJson.transactions) continue;

        const transactions = (outputJson.transactions as Array<Record<string, unknown>>).map((tx, i: number) => {
          const debitVal = Number(tx.debit) || 0;
          const creditVal = Number(tx.credit) || 0;
          const balanceVal = Number(tx.balance) || 0;
          return {
            id: crypto.randomUUID(),
            date: String(tx.date || ""),
            description: String(tx.description || `Transaction ${i + 1}`),
            debit: debitVal > 0 ? debitVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
            credit: creditVal > 0 ? creditVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
            balance: balanceVal !== 0 ? balanceVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
            cheque_number: tx.cheque_number ? String(tx.cheque_number) : "",
            category: tx.category ? String(tx.category) : "",
            uncertain: tx.uncertain ? "true" : undefined,
          };
        });

        await supabaseAdmin
          .from("conversion_jobs")
          .update({
            status: "ready",
            progress_stage: "ready",
            result_json: {
              bank_detected: outputJson.bank_name || "",
              currency_symbol: outputJson.currency_symbol || "?",
              transactions,
              notices: outputJson.notices || [],
            },
            validation_notices: outputJson.notices || [],
            lease_owner: null,
            lease_expires_at: null,
            extracted_text: null,
            extracted_text_expires_at: null,
          })
          .eq("id", job.id);

        cleaned++;
      } catch (error) {
        console.error(`Failed to clean job ${job.id}:`, error);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Cleaned up ${cleaned} stuck jobs`,
      cleaned,
      found: completedJobs.length
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: String(error) 
    }, { status: 500 });
  }
}


