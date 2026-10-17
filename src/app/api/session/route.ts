import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, withIdentityHeaders } from "@/lib/identity";
import { loadEntitlement } from "@/lib/entitlements";
import { customerMessage } from "@/lib/customerErrors";
import { sanitizeAttribution } from "@/lib/attribution";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const ent = await loadEntitlement(identity);
    return withIdentityHeaders(
      NextResponse.json({
        ownerType: identity.ownerType,
        plan: ent.plan,
        paidCredits: ent.paidCredits,
        trialAvailable: ent.trialAvailable,
        trialFinished: ent.trialFinished,
        label: ent.label,
        conversionsUsed: ent.conversionsUsed,
      }),
      setCookie
    );
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;
    const city = request.headers.get("x-vercel-ip-city")
      ? decodeURIComponent(request.headers.get("x-vercel-ip-city")!)
      : null;
    const region = request.headers.get("x-vercel-ip-country-region") || null;
    const touch = sanitizeAttribution(body, "/api/session", country?.toLowerCase() || null);
    if (supabaseAdmin && identity.guestSessionId) {
      await supabaseAdmin.from("guest_attribution").upsert({
        guest_session_id: identity.guestSessionId,
        last_touch: touch,
        last_captured_at: touch.captured_at,
        country_code: country,
        city,
        region,
      });
      const { data: existing } = await supabaseAdmin
        .from("guest_attribution")
        .select("first_touch")
        .eq("guest_session_id", identity.guestSessionId)
        .maybeSingle();
      if (!existing?.first_touch || Object.keys(existing.first_touch as object).length === 0) {
        await supabaseAdmin
          .from("guest_attribution")
          .update({ first_touch: touch, first_captured_at: touch.captured_at })
          .eq("guest_session_id", identity.guestSessionId);
      }
    }
    if (supabaseAdmin && identity.userId) {
      const { data: existing } = await supabaseAdmin
        .from("user_attribution")
        .select("user_id, first_touch")
        .eq("user_id", identity.userId)
        .maybeSingle();
      if (!existing) {
        await supabaseAdmin.from("user_attribution").insert({
          user_id: identity.userId,
          guest_session_id: identity.guestSessionId ?? null,
          first_touch: touch,
          last_touch: touch,
          signup_path: touch.signup_path,
          acquisition_country: touch.acquisition_country,
          city,
          region,
        });
      } else {
        await supabaseAdmin
          .from("user_attribution")
          .update({ last_touch: touch, last_captured_at: touch.captured_at, city, region })
          .eq("user_id", identity.userId);
      }
    }
    return withIdentityHeaders(NextResponse.json({ ok: true }), setCookie);
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
