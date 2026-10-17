import { NextRequest, NextResponse } from "next/server";
import { drainOutbox } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = process.env.WORKER_SHARED_SECRET || "";
  const header = request.headers.get("authorization") || "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const drained = await drainOutbox(20);
  return NextResponse.json({ ok: true, drained });
}

// Vercel Cron also calls GET /api/internal/outbox
// Vercel Cron automatically adds Authorization: Bearer {CRON_SECRET}
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || "";
  const header = request.headers.get("authorization") || "";
  const workerSecret = process.env.WORKER_SHARED_SECRET || "";
  if (
    (!cronSecret || header !== `Bearer ${cronSecret}`) &&
    (!workerSecret || header !== `Bearer ${workerSecret}`)
  ) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const drained = await drainOutbox(20);
  return NextResponse.json({ ok: true, drained });
}
