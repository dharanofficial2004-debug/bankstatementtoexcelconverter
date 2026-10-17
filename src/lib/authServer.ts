import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "./supabaseServer";

export interface AuthedContext {
  userId: string;
  email: string | undefined;
  isAdmin: boolean;
  token: string;
}

export interface UsageContext {
  conversionsUsed: number;
  plan: "free" | "lifetime" | "payg";
  paidCredits: number;
  trialConsumed: boolean;
}

export type AuthResult =
  | { ok: true; ctx: AuthedContext }
  | { ok: false; response: NextResponse };

function unauth(message: string = "Authentication required.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message: string = "Forbidden.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function isAdminClaim(app_metadata: unknown): boolean {
  if (!app_metadata || typeof app_metadata !== "object") return false;
  const md = app_metadata as Record<string, unknown>;
  const role = md.role;
  return typeof role === "string" && role.toLowerCase() === "admin";
}

/**
 * Verify a Bearer token from a NextRequest using the Supabase admin client
 * and return the authenticated user context (including isAdmin from app_metadata.role).
 *
 * Usage:
 *   const auth = await authenticate(request);
 *   if (!auth.ok) return auth.response;
 *   const { userId, isAdmin } = auth.ctx;
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  if (!supabaseAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Server configuration missing." },
        { status: 503 }
      ),
    };
  }

  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return { ok: false, response: unauth() };
  }

  const token = header.slice(7);
  if (!token) {
    return { ok: false, response: unauth() };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      ),
    };
  }

  const user = data.user;
  return {
    ok: true,
    ctx: {
      userId: user.id,
      email: user.email,
      isAdmin: isAdminClaim(user.app_metadata),
      token,
    },
  };
}

/**
 * Same as authenticate but additionally ensures user has the admin role.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const auth = await authenticate(request);
  if (!auth.ok) return auth;
  let inTable = false;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", auth.ctx.userId)
      .maybeSingle();
    inTable = !!data;
  }
  if (!inTable) {
    return { ok: false, response: forbidden("Admin privileges required.") };
  }
  const requireAal2 = process.env.AUTH_ADMIN_REQUIRE_AAL2 === "true";
  if (requireAal2) {
    try {
      const payload = JSON.parse(Buffer.from(auth.ctx.token.split(".")[1], "base64url").toString("utf8"));
      if (payload.aal !== "aal2") {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "Administrator multi-factor authentication is required.", code: "mfa_required" },
            { status: 403 }
          ),
        };
      }
    } catch {
      return { ok: false, response: forbidden("Admin privileges required.") };
    }
  }
  return auth;
}

/**
 * Load the user's usage record. Must be called after authenticate.
 * Returns the user's plan, paid_credits, conversions_used.
 */
export async function getUsage(userId: string): Promise<UsageContext> {
  if (!supabaseAdmin) {
    return { conversionsUsed: 0, plan: "free", paidCredits: 0, trialConsumed: false };
  }
  const { data, error } = await supabaseAdmin
    .from("user_usage")
    .select("conversions_used, plan, paid_credits, trial_consumed")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { conversionsUsed: 0, plan: "free", paidCredits: 0, trialConsumed: false };
  }

  const planRaw = (data.plan ?? "free") as string;
  const plan: UsageContext["plan"] =
    planRaw === "lifetime" || planRaw === "payg" ? planRaw : "free";
  const conversionsUsed = Number(data.conversions_used) || 0;
  const trialConsumed = Boolean(data.trial_consumed) || conversionsUsed >= 1;

  return {
    conversionsUsed,
    plan,
    paidCredits: Number(data.paid_credits) || 0,
    trialConsumed,
  };
}

/**
 * Authorize that the user may perform a conversion (start a new parse).
 * Rules:
 *  - admin: always ok
 *  - plan === "lifetime": ok
 *  - conversionsUsed === 0: ok (free tier)
 *  - paidCredits > 0: ok (will be consumed atomically)
 *  - otherwise: blocked (requires payment)
 *
 * Returns:
 *   { ok: true, shouldConsumeCredit: boolean } — proceed with conversion
 *   { ok: false, response: NextResponse } — deny with 402 / 401
 */
