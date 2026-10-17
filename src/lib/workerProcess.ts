import "server-only";
import crypto from "crypto";
import { supabaseAdmin } from "./supabaseServer";
import { mergeChunkTransactions, validateTransactions, type RawTx } from "./chunking";
import { completeAttempt, estimateCostUsd, parseStatementChunk, PRICING_VERSION, recordAttempt, VERTEX_LOCATION, VERTEX_MODEL } from "./vertexGemini";
import { allowRate, LIMITS } from "./rateLimit";

const WORKER_ID = `w_${crypto.randomUUID()}`;

function jitter(ms: number) {
  return ms + Math.floor(Math.random() * ms * 0.4);
}

function formatTx(tx: RawTx, idx: number) {
  const debitVal = Number(tx.debit) || 0;
  const creditVal = Number(tx.credit) || 0;
  const balanceVal = Number(tx.balance) || 0;
  return {
    id: crypto.randomUUID(),
    date: String(tx.date || ""),
    description: String(tx.description || `Transaction ${idx + 1}`),
    debit: debitVal > 0 ? debitVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
    credit: creditVal > 0 ? creditVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
    balance: balanceVal !== 0 ? balanceVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
    cheque_number: tx.cheque_number ? String(tx.cheque_number) : "",
    category: tx.category ? String(tx.category) : "",
    uncertain: tx.uncertain ? "true" : undefined,
  };
}

async function failJob(job: Record<string, unknown>) {
  if (!supabaseAdmin) return;
  // Try new atomic RPC first (migration 009)
  const rpc = await supabaseAdmin.rpc("release_reservation_for_job", {
    p_job_id: job.id as string,
    p_worker_id: WORKER_ID,
  });
  if (!rpc.error) return;
  // Fallback: inline release (pre-migration-009)
  const reservationId = job.reservation_id as string | null;
  if (reservationId) {
    const { data } = await supabaseAdmin
      .from("entitlement_reservations")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", reservationId)
      .eq("status", "reserved")
      .select("kind")
      .maybeSingle();
    if (data?.kind === "payg" && job.user_id) {
      await supabaseAdmin.rpc("grant_payg_credits", { p_user_id: job.user_id, p_amount: 1 });
    }
  }
  await supabaseAdmin
    .from("conversion_jobs")
    .update({ status: "failed", progress_stage: "failed", last_error_code: "convert_failed", lease_owner: null, lease_expires_at: null })
    .eq("id", job.id);
}

