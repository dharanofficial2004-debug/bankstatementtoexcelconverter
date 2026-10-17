import "server-only";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabaseServer";
import { getUsage } from "./authServer";
import type { Actor } from "./identity";
import {
  CUSTOMER_ERRORS,
  MAX_PAGES_TECHNICAL,
  RESERVATION_TTL_HOURS,
  TRIAL_OCR_PAGES,
  TRIAL_TEXT_PAGES,
} from "./processing-constants";

export interface Entitlement {
  plan: "guest_trial" | "free" | "lifetime" | "payg";
  canExtract: boolean;
  canConvert: boolean;
  trialAvailable: boolean;
  trialConsumed: boolean;
  paidCredits: number;
  maxTextPages: number;
  maxOcrPages: number;
  paidUnlimited: boolean;
  message: string | null;
  code: string | null;
}

export async function describeEntitlement(actor: Actor): Promise<Entitlement> {
  if (!supabaseAdmin) {
    return {
      plan: "guest_trial",
      canExtract: false,
      canConvert: false,
      trialAvailable: false,
      trialConsumed: false,
      paidCredits: 0,
      maxTextPages: 0,
      maxOcrPages: 0,
      paidUnlimited: false,
      message: "Server configuration missing.",
      code: "config",
    };
  }

  if (actor.type === "guest") {
    const { data: guest } = await supabaseAdmin
      .from("guest_sessions")
      .select("trial_used, linked_user_id")
      .eq("id", actor.guestSessionId)
      .maybeSingle();
    const trialUsed = Boolean(guest?.trial_used);
    if (trialUsed) {
      return {
        plan: "guest_trial",
        canExtract: false,
        canConvert: false,
        trialAvailable: false,
        trialConsumed: true,
        paidCredits: 0,
        maxTextPages: 0,
        maxOcrPages: 0,
        paidUnlimited: false,
        message: CUSTOMER_ERRORS.upgrade_to_continue,
        code: "trial_complete",
      };
    }
    return {
      plan: "guest_trial",
      canExtract: true,
      canConvert: true,
      trialAvailable: true,
      trialConsumed: false,
      paidCredits: 0,
      maxTextPages: TRIAL_TEXT_PAGES,
      maxOcrPages: TRIAL_OCR_PAGES,
      paidUnlimited: false,
      message: null,
      code: null,
    };
  }

  const usage = await getUsage(actor.userId);
  if (actor.isAdmin || usage.plan === "lifetime") {
    return {
      plan: usage.plan === "lifetime" ? "lifetime" : "free",
      canExtract: true,
      canConvert: true,
      trialAvailable: false,
      trialConsumed: usage.trialConsumed,
      paidCredits: usage.paidCredits,
      maxTextPages: MAX_PAGES_TECHNICAL,
      maxOcrPages: MAX_PAGES_TECHNICAL,
      paidUnlimited: true,
      message: null,
      code: null,
    };
  }
  if (usage.paidCredits > 0) {
    return {
      plan: "payg",
      canExtract: true,
      canConvert: true,
      trialAvailable: false,
      trialConsumed: usage.trialConsumed,
      paidCredits: usage.paidCredits,
      maxTextPages: MAX_PAGES_TECHNICAL,
      maxOcrPages: MAX_PAGES_TECHNICAL,
      paidUnlimited: true,
      message: null,
      code: null,
    };
  }
  if (!usage.trialConsumed && usage.conversionsUsed === 0) {
    return {
      plan: "free",
      canExtract: true,
      canConvert: true,
      trialAvailable: true,
      trialConsumed: false,
      paidCredits: 0,
      maxTextPages: TRIAL_TEXT_PAGES,
      maxOcrPages: TRIAL_OCR_PAGES,
      paidUnlimited: false,
      message: null,
      code: null,
    };
  }
  return {
    plan: usage.plan,
    canExtract: false,
    canConvert: false,
    trialAvailable: false,
    trialConsumed: true,
    paidCredits: 0,
    maxTextPages: 0,
    maxOcrPages: 0,
    paidUnlimited: false,
    message: CUSTOMER_ERRORS.upgrade_to_continue,
    code: "trial_complete",
  };
}

export function entitlementDenied(ent: Entitlement): NextResponse {
  const status = ent.code === "trial_complete" ? 402 : 403;
  return NextResponse.json(
    { error: ent.message || CUSTOMER_ERRORS.upgrade_to_continue, code: ent.code, upgrade: true },
    { status }
  );
}

export async function countActiveJobs(actor: Actor): Promise<number> {
  if (!supabaseAdmin) return 0;
  const col = actor.type === "user" ? "user_id" : "guest_session_id";
  const val = actor.type === "user" ? actor.userId : actor.guestSessionId;
  const { count } = await supabaseAdmin
    .from("conversion_jobs")
    .select("id", { count: "exact", head: true })
    .eq(col, val)
    .in("status", ["queued", "processing", "retrying", "validating"]);
  return count ?? 0;
}

