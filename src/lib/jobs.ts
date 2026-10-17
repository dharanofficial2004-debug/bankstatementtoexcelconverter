import "server-only";
import crypto from "crypto";
import { supabaseAdmin } from "./supabaseServer";
import type { RequestIdentity } from "./identity";
import { extractionLimits, loadEntitlement, type ExtractionKind } from "./entitlements";
import { LIMITS, allowRate } from "./rateLimit";
import { splitExtractedText } from "./chunking";

export async function authorizeExtraction(
  identity: RequestIdentity,
  kind: ExtractionKind,
  filename: string,
  fileSize: number
) {
  if (!supabaseAdmin) throw new Error("unconfigured");
  // Best-effort: ignore errors if migration hasn't run yet
  try { await supabaseAdmin.rpc("expire_abandoned_reservations"); } catch (e) {
    console.warn("[jobs] expire_abandoned_reservations skipped:", (e as Error)?.message);
  }

  const ipOk = await allowRate(`authz:ip:${identity.ipHash}`, LIMITS.ipAuthorizeHour.window, LIMITS.ipAuthorizeHour.max);
  const ownerKey = `authz:${identity.ownerType}:${identity.ownerId}`;
  const ownerLimit = identity.ownerType === "guest" ? LIMITS.guestAuthorizeHour : LIMITS.userAuthorizeHour;
  const ownerOk = await allowRate(ownerKey, ownerLimit.window, ownerLimit.max);
  console.log("[jobs] rate limits:", { ipOk, ownerOk });
  if (!ipOk || !ownerOk) {
    return { ok: false as const, code: "too_many" as const, retryAfterSec: 30 };
  }

  const ent = await loadEntitlement(identity);
  console.log("[jobs] entitlement:", { plan: ent.plan, paidCredits: ent.paidCredits, trialFinished: ent.trialFinished, trialAvailable: ent.trialAvailable });
  const limits = extractionLimits(ent, kind);

  if (ent.plan !== "lifetime" && ent.paidCredits <= 0 && ent.trialFinished) {
    console.log("[jobs] trial_complete — no entitlement");
    return { ok: false as const, code: "trial_complete" as const };
  }

  const { count: live } = await supabaseAdmin
    .from("conversion_jobs")
    .select("id", { count: "exact", head: true })
    .eq("owner_type", identity.ownerType)
    .eq("owner_id", identity.ownerId)
    .in("status", ["queued", "processing", "retrying", "validating"]);
  if ((live ?? 0) >= LIMITS.concurrentJobs) {
    return { ok: false as const, code: "server_busy" as const, retryAfterSec: 15 };
  }

  let reservationKind: "trial" | "payg" | "lifetime" = "lifetime";
  if (ent.plan === "lifetime" || identity.isAdmin) {
    reservationKind = "lifetime";
  } else if (ent.paidCredits > 0) {
    reservationKind = "payg";
  } else {
    reservationKind = "trial";
  }

  // Use atomic RPC for reservation + job creation (migration 009).
  // Falls back to inline logic if the RPC hasn't been deployed yet.
  const rpcResult = await supabaseAdmin.rpc("authorize_extraction", {
    p_owner_type: identity.ownerType,
    p_owner_id: identity.ownerId,
    p_user_id: identity.userId ?? null,
    p_guest_session_id: identity.guestSessionId ?? null,
    p_kind: reservationKind,
    p_filename: filename.slice(0, 200),
    p_file_size_bytes: fileSize,
    p_pages_authorized: limits.maxPages,
    p_char_budget: limits.maxChars,
    p_extraction_kind: kind,
  });

  // If the RPC exists and succeeded, use its result
  if (!rpcResult.error) {
    const data = rpcResult.data as { reservation_id?: string; job_id?: string; reused?: boolean; error?: string };
    if (data.error === "no_credits") {
      return { ok: false as const, code: "trial_complete" as const };
    }
    if (data.error || !data.job_id) {
      return { ok: false as const, code: "server_busy" as const };
    }
    return {
      ok: true as const,
      conversionId: data.job_id,
      reservationId: data.reservation_id ?? null,
      limits,
      reused: data.reused ?? false,
    };
  }

  // RPC not found (migration 009 not yet applied) — fall back to inline logic
  if (!/(PGRST202|function.*does not exist|Could not find)/i.test(rpcResult.error?.message ?? "")) {
    // Real error, not "function not found"
    return { ok: false as const, code: "server_busy" as const };
  }

  // ── Inline fallback (pre-migration-009) ──────────────────────────────────
  let reservationId: string | null = null;

  if (reservationKind === "payg") {
    const consumed = await supabaseAdmin.rpc("consume_paid_credit", { p_user_id: identity.userId });
    if (consumed.error || consumed.data == null) {
      return { ok: false as const, code: "trial_complete" as const };
    }
    const { data: resv, error: rErr } = await supabaseAdmin
      .from("entitlement_reservations")
      .insert({
        owner_type: identity.ownerType,
        owner_id: identity.ownerId,
        kind: "payg",
        status: "reserved",
        expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
      })
      .select("id")
      .single();
    if (rErr || !resv) {
      // Restore credit
      await supabaseAdmin.rpc("grant_payg_credits", { p_user_id: identity.userId, p_amount: 1 });
      return { ok: false as const, code: "server_busy" as const };
    }
    reservationId = resv.id;
  } else if (reservationKind === "trial") {
    // Check for existing reserved trial
    const { data: existing } = await supabaseAdmin
      .from("entitlement_reservations")
      .select("id, job_id")
      .eq("owner_type", identity.ownerType)
      .eq("owner_id", identity.ownerId)
      .eq("kind", "trial")
      .eq("status", "reserved")
      .maybeSingle();

    if (existing?.job_id) {
      const { data: job } = await supabaseAdmin
        .from("conversion_jobs")
        .select("id, status")
        .eq("id", existing.job_id)
        .maybeSingle();
      if (job && ["extract_authorized", "queued", "processing", "retrying", "validating", "uncertain"].includes(job.status)) {
        // Update job metadata for new extraction attempt
        if (job.status === "extract_authorized") {
          await supabaseAdmin.from("conversion_jobs").update({
            filename: filename.slice(0, 200),
            file_size_bytes: fileSize,
            extraction_kind: kind,
            pages_authorized: limits.maxPages,
            token_budget: limits.maxChars,
          }).eq("id", job.id);
        }
        return { ok: true as const, conversionId: job.id, reservationId: existing.id, limits, reused: true as const };
      }
    }

    if (existing && !existing.job_id) {
      reservationId = existing.id;
    } else {
      const { data: resv, error: rErr } = await supabaseAdmin
        .from("entitlement_reservations")
        .insert({
          owner_type: identity.ownerType,
          owner_id: identity.ownerId,
          kind: "trial",
          status: "reserved",
          expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
        })
        .select("id")
        .single();
      if (rErr || !resv) {
        return { ok: false as const, code: "trial_complete" as const };
      }
      reservationId = resv.id;
    }
  }
  // lifetime: no reservation needed (reservationId stays null)

  const { data: job, error: jobErr } = await supabaseAdmin
    .from("conversion_jobs")
    .insert({
      owner_type: identity.ownerType,
      owner_id: identity.ownerId,
      user_id: identity.userId ?? null,
      guest_session_id: identity.guestSessionId ?? null,
      reservation_id: reservationId,
      status: "extract_authorized",
      extraction_kind: kind,
      pages_authorized: limits.maxPages,
      filename: filename.slice(0, 200),
      file_size_bytes: fileSize,
      token_budget: limits.maxChars,
      extracted_text_expires_at: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
    })
    .select("id")
    .single();

  if (jobErr || !job) {
    if (reservationId && reservationKind === "payg" && identity.userId) {
      await supabaseAdmin.rpc("grant_payg_credits", { p_user_id: identity.userId, p_amount: 1 });
      await supabaseAdmin.from("entitlement_reservations").update({ status: "released", released_at: new Date().toISOString() }).eq("id", reservationId);
    } else if (reservationId && reservationKind === "trial") {
      await supabaseAdmin.from("entitlement_reservations").delete().eq("id", reservationId);
    }
    return { ok: false as const, code: "server_busy" as const };
  }

  if (reservationId) {
    await supabaseAdmin.from("entitlement_reservations").update({ job_id: job.id }).eq("id", reservationId);
  }

  return { ok: true as const, conversionId: job.id, reservationId, limits, reused: false as const };
}

