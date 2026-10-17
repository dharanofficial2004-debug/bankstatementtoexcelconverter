import { NextRequest, NextResponse } from "next/server";
import { exportToCsv } from "@/lib/exportCsv";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToIif } from "@/lib/exportIif";
import { Transaction } from "@/lib/types";
import { resolveIdentity } from "@/lib/identity";
import { assertJobOwner } from "@/lib/jobs";
import { customerMessage } from "@/lib/customerErrors";
import { trackEvent } from "@/lib/analyticsServer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { identity } = await resolveIdentity(request);
    const body = await request.json();
    const jobId = typeof body.jobId === "string" ? body.jobId : "";
    const format = body.format as "csv" | "xlsx" | "json" | "iif";
    if (!jobId || !["csv", "xlsx", "json", "iif"].includes(format)) {
      return NextResponse.json({ error: customerMessage("convert_failed") }, { status: 400 });
    }
    if (identity.ownerType === "guest") {
      return NextResponse.json(
        { error: customerMessage("sign_in_download"), code: "save_progress" },
        { status: 401 }
      );
    }
    const job = await assertJobOwner(jobId, identity);
    if (!job || job.status !== "ready") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    // Track export — fire-and-forget
    trackEvent({
      eventType: "export",
      request,
      ownerType: identity.ownerType,
      ownerId: identity.ownerId,
      userId: identity.userId ?? null,
      guestSessionId: identity.guestSessionId ?? null,
      metadata: { format, jobId },
    });
    const payload = (job.edited_result_json as { sheets?: { name: string; transactions: Transaction[] }[]; transactions?: Transaction[] }) ||
      (job.result_json as { transactions?: Transaction[] });
    const transactions = payload?.transactions || payload?.sheets?.[0]?.transactions || [];
    const sheets = payload?.sheets;
    if (!transactions.length && !sheets?.length) {
      return NextResponse.json({ error: customerMessage("convert_failed") }, { status: 400 });
    }
    const date = new Date().toISOString().split("T")[0];
    if (format === "csv") {
      return new NextResponse(exportToCsv(transactions), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.csv"`,
        },
      });
    }
    if (format === "xlsx") {
      const buffer = exportToExcel(sheets && sheets.length ? sheets : transactions);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.xlsx"`,
        },
      });
    }
    if (format === "json") {
      const jsonString = JSON.stringify(
        transactions.map((tx) => {
          const rest: Partial<Transaction> = { ...tx };
          delete rest.id;
          return rest;
        }),
        null,
        2
      );
      return new NextResponse(jsonString, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.json"`,
        },
      });
    }
    return new NextResponse(exportToIif(transactions), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="bankstatement_${date}.iif"`,
      },
    });
  } catch {
    return NextResponse.json({ error: customerMessage("server_busy") }, { status: 503 });
  }
}
