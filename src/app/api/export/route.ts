import { NextRequest, NextResponse } from "next/server";
import { exportToCsv } from "@/lib/exportCsv";
import { exportToExcel } from "@/lib/exportExcel";
import { Transaction } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, format, headers } = body as {
      transactions: Transaction[];
      format: "csv" | "xlsx";
      headers?: string[];
    };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No transactions provided" },
        { status: 400 }
      );
    }

    if (!format || !["csv", "xlsx"].includes(format)) {
      return NextResponse.json(
        { success: false, error: "Invalid format. Use 'csv' or 'xlsx'." },
        { status: 400 }
      );
    }

    const date = new Date().toISOString().split("T")[0];
    
    if (format === "csv") {
      const csv = exportToCsv(transactions, headers);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const buffer = exportToExcel(transactions, headers);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="bankstatement_${date}.xlsx"`,
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
