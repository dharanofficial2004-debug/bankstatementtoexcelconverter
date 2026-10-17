import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, withIdentityHeaders } from "@/lib/identity";
import { assertJobOwner, publicJobView } from "@/lib/jobs";
import { customerMessage } from "@/lib/customerErrors";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const job = await assertJobOwner(params.id, identity);
    if (!job) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    // NOTE: processJob() auto-trigger removed — conversion is now synchronous.
    // /api/convert calls Gemini directly and writes status="ready" before returning.
    // No background worker dispatch needed here.
    return withIdentityHeaders(NextResponse.json({ ok: true, job: publicJobView(job) }), setCookie);
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 503 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { identity } = await resolveIdentity(request);
    const job = await assertJobOwner(params.id, identity);
    if (!job || job.status !== "ready") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const body = await request.json();
    if (!supabaseAdmin) return NextResponse.json({ error: "unconfigured" }, { status: 503 });
    if (body.sheets || body.transactions) {
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ edited_result_json: body, updated_at: new Date().toISOString() })
        .eq("id", params.id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 503 });
  }
}
