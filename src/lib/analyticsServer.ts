import "server-only";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseServer";
import { hashSecretValue, clientIp } from "./identity";

export type EventType =
  | "page_view"
  | "upload"
  | "extract"
  | "convert"
  | "export"
  | "signup"
  | "download";

export interface GeoInfo {
  country: string | null;
  city: string | null;
  region: string | null;
}

/** Read Vercel's free geo headers from any server request. Zero cost, zero latency. */
export function getGeo(request: NextRequest): GeoInfo {
  return {
    country: request.headers.get("x-vercel-ip-country") || null,
    city: request.headers.get("x-vercel-ip-city")
      ? decodeURIComponent(request.headers.get("x-vercel-ip-city")!)
      : null,
    region: request.headers.get("x-vercel-ip-country-region") || null,
  };
}

/**
 * Fire-and-forget analytics event write.
 * Never awaited on the hot path — zero performance impact.
 */
export function trackEvent(params: {
  eventType: EventType;
  request: NextRequest;
  ownerType?: "user" | "guest" | "anonymous";
  ownerId?: string | null;
  userId?: string | null;
  guestSessionId?: string | null;
  page?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!supabaseAdmin) return;
  const geo = getGeo(params.request);
  const ip = clientIp(params.request);
  const ipHash = hashSecretValue(`ip:${ip}`);

  // Deliberately void — does not block the response
  void supabaseAdmin.from("analytics_events").insert({
    event_type: params.eventType,
    page: params.page ?? null,
    owner_type: params.ownerType ?? "anonymous",
    owner_id: params.ownerId ?? null,
    user_id: params.userId ?? null,
    guest_session_id: params.guestSessionId ?? null,
    country_code: geo.country,
    city: geo.city,
    region: geo.region,
    ip_hash: ipHash,
    metadata: params.metadata ?? {},
  });
}