export async function createReservationAndExtraction(params: {
  actor: Actor;
  fileName: string;
  fingerprint: string;
  declaredPageCount: number;
  entitlement: Entitlement;
}): Promise<{ extractionId: string; reservationId: string } | { error: NextResponse }> {
  if (!supabaseAdmin) {
    return { error: NextResponse.json({ error: "Server configuration missing." }, { status: 503 }) };
  }

  await supabaseAdmin.rpc("expire_stale_reservations");

  const owner =
    params.actor.type === "user"
      ? { user_id: params.actor.userId, guest_session_id: null }
      : { user_id: null, guest_session_id: params.actor.guestSessionId };

  const kind = params.entitlement.paidUnlimited
    ? params.entitlement.plan === "lifetime" || params.actor.type === "user" && params.entitlement.plan !== "payg"
      ? "lifetime"
      : "paid_credit"
    : "trial";
  const reservationKind =
    params.entitlement.plan === "lifetime" || params.actor.isAdmin
      ? "lifetime"
      : params.entitlement.plan === "payg"
        ? "paid_credit"
        : "trial";

  if (reservationKind === "trial") {
    const col = params.actor.type === "user" ? "user_id" : "guest_session_id";
    const val = params.actor.type === "user" ? params.actor.userId : params.actor.guestSessionId;
    const { data: active } = await supabaseAdmin
      .from("usage_reservations")
      .select("id, extraction_id")
      .eq(col, val)
      .eq("kind", "trial")
      .eq("status", "reserved")
      .maybeSingle();
    if (active?.extraction_id) {
      const { data: existing } = await supabaseAdmin
        .from("extractions")
        .select("id, file_fingerprint, max_text_pages, max_ocr_pages, paid_unlimited, reservation_id")
        .eq("id", active.extraction_id)
        .maybeSingle();
      if (existing && existing.file_fingerprint && existing.file_fingerprint !== params.fingerprint) {
        return {
          error: NextResponse.json(
            { error: CUSTOMER_ERRORS.upgrade_to_continue, code: "trial_bound" },
            { status: 409 }
          ),
        };
      }
      if (existing) {
        return { extractionId: existing.id, reservationId: active.id };
      }
    }
  }

  const reservationId = randomUUID();
  const extractionId = randomUUID();
  const expires = new Date(Date.now() + RESERVATION_TTL_HOURS * 3600 * 1000).toISOString();

  const { error: resErr } = await supabaseAdmin.from("usage_reservations").insert({
    id: reservationId,
    ...owner,
    kind: reservationKind,
    status: "reserved",
    extraction_id: extractionId,
    expires_at: expires,
  });
  if (resErr) {
    if (/(unique|duplicate|23505)/i.test(resErr.message || "")) {
      return {
        error: NextResponse.json(
          { error: "A conversion is already in progress.", code: "active_reservation" },
          { status: 409 }
        ),
      };
    }
    console.error("[entitlement] reservation insert failed");
    return { error: NextResponse.json({ error: CUSTOMER_ERRORS.server_busy, code: "busy" }, { status: 503 }) };
  }

  const { error: exErr } = await supabaseAdmin.from("extractions").insert({
    id: extractionId,
    ...owner,
    reservation_id: reservationId,
    file_name: params.fileName.slice(0, 200),
    file_fingerprint: params.fingerprint.slice(0, 200),
    declared_page_count: params.declaredPageCount,
    max_text_pages: params.entitlement.maxTextPages,
    max_ocr_pages: params.entitlement.maxOcrPages,
    paid_unlimited: params.entitlement.paidUnlimited,
    status: "authorized",
  });
  if (exErr) {
    await supabaseAdmin.from("usage_reservations").update({ status: "released", released_at: new Date().toISOString() }).eq("id", reservationId);
    return { error: NextResponse.json({ error: CUSTOMER_ERRORS.server_busy, code: "busy" }, { status: 503 }) };
  }

  if (params.actor.type === "guest") {
    await supabaseAdmin
      .from("guest_sessions")
      .update({ bound_extraction_id: extractionId })
      .eq("id", params.actor.guestSessionId)
      .is("bound_extraction_id", null);
  }

  void kind;
  return { extractionId, reservationId };
}

export async function ownsExtraction(actor: Actor, extractionId: string) {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin.from("extractions").select("*").eq("id", extractionId).maybeSingle();
  if (!data) return null;
  if (actor.type === "user" && data.user_id === actor.userId) return data;
  if (actor.type === "guest" && data.guest_session_id === actor.guestSessionId) return data;
  return null;
}

export async function ownsJob(actor: Actor, jobId: string) {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin.from("conversion_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!data) return null;
  if (actor.type === "user" && data.user_id === actor.userId) return data;
  if (actor.type === "guest" && data.guest_session_id === actor.guestSessionId) return data;
  return null;
}
