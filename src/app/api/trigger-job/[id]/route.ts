import { NextRequest, NextResponse } from "next/server";
import { processJob } from "@/lib/workerProcess";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await processJob(params.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: String(error) 
    }, { status: 500 });
  }
}