export async function processJob(jobId: string): Promise<{ ok: boolean; code?: string }> {
  if (!supabaseAdmin) return { ok: false, code: "unconfigured" };

  const leaseUntil = new Date(Date.now() + 90_000).toISOString();
  const { data: leased } = await supabaseAdmin
    .from("conversion_jobs")
    .update({
      status: "processing",
      progress_stage: "processing",
      lease_owner: WORKER_ID,
      lease_expires_at: leaseUntil,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .in("status", ["queued", "retrying", "processing", "validating"])
    .or(`lease_expires_at.is.null,lease_expires_at.lt.${new Date().toISOString()}`)
    .select("*")
    .maybeSingle();

  const job = leased;
  if (!job) return { ok: true, code: "not_leased" };

  const { data: chunks } = await supabaseAdmin
    .from("job_chunks")
    .select("*")
    .eq("job_id", jobId)
    .order("seq", { ascending: true });

  const list = chunks || [];
  for (const chunk of list) {
    if (chunk.status === "succeeded" && chunk.output_json) continue;
    if (chunk.status === "uncertain") {
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ status: "uncertain", progress_stage: "uncertain", last_error_code: "server_busy" })
        .eq("id", jobId);
      return { ok: false, code: "uncertain" };
    }

    const { data: startedAttempts } = await supabaseAdmin
      .from("gemini_attempts")
      .select("id, status, started_at")
      .eq("chunk_id", chunk.id)
      .eq("status", "started")
      .order("started_at", { ascending: false })
      .limit(1);

    const open = startedAttempts?.[0];
    if (open && Date.now() - new Date(open.started_at).getTime() < 70_000) {
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ status: "uncertain", last_error_code: "server_busy" })
        .eq("id", jobId);
      return { ok: false, code: "uncertain" };
    }
    if (open) {
      await completeAttempt(open.id, { status: "uncertain", sanitized_error: "no_response", ended_at: new Date().toISOString() });
      await supabaseAdmin.from("job_chunks").update({ status: "uncertain" }).eq("id", chunk.id);
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ status: "uncertain", last_error_code: "server_busy" })
        .eq("id", jobId);
      return { ok: false, code: "uncertain" };
    }

    if ((chunk.attempt_count || 0) >= 3) {
      await failJob(job);
      return { ok: false, code: "convert_failed" };
    }

    // Check Gemini rate limit BEFORE each actual call (does not consume attempt_count)
    const geminiOk = await allowRate("gemini:global:minute", LIMITS.geminiPerMinute.window, LIMITS.geminiPerMinute.max);
    if (!geminiOk) {
      // Do NOT increment attempt_count. Release lease and schedule redispatch.
      const retryAfter = new Date(Date.now() + LIMITS.geminiPerMinute.window * 1000).toISOString();
      await supabaseAdmin.from("conversion_jobs").update({
        status: "retrying",
        progress_stage: "retrying",
        last_error_code: "server_busy",
        retry_after: retryAfter,
        lease_owner: null,
        lease_expires_at: null,
      }).eq("id", jobId).eq("lease_owner", WORKER_ID);
      // Insert outbox row for redispatch
      await supabaseAdmin.from("job_outbox").insert({
        job_id: jobId,
        payload: { jobId },
        status: "pending",
        next_attempt_at: retryAfter,
      });
      return { ok: false, code: "rate_limited" };
    }

    await supabaseAdmin
      .from("job_chunks")
      .update({ status: "leased", lease_owner: WORKER_ID, lease_expires_at: leaseUntil, attempt_count: (chunk.attempt_count || 0) + 1 })
      .eq("id", chunk.id)
      .in("status", ["pending", "failed", "leased"]);

    const attemptId = await recordAttempt({
      job_id: jobId,
      chunk_id: chunk.id,
      owner_type: job.owner_type,
      owner_id: job.owner_id,
      attempt_no: (chunk.attempt_count || 0) + 1,
      operation: "parse_statement",
      model: VERTEX_MODEL,
      location: VERTEX_LOCATION,
      endpoint: "generateContent",
      status: "started",
      pricing_version: PRICING_VERSION,
    });

    const started = Date.now();
    try {
      const result = await parseStatementChunk(chunk.input_text || "");
      let parsed: { transactions?: RawTx[]; bank_name?: string; currency_symbol?: string; notices?: string[] };
      try {
        parsed = JSON.parse(result.text);
      } catch {
        await completeAttempt(attemptId, {
          status: "invalid_json",
          ended_at: new Date().toISOString(),
          duration_ms: Date.now() - started,
          input_tokens: result.usage.input_tokens,
          output_tokens: result.usage.output_tokens,
          total_tokens: result.usage.total_tokens,
          cached_tokens: result.usage.cached_tokens,
          thinking_tokens: result.usage.thinking_tokens,
          raw_usage: result.usage.raw,
          estimated_cost_usd: estimateCostUsd(result.usage.input_tokens, result.usage.output_tokens),
          sanitized_error: "invalid_json",
          finish_reason: result.finishReason,
          provider_response_id: result.providerResponseId,
        });
        throw new Error("invalid_json");
      }
      if (!Array.isArray(parsed.transactions)) throw new Error("invalid_json");

      await completeAttempt(attemptId, {
        status: "succeeded",
        ended_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
        input_tokens: result.usage.input_tokens,
        output_tokens: result.usage.output_tokens,
        total_tokens: result.usage.total_tokens,
        cached_tokens: result.usage.cached_tokens,
        thinking_tokens: result.usage.thinking_tokens,
        raw_usage: result.usage.raw,
        estimated_cost_usd: estimateCostUsd(result.usage.input_tokens, result.usage.output_tokens),
        finish_reason: result.finishReason,
        provider_response_id: result.providerResponseId,
      });

      await supabaseAdmin
        .from("job_chunks")
        .update({ status: "succeeded", output_json: parsed })
        .eq("id", chunk.id);

      const done = list.filter((c) => c.id === chunk.id || c.status === "succeeded").length;
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ chunks_done: done, progress_stage: "processing" })
        .eq("id", jobId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "failed";
      await completeAttempt(attemptId, {
        status: message === "invalid_json" ? "invalid_json" : "failed",
        ended_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
        sanitized_error: message.slice(0, 120),
        retry_reason: message,
      });
      const retryAfter = new Date(Date.now() + jitter(Math.min(60_000, 4000 * 2 ** (chunk.attempt_count || 0)))).toISOString();
      await supabaseAdmin.from("job_chunks").update({ status: "failed" }).eq("id", chunk.id);
      await supabaseAdmin
        .from("conversion_jobs")
        .update({
          status: "retrying",
          progress_stage: "retrying",
          last_error_code: "server_busy",
          last_error_internal: message.slice(0, 200),
          retry_after: retryAfter,
          retry_count: (job.retry_count || 0) + 1,
          lease_owner: null,
          lease_expires_at: null,
        })
        .eq("id", jobId);
      // Insert outbox row for redispatch on chunk retry
      await supabaseAdmin.from("job_outbox").insert({
        job_id: jobId,
        payload: { jobId },
        status: "pending",
        next_attempt_at: retryAfter,
      });
      return { ok: false, code: "server_busy" };
    }
  }

  const { data: doneChunks } = await supabaseAdmin
    .from("job_chunks")
    .select("seq, output_json, status")
    .eq("job_id", jobId)
    .order("seq", { ascending: true });

  if ((doneChunks || []).some((c) => c.status !== "succeeded")) {
    return { ok: false, code: "server_busy" };
  }

  const { data: validatingJob, error: validatingError } = await supabaseAdmin
    .from("conversion_jobs")
    .update({ progress_stage: "validating", updated_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("lease_owner", WORKER_ID)
    .select("id")
    .maybeSingle();
  if (validatingError || !validatingJob) {
    console.error(`[worker] couldn't mark job ${jobId} as validating`, validatingError?.message ?? "lease lost");
    return { ok: false, code: "lease_lost" };
  }
  console.log(`[worker] job ${jobId} → validating | chunks=${doneChunks?.length}`);

  const parts = (doneChunks || []).map((c) => ((c.output_json as { transactions?: RawTx[] })?.transactions || []));
  const merged = mergeChunkTransactions(parts);
  const notices = [
    ...merged.notices,
    ...validateTransactions(merged.transactions),
    ...((doneChunks || []).flatMap((c) => ((c.output_json as { notices?: string[] })?.notices || []))),
  ];
  const firstMeta = (doneChunks?.[0]?.output_json || {}) as { bank_name?: string; currency_symbol?: string };
  const transactions = merged.transactions.map((tx, i) => formatTx(tx, i));

  if (!transactions.length) {
    await failJob(job);
    return { ok: false, code: "convert_failed" };
  }

  // Use atomic RPC for commit — sets status to 'ready', clears extracted_text and lease
  console.log(`[worker] committing job ${jobId} | worker=${WORKER_ID}`);
  const commitResult = await supabaseAdmin.rpc("commit_reservation_for_job", {
    p_job_id: jobId,
    p_worker_id: WORKER_ID,
  });

  console.log(`[worker] commit RPC result | data=${commitResult.data} error=${commitResult.error?.message ?? "none"}`);

  if (commitResult.data === "lease_lost" || commitResult.data === "lease_lost_on_ready") {
    console.log(`[worker] lease lost for job ${jobId} — another worker completed it`);
    return { ok: false, code: "lease_lost" };
  }

  const resultPayload = {
    bank_detected: firstMeta.bank_name || "",
    currency_symbol: firstMeta.currency_symbol || "₹",
    transactions,
    notices: Array.from(new Set(notices)),
  };

  // If RPC errored (e.g. migration not applied), fall back to a direct update
  if (commitResult.error || !commitResult.data) {
    console.warn(`[worker] commit RPC failed, using direct fallback for job ${jobId}:`, commitResult.error?.message);
    const { error: directErr } = await supabaseAdmin
      .from("conversion_jobs")
      .update({
        status: "ready",
        progress_stage: "ready",
        result_json: resultPayload,
        validation_notices: Array.from(new Set(notices)),
        lease_owner: null,
        lease_expires_at: null,
        extracted_text: null,
        result_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60_000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    if (directErr) {
      console.error(`[worker] direct fallback failed for job ${jobId}:`, directErr.message);
      return { ok: false, code: "commit_failed" };
    }
    console.log(`[worker] ✅ job ${jobId} complete via fallback | transactions=${transactions.length}`);
    return { ok: true };
  }

  // RPC succeeded — write result_json separately  // RPC succeeded — write result_json separately
  const { error: resultErr } = await supabaseAdmin
    .from("conversion_jobs")
    .update({
      result_json: resultPayload,
      validation_notices: Array.from(new Set(notices)),
      result_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60_000).toISOString(),
    })
    .eq("id", jobId);

  if (resultErr) {
    console.error(`[worker] result_json update failed for job ${jobId}:`, resultErr.message);
  }

  console.log(`[worker] ✅ job ${jobId} complete | transactions=${transactions.length}`);
  return { ok: true };
}
