import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, withIdentityHeaders } from "@/lib/identity";
import { assertJobOwner } from "@/lib/jobs";
import { loadEntitlement, extractionLimits } from "@/lib/entitlements";
import { parseStatementChunk } from "@/lib/vertexGemini";
import { customerMessage } from "@/lib/customerErrors";
import { trackEvent } from "@/lib/analyticsServer";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { LIMITS, allowRate } from "@/lib/rateLimit";
import crypto from "crypto";

export const dynamic = "force-dynamic";
// Sync Gemini call can take up to 55s — give it a 60s window
export const maxDuration = 60;

interface RawTx {
  date?: string;
  description?: string;
  debit?: number | string;
  credit?: number | string;
  balance?: number | string;
  cheque_number?: string;
  category?: string | null;
  uncertain?: boolean;
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

export async function POST(request: NextRequest) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const body = await request.json();
    const jobId = typeof body.conversionId === "string" ? body.conversionId : "";
    const rawText = typeof body.text === "string" ? body.text : "";
    const pages = Number(body.pagesSubmitted) || 0;
    const kind = body.kind === "ocr" ? "ocr" : "text";

    if (!jobId || !rawText.trim()) {
      return NextResponse.json({ ok: false, error: customerMessage("convert_failed") }, { status: 400 });
    }

    // ── 1. Verify job ownership ────────────────────────────────────────────
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: customerMessage("server_busy") }, { status: 503 });
    }
    const job = await assertJobOwner(jobId, identity);
    if (!job) {
      return NextResponse.json({ ok: false, error: customerMessage("convert_failed") }, { status: 404 });
    }
    // If already ready, just return success (idempotent)
    if (job.status === "ready") {
      return withIdentityHeaders(
        NextResponse.json({ ok: true, jobId, status: "ready" }),
        setCookie
      );
    }
    if (!["extract_authorized", "failed"].includes(job.status)) {
      return withIdentityHeaders(
        NextResponse.json({ ok: true, jobId, status: job.status }),
        setCookie
      );
    }

    // ── 2. Rate limit ──────────────────────────────────────────────────────
    const convertOk = await allowRate(
      `convert:${identity.ownerType}:${identity.ownerId}`,
      LIMITS.convertHour.window,
      LIMITS.convertHour.max
    );
    if (!convertOk) {
      return withIdentityHeaders(
        NextResponse.json({ ok: false, error: customerMessage("too_many"), code: "too_many", retryAfterSec: 30 }, { status: 429 }),
        setCookie
      );
    }

    // ── 3. Server-side entitlement check & text truncation ────────────────
    // This is the enforcement point — client cannot bypass this
    const ent = await loadEntitlement(identity);
    const limits = extractionLimits(ent, kind);

    // Reject if no entitlement at all (trial finished, no credits, not lifetime)
    if (ent.plan !== "lifetime" && ent.paidCredits <= 0 && ent.trialFinished) {
      return withIdentityHeaders(
        NextResponse.json({ ok: false, error: customerMessage("trial_complete"), code: "trial_complete" }, { status: 402 }),
        setCookie
      );
    }

    // Hard-enforce page limit: reject if they submitted more pages than allowed
    if (pages > limits.maxPages) {
      return withIdentityHeaders(
        NextResponse.json({ ok: false, error: customerMessage("convert_failed"), code: "convert_failed" }, { status: 400 }),
        setCookie
      );
    }

    // Hard-enforce char limit: truncate text server-side — client cannot bypass
    const text = rawText.length > limits.maxChars
      ? rawText.slice(0, limits.maxChars)
      : rawText;

    // ── 4. Mark job as processing ──────────────────────────────────────────
    await supabaseAdmin
      .from("conversion_jobs")
      .update({
        status: "processing",
        progress_stage: "processing",
        extracted_text: text,
        extracted_char_count: text.length,
        pages_submitted: pages,
        extraction_kind: kind,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // ── 5. Call Gemini synchronously ───────────────────────────────────────
    let parsed: { transactions?: RawTx[]; bank_name?: string; currency_symbol?: string; notices?: string[] };
    try {
      const result = await parseStatementChunk(text);
      parsed = JSON.parse(result.text);
    } catch {
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ status: "failed", progress_stage: "failed", last_error_code: "convert_failed", updated_at: new Date().toISOString() })
        .eq("id", jobId);
      return withIdentityHeaders(
        NextResponse.json({ ok: false, error: customerMessage("convert_failed"), code: "convert_failed" }, { status: 502 }),
        setCookie
      );
    }

    if (!Array.isArray(parsed?.transactions) || parsed.transactions.length === 0) {
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ status: "failed", progress_stage: "failed", last_error_code: "convert_failed", updated_at: new Date().toISOString() })
        .eq("id", jobId);
      return withIdentityHeaders(
        NextResponse.json({ ok: false, error: customerMessage("convert_failed"), code: "convert_failed" }, { status: 422 }),
        setCookie
      );
    }

    const transactions = parsed.transactions.map((tx, i) => formatTx(tx, i));
    const resultPayload = {
      bank_detected: parsed.bank_name || "",
      currency_symbol: parsed.currency_symbol || "₹",
      transactions,
      notices: Array.isArray(parsed.notices) ? parsed.notices : [],
    };

    // ── 6. Write result & mark ready (direct update — no RPC needed) ────────
    const { error: writeErr } = await supabaseAdmin
      .from("conversion_jobs")
      .update({
        status: "ready",
        progress_stage: "ready",
        result_json: resultPayload,
        validation_notices: resultPayload.notices,
        lease_owner: null,
        lease_expires_at: null,
        extracted_text: null,
        result_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60_000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (writeErr) {
      console.error("[convert] failed to write result for job", jobId, writeErr.message);
      return withIdentityHeaders(
        NextResponse.json({ ok: false, error: customerMessage("server_busy"), code: "server_busy" }, { status: 503 }),
        setCookie
      );
    }

    // ── 7. Track event fire-and-forget ────────────────────────────────────
    trackEvent({
      eventType: "convert",
      request,
      ownerType: identity.ownerType,
      ownerId: identity.ownerId,
      userId: identity.userId ?? null,
      guestSessionId: identity.guestSessionId ?? null,
      metadata: { jobId, kind, pages, isTrial: limits.isTrial },
    });

    return withIdentityHeaders(
      NextResponse.json({ ok: true, jobId, status: "ready" }),
      setCookie
    );
  } catch {
    return NextResponse.json({ ok: false, error: customerMessage("server_busy") }, { status: 503 });
  }
}
