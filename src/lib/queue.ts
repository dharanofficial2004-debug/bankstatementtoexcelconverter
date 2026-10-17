import "server-only";
import { supabaseAdmin } from "./supabaseServer";

function workerUrl() {
  const base = process.env.WORKER_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return `${base.replace(/\/$/, "")}/api/internal/worker`;
}

function workerSecret() {
  return process.env.WORKER_SHARED_SECRET || "";
}

export async function enqueueJob(jobId: string): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("job_outbox").insert({
    job_id: jobId,
    payload: { jobId },
    status: "pending",
  });
  const secret = workerSecret();
  const url = workerUrl();
  if (process.env.CLOUD_TASKS_QUEUE && process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.CLOUD_TASKS_LOCATION) {
    await enqueueCloudTask(jobId);
    return;
  }
  if (secret && url.startsWith("http")) {
    void fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ jobId }),
    }).catch(() => {
      /* outbox drain retries */
    });
  }
}

async function enqueueCloudTask(jobId: string) {
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID!;
  const location = process.env.CLOUD_TASKS_LOCATION!;
  const queue = process.env.CLOUD_TASKS_QUEUE!;
  const { getVertexAccessToken } = await import("./vertexGemini");
  const token = await getVertexAccessToken();
  const parent = `projects/${project}/locations/${location}/queues/${queue}`;
  const body = JSON.stringify({ jobId });
  const oidcEmail = process.env.CLOUD_TASKS_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const task = {
    httpRequest: {
      httpMethod: "POST",
      url: workerUrl(),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerSecret()}`,
      },
      body: Buffer.from(body).toString("base64"),
      ...(oidcEmail
        ? { oidcToken: { serviceAccountEmail: oidcEmail, audience: workerUrl() } }
        : {}),
    },
  };
  const res = await fetch(`https://cloudtasks.googleapis.com/v2/${parent}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task }),
  });
  if (!res.ok) {
    console.error("[cloud-tasks] enqueue failed", res.status);
  } else if (supabaseAdmin) {
    await supabaseAdmin
      .from("job_outbox")
      .update({ status: "sent" })
      .eq("job_id", jobId)
      .eq("status", "pending");
  }
}

export async function drainOutbox(limit = 10) {
  if (!supabaseAdmin) return 0;
  await supabaseAdmin.rpc("expire_abandoned_reservations");
  await supabaseAdmin.rpc("purge_expired_job_payloads");

  // 1. Stale-lease recovery: reset processing jobs with expired leases to queued
  await supabaseAdmin
    .from("conversion_jobs")
    .update({ status: "queued", lease_owner: null, lease_expires_at: null, progress_stage: "queued" })
    .eq("status", "processing")
    .lt("lease_expires_at", new Date().toISOString());

  // 2. Uncertain-state recovery: after 120s, reset uncertain chunks/jobs to retrying
  const uncertainCutoff = new Date(Date.now() - 120_000).toISOString();
  const { data: uncertainJobs } = await supabaseAdmin
    .from("conversion_jobs")
    .select("id")
    .eq("status", "uncertain")
    .lt("updated_at", uncertainCutoff);

  for (const uj of uncertainJobs || []) {
    await supabaseAdmin
      .from("job_chunks")
      .update({ status: "failed" })
      .eq("job_id", uj.id)
      .eq("status", "uncertain");
    await supabaseAdmin
      .from("conversion_jobs")
      .update({ status: "retrying", progress_stage: "retrying", retry_after: new Date().toISOString() })
      .eq("id", uj.id)
      .eq("status", "uncertain");
    // Insert outbox row for redispatch
    await supabaseAdmin.from("job_outbox").insert({
      job_id: uj.id,
      payload: { jobId: uj.id },
      status: "pending",
      next_attempt_at: new Date().toISOString(),
    });
  }

  const { data: rows } = await supabaseAdmin
    .from("job_outbox")
    .select("id, job_id, attempts")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .limit(limit);
  let n = 0;
  for (const row of rows || []) {
    const secret = workerSecret();
    const url = workerUrl();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ jobId: row.job_id }),
      });
      await supabaseAdmin
        .from("job_outbox")
        .update({
          status: res.ok ? "sent" : "pending",
          attempts: (row.attempts || 0) + 1,
          next_attempt_at: new Date(Date.now() + Math.min(15 * 60_000, 2 ** (row.attempts || 0) * 4000)).toISOString(),
          last_error: res.ok ? null : `http_${res.status}`,
        })
        .eq("id", row.id);
      n += 1;
    } catch {
      await supabaseAdmin
        .from("job_outbox")
        .update({
          attempts: (row.attempts || 0) + 1,
          next_attempt_at: new Date(Date.now() + 15000).toISOString(),
          last_error: "fetch_failed",
        })
        .eq("id", row.id);
    }
  }
  return n;
}
