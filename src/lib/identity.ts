import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "./supabaseServer";
import { authenticate, type AuthedContext } from "./authServer";

export const GUEST_COOKIE = "ste_gst";
const GUEST_MAX_AGE = 60 * 60 * 24 * 30;

export type OwnerType = "user" | "guest";

export type Actor =
  | { type: "user"; userId: string; isAdmin: boolean }
  | { type: "guest"; guestSessionId: string; isAdmin: boolean };

export interface RequestIdentity {
  ownerType: OwnerType;
  ownerId: string;
  userId?: string;
  guestSessionId?: string;
  email?: string;
  isAdmin: boolean;
  ipHash: string;
  uaHash: string;
  token?: string;
}

function cookieSecret() {
  return process.env.GUEST_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function hashSecretValue(value: string): string {
  return crypto.createHmac("sha256", cookieSecret() || "dev").update(value).digest("hex");
}

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export function signGuestToken(sessionId: string): string {
  const sig = hashSecretValue(`guest:${sessionId}`);
  return `${sessionId}.${sig}`;
}

export function parseGuestToken(raw: string | undefined): string | null {
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const expected = hashSecretValue(`guest:${id}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return id;
}

function cookieHeader(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${GUEST_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${GUEST_MAX_AGE}${secure}`;
}

export async function resolveIdentity(
  request: NextRequest
): Promise<{ identity: RequestIdentity; setCookie?: string }> {
  const ip = clientIp(request);
  const ua = request.headers.get("user-agent") || "";
  const ipHash = hashSecretValue(`ip:${ip}`);
  const uaHash = hashSecretValue(`ua:${ua}`);

  const auth = await authenticate(request);
  if (auth.ok) {
    const guestSessionId = parseGuestToken(request.cookies.get(GUEST_COOKIE)?.value);
    let linkedGuestSessionId: string | undefined;
    if (guestSessionId && supabaseAdmin) {
      const { data: guestSession } = await supabaseAdmin
        .from("guest_sessions")
        .select("id, linked_user_id")
        .eq("id", guestSessionId)
        .maybeSingle();
      if (!guestSession?.linked_user_id || guestSession.linked_user_id === auth.ctx.userId) {
        linkedGuestSessionId = guestSession?.id;
      }
    }
    return {
      identity: {
        ownerType: "user",
        ownerId: auth.ctx.userId,
        userId: auth.ctx.userId,
        guestSessionId: linkedGuestSessionId,
        email: auth.ctx.email,
        isAdmin: auth.ctx.isAdmin,
        ipHash,
        uaHash,
        token: auth.ctx.token,
      },
    };
  }

  if (!supabaseAdmin) {
    throw new Error("unconfigured");
  }

  const existingId = parseGuestToken(request.cookies.get(GUEST_COOKIE)?.value);
  if (existingId) {
    const { data } = await supabaseAdmin
      .from("guest_sessions")
      .select("id, linked_user_id")
      .eq("id", existingId)
      .maybeSingle();
    if (data?.linked_user_id) {
      return {
        identity: {
          ownerType: "user",
          ownerId: data.linked_user_id,
          userId: data.linked_user_id,
          guestSessionId: data.id,
          isAdmin: false,
          ipHash,
          uaHash,
        },
      };
    }
    if (data?.id) {
      return {
        identity: {
          ownerType: "guest",
          ownerId: data.id,
          guestSessionId: data.id,
          isAdmin: false,
          ipHash,
          uaHash,
        },
      };
    }
  }

  const cookieHash = hashSecretValue(`new:${ipHash}:${uaHash}:${Date.now()}:${crypto.randomUUID()}`);
  const countryCode = request.headers.get("x-vercel-ip-country") || null;
  const city = request.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(request.headers.get("x-vercel-ip-city")!)
    : null;
  const region = request.headers.get("x-vercel-ip-country-region") || null;

  const { data: created, error } = await supabaseAdmin
    .from("guest_sessions")
    .insert({
      ip_hash: ipHash,
      user_agent_hash: uaHash,
      cookie_hash: cookieHash,
      country_code: countryCode,
      city,
      region,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("guest_create_failed");
  }

  return {
    identity: {
      ownerType: "guest",
      ownerId: created.id,
      guestSessionId: created.id,
      isAdmin: false,
      ipHash,
      uaHash,
    },
    setCookie: cookieHeader(signGuestToken(created.id)),
  };
}

export function withIdentityHeaders(response: NextResponse, setCookie?: string) {
  if (setCookie) response.headers.append("Set-Cookie", setCookie);
  return response;
}

export async function requireAdminUser(request: NextRequest): Promise<
  { ok: true; ctx: AuthedContext } | { ok: false; response: NextResponse }
> {
  const auth = await authenticate(request);
  if (!auth.ok) return auth;
  if (!supabaseAdmin) {
    return { ok: false, response: NextResponse.json({ error: "Server configuration missing." }, { status: 503 }) };
  }
  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", auth.ctx.userId)
    .maybeSingle();
  const dbAdmin = Boolean(data?.user_id);
  if (!dbAdmin) {
    return { ok: false, response: NextResponse.json({ error: "Admin privileges required." }, { status: 403 }) };
  }
  if (process.env.ADMIN_REQUIRE_AAL2 === "true") {
    try {
      const payload = JSON.parse(Buffer.from(auth.ctx.token.split(".")[1], "base64url").toString("utf8")) as { aal?: string };
      if (payload.aal !== "aal2") {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "Multi-factor authentication is required for admin access." },
            { status: 401 }
          ),
        };
      }
    } catch {
      return { ok: false, response: NextResponse.json({ error: "Admin privileges required." }, { status: 403 }) };
    }
  }
  return { ok: true, ctx: { ...auth.ctx, isAdmin: true } };
}

export async function writeAdminAudit(actorId: string, action: string, targetType?: string, targetId?: string, reason?: string, metadata?: Record<string, unknown>) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("admin_audit").insert({
    actor_id: actorId,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    reason: reason ?? null,
    metadata: metadata ?? {},
  });
}
