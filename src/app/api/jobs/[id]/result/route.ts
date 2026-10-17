import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, withIdentityHeaders } from "@/lib/identity";
import { assertJobOwner } from "@/lib/jobs";
import { customerMessage } from "@/lib/customerErrors";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const job = await assertJobOwner(params.id, identity);
    if (!job || job.status !== "ready") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const result = (job.edited_result_json as object) || (job.result_json as object) || {};
    return withIdentityHeaders(
      NextResponse.json({
        ok: true,
        jobId: job.id,
        filename: job.filename,
        supportRef: job.support_ref,
        notices: job.validation_notices || [],
        result,
      }),
      setCookie
    );
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 503 });
  }
}