export async function authorizeConversion(
  ctx: AuthedContext
): Promise<
  | { ok: true; shouldConsumeCredit: boolean }
  | { ok: false; response: NextResponse }
> {
  if (ctx.isAdmin) return { ok: true, shouldConsumeCredit: false };

  const usage = await getUsage(ctx.userId);
  if (usage.plan === "lifetime") return { ok: true, shouldConsumeCredit: false };
  if (usage.conversionsUsed === 0) return { ok: true, shouldConsumeCredit: false };
  if (usage.paidCredits > 0) return { ok: true, shouldConsumeCredit: true };

  return {
    ok: false,
    response: NextResponse.json(
      {
        error:
          "No conversions remaining. Please purchase credits or upgrade to lifetime access.",
      },
      { status: 402 }
    ),
  };
}

/**
 * Atomically consume one paid credit for a user.
 * Returns ok=true even when the user doesn't need to spend (lifetime/admin)
 * because the caller only invokes this when authorizeConversion returned
 * shouldConsumeCredit=true.
 *
 * Uses `paid_credits = paid_credits - 1` arithmetic update guarded by
 * `paid_credits > 0` to prevent concurrent double-spends and negatives.
 */
export async function consumeCredit(userId: string): Promise<
  | { ok: true; remaining: number }
  | { ok: false; reason: string }
> {
  if (!supabaseAdmin) {
    return { ok: false, reason: "Database not configured." };
  }

  // Supabase's Postgrest builder chains generically — use an unknown cast
  // combined with type narrowing at each call.
  const sbAny = supabaseAdmin as unknown as Record<string, unknown> & {
    rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
    from: (table: string) => unknown;
  };

  // Prefer the DB-side atomic RPC (created in migration 006).
  try {
    const { data, error } = await sbAny.rpc("consume_paid_credit", { p_user_id: userId });
    if (!error && data !== null && data !== undefined) {
      return { ok: true, remaining: Number(data) || 0 };
    }
    if (error && !/function.*does not exist|consume_paid_credit/i.test(error.message)) {
      console.warn("[authServer] consume_paid_credit RPC unexpected error:", error.message);
    }
  } catch (e) {
    console.warn("[authServer] consume_paid_credit RPC exception:", e);
  }

  // ── Fallback: CAS guarded read → write ─────────────────────────────
  for (let attempt = 0; attempt < 3; attempt++) {
    const fromChain = sbAny.from("user_usage") as {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          gte: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: { paid_credits: number } | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data: curr, error: readErr } = await fromChain
      .select("paid_credits")
      .eq("user_id", userId)
      .gte("paid_credits", 1)
      .maybeSingle();

    if (readErr || !curr) {
      return {
        ok: false,
        reason: readErr?.message ?? "No paid credits available.",
      };
    }

    const currentCredits = Number(curr.paid_credits) || 0;
    const nextCredits = Math.max(0, currentCredits - 1);

    const updateChain = sbAny.from("user_usage") as {
      update: (values: Record<string, unknown>) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            select: (cols: string) => {
              maybeSingle: () => Promise<{ data: { paid_credits: number } | null; error: { message: string } | null }>;
            };
          };
          select: (cols: string) => {
            maybeSingle: () => Promise<{ data: { paid_credits: number } | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data: updated, error: updErr } = await updateChain
      .update({ paid_credits: nextCredits, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("paid_credits", currentCredits) // CAS condition
      .select("paid_credits")
      .maybeSingle();

    if (updErr) {
      // Concurrent update likely — retry the CAS loop.
      continue;
    }
    if (!updated) {
      continue;
    }
    return { ok: true, remaining: Number(updated.paid_credits) || 0 };
  }

  return {
    ok: false,
    reason: "Too many concurrent requests — please try again.",
  };
}

/**
 * Atomically increment conversions_used for a user.
 * Always returns ok=true to avoid blocking the conversion flow;
 * failures are logged but swallowed.
 */
export async function incrementConversionsUsed(userId: string): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.rpc("increment_conversions_used", { p_user_id: userId });
  if (error) console.warn("[authServer] increment_conversions_used:", error.message);
}
