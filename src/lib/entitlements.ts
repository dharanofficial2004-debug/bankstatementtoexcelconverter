import "server-only";
import { supabaseAdmin } from "./supabaseServer";
import type { RequestIdentity } from "./identity";

export const TRIAL_TEXT_PAGES = 3;
export const TRIAL_OCR_PAGES = 1;
export const PAID_MAX_PAGES = 100;
export const PAID_MAX_CHARS = 400_000;
export const TRIAL_MAX_CHARS_TEXT = 80_000;
export const TRIAL_MAX_CHARS_OCR = 20_000;

export type ExtractionKind = "text" | "ocr";

export interface EntitlementView {
  ownerType: "user" | "guest";
  plan: "free" | "lifetime" | "payg";
  paidCredits: number;
  conversionsUsed: number;
  trialAvailable: boolean;
  trialFinished: boolean;
  label: string;
}

export async function loadEntitlement(identity: RequestIdentity): Promise<EntitlementView> {
  if (!supabaseAdmin) {
    return {
      ownerType: identity.ownerType,
      plan: "free",
      paidCredits: 0,
      conversionsUsed: 0,
      trialAvailable: true,
      trialFinished: false,
      label: "Free trial: first 3 text pages or 1 scanned page.",
    };
  }

  if (identity.ownerType === "user" && identity.userId) {
    const { data } = await supabaseAdmin
      .from("user_usage")
      .select("conversions_used, plan, paid_credits, trial_consumed_at")
      .eq("user_id", identity.userId)
      .maybeSingle();
    const planRaw = (data?.plan as string) || "free";
    const plan = planRaw === "lifetime" || planRaw === "payg" ? planRaw : "free";
    const conversionsUsed = Number(data?.conversions_used) || 0;
    const paidCredits = Number(data?.paid_credits) || 0;
    const trialFinished = conversionsUsed > 0 || Boolean(data?.trial_consumed_at);
    return {
      ownerType: "user",
      plan,
      paidCredits,
      conversionsUsed,
      trialAvailable: plan === "lifetime" || paidCredits > 0 || !trialFinished,
      trialFinished: trialFinished && plan !== "lifetime" && paidCredits <= 0,
      label:
        plan === "lifetime"
          ? "Lifetime access"
          : paidCredits > 0
            ? `${paidCredits} conversion credit${paidCredits === 1 ? "" : "s"} remaining`
            : trialFinished
              ? "Your free trial is finished — upgrade to continue."
              : "Free trial: first 3 text pages or 1 scanned page.",
    };
  }

  const guestId = identity.guestSessionId;
  const { data: guest } = await supabaseAdmin
    .from("guest_sessions")
    .select("trial_used, linked_user_id")
    .eq("id", guestId)
    .maybeSingle();

  const { data: reserved } = await supabaseAdmin
    .from("entitlement_reservations")
    .select("id, status, job_id")
    .eq("owner_type", "guest")
    .eq("owner_id", guestId)
    .eq("kind", "trial")
    .eq("status", "reserved")
    .maybeSingle();

  const trialUsed = Boolean(guest?.trial_used);
  return {
    ownerType: "guest",
    plan: "free",
    paidCredits: 0,
    conversionsUsed: trialUsed ? 1 : 0,
    trialAvailable: !trialUsed,
    trialFinished: trialUsed && !reserved,
    label: trialUsed
      ? "Your free trial is finished — upgrade to continue."
      : "Free trial: first 3 text pages or 1 scanned page.",
  };
}

export function extractionLimits(ent: EntitlementView, kind: ExtractionKind) {
  if (ent.plan === "lifetime" || ent.paidCredits > 0) {
    return { maxPages: PAID_MAX_PAGES, maxChars: PAID_MAX_CHARS, kind, isTrial: false };
  }
  if (kind === "ocr") {
    return { maxPages: TRIAL_OCR_PAGES, maxChars: TRIAL_MAX_CHARS_OCR, kind, isTrial: true };
  }
  return { maxPages: TRIAL_TEXT_PAGES, maxChars: TRIAL_MAX_CHARS_TEXT, kind, isTrial: true };
}

