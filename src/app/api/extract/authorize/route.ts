import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, withIdentityHeaders } from "@/lib/identity";
import { authorizeExtraction, assertJobOwner } from "@/lib/jobs";
import { customerMessage } from "@/lib/customerErrors";
import { loadEntitlement, extractionLimits, type ExtractionKind } from "@/lib/entitlements";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { trackEvent } from "@/lib/analyticsServer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const body = await request.json();
    const kind: ExtractionKind = body.kind === "ocr" ? "ocr" : "text";
    const filename = typeof body.filename === "string" ? body.filename : "statement.pdf";
    const fileSize = Number(body.fileSize) || 0;
    const conversionId = typeof body.conversionId === "string" ? body.conversionId : null;

    // OCR re-authorization: reuse existing reservation, update job for OCR limits
    if (conversionId && kind === "ocr") {
      const job = await assertJobOwner(conversionId, identity);
      if (!job) {
        return withIdentityHeaders(
          NextResponse.json({ error: "Job not found" }, { status: 404 }),
          setCookie
        );
      }
      if (job.status !== "extract_authorized") {
        return withIdentityHeaders(
          NextResponse.json({ error: "Job already submitted" }, { status: 409 }),
          setCookie
        );
      }
      const ent = await loadEntitlement(identity);
      const limits = extractionLimits(ent, "ocr");
      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Server configuration missing." }, { status: 503 });
      }
      await supabaseAdmin.from("conversion_jobs").update({
        extraction_kind: "ocr",
        pages_authorized: limits.maxPages,
        token_budget: limits.maxChars,
        updated_at: new Date().toISOString(),
      }).eq("id", conversionId);
      return withIdentityHeaders(
        NextResponse.json({
          ok: true,
          conversionId,
          maxPages: limits.maxPages,
          maxChars: limits.maxChars,
          isTrial: limits.isTrial,
          kind: "ocr",
          reused: true,
        }),
        setCookie
      );
    }

    const result = await authorizeExtraction(identity, kind, filename, fileSize);
    if (!result.ok) {
      const retry = "retryAfterSec" in result ? result.retryAfterSec : 0;
      return withIdentityHeaders(
        NextResponse.json(
          { ok: false, error: customerMessage(result.code), code: result.code, retryAfterSec: retry },
          { status: result.code === "too_many" ? 429 : result.code === "trial_complete" ? 402 : 409 }
        ),
        setCookie
      );
    }
    // Track extract event — fire-and-forget, no page speed impact
    trackEvent({
      eventType: "extract",
      request,
      ownerType: identity.ownerType,
      ownerId: identity.ownerId,
      userId: identity.userId ?? null,
      guestSessionId: identity.guestSessionId ?? null,
      metadata: { kind, filename, fileSize, isTrial: result.limits.isTrial },
    });
    return withIdentityHeaders(
      NextResponse.json({
        ok: true,
        conversionId: result.conversionId,
        maxPages: result.limits.maxPages,
        maxChars: result.limits.maxChars,
        isTrial: result.limits.isTrial,
        kind: result.limits.kind,
        reused: result.reused,
        notice: result.limits.isTrial
          ? "Free trial: first 3 text pages or 1 scanned page."
          : "Paid extraction follows your plan limits (max 100 pages).",
      }),
      setCookie
    );
  } catch (e) {
    const msg = e instanceof Error && e.message === "unconfigured" ? "Server configuration missing." : customerMessage("server_busy");
    console.error("[extract/authorize] caught:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }
}
