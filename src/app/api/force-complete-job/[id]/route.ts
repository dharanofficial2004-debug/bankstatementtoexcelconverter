import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  
  try {
    // Get the job and chunk data
    const { data: job } = await supabaseAdmin
      .from("conversion_jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get the completed chunks
    const { data: chunks } = await supabaseAdmin
      .from("job_chunks")
      .select("*")
      .eq("job_id", params.id)
      .eq("status", "succeeded")
      .order("seq", { ascending: true });

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: "No completed chunks found" }, { status: 400 });
    }

    // Extract transactions from the first chunk (since there's only 1)
    const firstChunk = chunks[0];
    const outputJson = firstChunk.output_json as Record<string, unknown>;
    
    if (!outputJson || !outputJson.transactions) {
      return NextResponse.json({ error: "Invalid chunk data" }, { status: 400 });
    }

    // Format transactions
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

    // Update the job to ready status with results
    const updateResult = await supabaseAdmin
      .from("conversion_jobs")
      .update({
        status: "ready",
        progress_stage: "ready",
        result_json: {
          bank_detected: outputJson.bank_name || "",
          currency_symbol: outputJson.currency_symbol || "₹",
          transactions,
          notices: outputJson.notices || [],
        },
        validation_notices: outputJson.notices || [],
        lease_owner: null,
        lease_expires_at: null,
        extracted_text: null, // Clear extracted text
        extracted_text_expires_at: null,
      })
      .eq("id", params.id);

    return NextResponse.json({
      ok: true,
      message: "Job manually completed",
      transactionCount: transactions.length,
      bankDetected: outputJson.bank_name,
      updateResult: updateResult.error ? updateResult.error : "Success"
    });

  } catch (error) {
    console.error("Error completing job:", error);
    return NextResponse.json({ 
      ok: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
