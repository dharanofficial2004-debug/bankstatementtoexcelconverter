import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAffitorServer, validAffitorClickId } from "@/lib/affitor-server";

export async function POST(request: NextRequest) {
  const affitor = getAffitorServer();
  if (!affitor) return NextResponse.json({ tracked: false }, { status: 503 });
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ tracked: false }, { status: 503 });
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    const clickId = validAffitorClickId(request.cookies.get("affitor_click_id")?.value);
    if (!clickId) return NextResponse.json({ tracked: false });
    const result = await affitor.trackLead({ customerExternalId: user.id, email: user.email, clickId });
    return NextResponse.json({ tracked: result.ok }, { status: result.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ tracked: false }, { status: 502 });
  }
}
