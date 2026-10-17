import { NextRequest, NextResponse } from "next/server";
import { processJob } from "@/lib/workerProcess";
import { customerMessage } from "@/lib/customerErrors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = process.env.WORKER_SHARED_SECRET || "";
  const header = request.headers.get("authorization") || "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  try {
    const { jobId } = await request.json();
    if (typeof jobId !== "string") {
      return NextResponse.json({ error: "Invalid job." }, { status: 400 });
    }
    const result = await processJob(jobId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 502 });
  }
}
