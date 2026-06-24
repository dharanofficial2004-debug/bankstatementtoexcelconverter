import * as XLSX from "xlsx";
import { Transaction } from "./types";

export function exportToExcel(transactions: Transaction[], headers?: string[]): Buffer {
  const workbook = XLSX.utils.book_new();
  
  let data: any[];
  let colWidths: { wch: number }[] = [];

  if (headers && headers.length > 0) {
    // Dynamic headers mapping
    data = transactions.map((t, i) => {
      const row: Record<string, any> = {
        "#": i + 1,
      };
      headers.forEach((h, idx) => {
        const val = t[`col${idx}`] !== undefined ? t[`col${idx}`] : "";
        // If it looks like a number, parse it
        const cleaned = val.replace(/,/g, "").trim();
        if (cleaned && !isNaN(Number(cleaned)) && /^-?\d+(\.\d+)?$/.test(cleaned)) {
          row[h] = parseFloat(cleaned);
        } else {
          row[h] = val;
        }
      });
      return row;
    });

    // Set dynamic column widths
    colWidths = [
      { wch: 5 }, // #
      ...headers.map(h => {
        const lowerH = h.toLowerCase();
        if (lowerH.includes("description") || lowerH.includes("particulars") || lowerH.includes("narrative")) {
          return { wch: 45 };
        }
        if (lowerH.includes("date")) {
          return { wch: 12 };
        }
        if (
          lowerH.includes("amount") ||
          lowerH.includes("debit") ||
          lowerH.includes("credit") ||
          lowerH.includes("balance") ||
          lowerH.includes("withdrawal") ||
          lowerH.includes("deposit")
        ) {
          return { wch: 15 };
        }
        return { wch: Math.max(12, h.length + 2) };
      })
    ];
  } else {
    // Default headers mapping
    data = transactions.map((t, i) => ({
      "#": i + 1,
      "Date": t.date,
      "Description": t.description,
      "Debit": t.debit ? parseFloat(t.debit.replace(/,/g, "")) : "",
      "Credit": t.credit ? parseFloat(t.credit.replace(/,/g, "")) : "",
      "Balance": t.balance ? parseFloat(t.balance.replace(/,/g, "")) : "",
    }));

    colWidths = [
      { wch: 5 },   // #
      { wch: 12 },  // Date
      { wch: 45 },  // Description
      { wch: 15 },  // Debit
      { wch: 15 },  // Credit
      { wch: 15 },  // Balance
    ];
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Statement");
  
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  
  return buffer;
}