export async function assertJobOwner(jobId: string, identity: RequestIdentity) {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin.from("conversion_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!data) return null;
  if (data.owner_type !== identity.ownerType || data.owner_id !== identity.ownerId) {
    const ownsUserJob = identity.ownerType === "user" && data.user_id === identity.userId;
    const ownsGuestJob = identity.ownerType === "user"
      && identity.guestSessionId
      && data.guest_session_id === identity.guestSessionId;
    if (!ownsUserJob && !ownsGuestJob) return null;
  }
  return data;
}

export async function submitConversion(
  identity: RequestIdentity,
  jobId: string,
  extractedText: string,
  pagesSubmitted: number,
  kind: ExtractionKind
) {
  if (!supabaseAdmin) throw new Error("unconfigured");
  const job = await assertJobOwner(jobId, identity);
  if (!job) return { ok: false as const, status: 404 as const, code: "convert_failed" as const };
  if (!["extract_authorized", "failed"].includes(job.status)) {
    return { ok: true as const, jobId, already: true as const, status: job.status as string };
  }

  // If job is failed and has a reservation that was released (credit already restored),
  // re-authorize atomically before proceeding
  if (job.status === "failed" && job.reservation_id) {
    const { data: reservation } = await supabaseAdmin
      .from("entitlement_reservations")
      .select("status")
      .eq("id", job.reservation_id)
      .maybeSingle();
    if (reservation?.status === "released") {
      const reauth = await authorizeExtraction(identity, kind, job.filename || "statement.pdf", job.file_size_bytes || 0);
      if (!reauth.ok) {
        return { ok: false as const, status: 402 as const, code: reauth.code };
      }
      // Use the new job from re-authorization instead
      return submitConversion(identity, reauth.conversionId, extractedText, pagesSubmitted, kind);
    }
  }

  // Validate against job's stored limits (set at authorization time)
  if (pagesSubmitted > (job.pages_authorized ?? Infinity)) {
    return { ok: false as const, status: 400 as const, code: "convert_failed" as const };
  }
  if (extractedText.length > (job.token_budget ?? Infinity)) {
    return { ok: false as const, status: 400 as const, code: "input_too_large" as const };
  }

  const convertOk = await allowRate(`convert:${identity.ownerType}:${identity.ownerId}`, LIMITS.convertHour.window, LIMITS.convertHour.max);
  if (!convertOk) return { ok: false as const, status: 429 as const, code: "too_many" as const, retryAfterSec: 30 };

  const chunks = splitExtractedText(extractedText);
  const now = new Date().toISOString();

  // Only delete non-succeeded chunks (preserve completed work on re-submission)
  await supabaseAdmin.from("job_chunks")
    .delete()
    .eq("job_id", jobId)
    .in("status", ["pending", "failed", "leased"]);

  // Re-insert only the chunks that were not already succeeded
  const { data: existingSucceeded } = await supabaseAdmin
    .from("job_chunks")
    .select("seq")
    .eq("job_id", jobId)
    .eq("status", "succeeded");

  const succeededSeqs = new Set((existingSucceeded || []).map((c: { seq: number }) => c.seq));
  const newChunks = chunks.filter((c) => !succeededSeqs.has(c.seq));

  if (newChunks.length > 0) {
    await supabaseAdmin.from("job_chunks").insert(
      newChunks.map((c) => ({
        job_id: jobId,
        seq: c.seq,
        input_text: c.text,
        input_excerpt_hash: crypto.createHash("sha256").update(c.text).digest("hex").slice(0, 32),
        status: "pending",
      }))
    );
  }

  await supabaseAdmin
    .from("conversion_jobs")
    .update({
      status: "queued",
      progress_stage: "queued",
      extracted_text: extractedText,
      extracted_char_count: extractedText.length,
      pages_submitted: pagesSubmitted,
      extraction_kind: kind,
      chunks_total: chunks.length,
      chunks_done: succeededSeqs.size,
      last_error_code: null,
      updated_at: now,
    })
    .eq("id", jobId)
    .in("status", ["extract_authorized", "failed"]);

  const { enqueueJob } = await import("./queue");
  await enqueueJob(jobId);
  return { ok: true as const, jobId, already: false as const, status: "queued" };
}

export function publicJobView(job: Record<string, unknown>) {
  const retryAfter = job.retry_after ? new Date(String(job.retry_after)).getTime() : 0;
  const retryAfterSec = retryAfter > Date.now() ? Math.ceil((retryAfter - Date.now()) / 1000) : 0;
  const status = job.progress_stage === "validating" && ["processing", "validating"].includes(String(job.status))
    ? "validating"
    : job.status;
  return {
    id: job.id,
    status,
    stage: job.progress_stage,
    chunksDone: job.chunks_done,
    chunksTotal: job.chunks_total,
    pagesAuthorized: job.pages_authorized,
    pagesSubmitted: job.pages_submitted,
    extractionKind: job.extraction_kind,
    filename: job.filename,
    supportRef: job.support_ref,
    errorCode: job.last_error_code,
    retryAfterSec,
    validationNotices: job.validation_notices || [],
  };
}
