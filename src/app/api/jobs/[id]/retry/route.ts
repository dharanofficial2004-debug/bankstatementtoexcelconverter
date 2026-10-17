import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity, withIdentityHeaders } from "@/lib/identity";
import { assertJobOwner, publicJobView } from "@/lib/jobs";
import { customerMessage } from "@/lib/customerErrors";
import { processJob } from "@/lib/workerProcess";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { enqueueJob } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { identity, setCookie } = await resolveIdentity(request);
    const job = await assertJobOwner(params.id, identity);
    if (!job) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const retryAt = job.retry_after ? new Date(String(job.retry_after)).getTime() : 0;
    if (retryAt > Date.now()) {
      return withIdentityHeaders(
        NextResponse.json(
          {
            ok: false,
            error: customerMessage("too_many"),
            code: "too_many",
            retryAfterSec: Math.ceil((retryAt - Date.now()) / 1000),
            job: publicJobView(job),
          },
          { status: 429 }
        ),
        setCookie
      );
    }

    if (["queued", "processing", "retrying", "uncertain"].includes(String(job.status))) {
      const outcome = await processJob(params.id);
      if (outcome.code === "uncertain") {
        return withIdentityHeaders(
          NextResponse.json({
            ok: true,
            job: publicJobView(job),
            message: customerMessage("server_busy"),
          }),
          setCookie
        );
      }
    }

    if (job.status === "failed" && supabaseAdmin) {
      await supabaseAdmin
        .from("job_chunks")
        .update({ status: "pending" })
        .eq("job_id", params.id)
        .eq("status", "failed");
      await supabaseAdmin
        .from("conversion_jobs")
        .update({ status: "queued", progress_stage: "queued", last_error_code: null })
        .eq("id", params.id);
      await enqueueJob(params.id);
    }

    return withIdentityHeaders(NextResponse.json({ ok: true, message: customerMessage("queued") }), setCookie);
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 503 });
  }
}
