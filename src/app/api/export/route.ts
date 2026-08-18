import { NextRequest, NextResponse } from "next/server";
import { exportToCsv } from "@/lib/exportCsv";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToIif } from "@/lib/exportIif";
import { Transaction } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, sheets, format } = body as {
      transactions?: Transaction[];
      sheets?: { name: string; transactions: Transaction[] }[];
      format: "csv" | "xlsx" | "json" | "iif";
    };

    const hasData = (transactions && transactions.length > 0) || (sheets && sheets.length > 0);
    if (!hasData) {
      return NextResponse.json(
        { success: false, error: "No transactions or sheets provided" },
        { status: 400 }
      );
    }

    if (!format || !["csv", "xlsx", "json", "iif"].includes(format)) {
      return NextResponse.json(
        { success: false, error: "Invalid format. Use 'csv', 'xlsx', 'json', or 'iif'." },
        { status: 400 }
      );
    }

    const date = new Date().toISOString().split("T")[0];
    
    if (format === "csv") {
      const txs = transactions || (sheets && sheets.length > 0 ? sheets[0].transactions : []);
      const csv = exportToCsv(txs);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const dataToExport = sheets && sheets.length > 0 ? sheets : (transactions || []);
      const buffer = exportToExcel(dataToExport);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.xlsx"`,
        },
      });
    }

    if (format === "json") {
      const txs = transactions || (sheets && sheets.length > 0 ? sheets[0].transactions : []);
      const jsonString = JSON.stringify(
        txs.map((tx) => {
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

    if (format === "iif") {
      const txs = transactions || (sheets && sheets.length > 0 ? sheets[0].transactions : []);
      const iifContent = exportToIif(txs);
      return new NextResponse(iifContent, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.iif"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate export file." },
      { status: 500 }
    );
  }
}
