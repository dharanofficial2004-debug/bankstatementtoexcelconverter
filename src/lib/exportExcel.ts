import * as XLSX from "xlsx";
import { Transaction } from "./types";

export interface ExcelSheetInput {
  name: string;
  transactions: Transaction[];
}

export function exportToExcel(transactionsOrSheets: Transaction[] | ExcelSheetInput[]): Buffer {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  const isMultiSheet = Array.isArray(transactionsOrSheets) && 
                       transactionsOrSheets.length > 0 && 
                       "transactions" in (transactionsOrSheets[0] as Record<string, unknown>);

  const sheetsData = isMultiSheet 
    ? (transactionsOrSheets as ExcelSheetInput[]) 
    : [{ name: "Bank Statement", transactions: transactionsOrSheets as Transaction[] }];

  sheetsData.forEach((s) => {
    // Standard headers mapping
    const data = s.transactions.map((t, i) => ({
      "#": i + 1,
      "Date": t.date,
      "Description": t.description,
      "Debit": t.debit ? parseFloat(String(t.debit).replace(/,/g, "")) || t.debit : "",
      "Credit": t.credit ? parseFloat(String(t.credit).replace(/,/g, "")) || t.credit : "",
      "Balance": t.balance ? parseFloat(String(t.balance).replace(/,/g, "")) || t.balance : "",
    }));

    const colWidths = [
      { wch: 5 },   // #
      { wch: 12 },  // Date
      { wch: 45 },  // Description
      { wch: 15 },  // Debit
      { wch: 15 },  // Credit
      { wch: 15 },  // Balance
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = colWidths;
    
    // Ensure sheet name is unique and valid (max 31 chars, no invalid chars like :, ?, *, /, \)
    const baseName = s.name
      .replace(/[:\?\*\/\\\[\]]/g, "")
      .substring(0, 31) || "Sheet";
    
    let safeName = baseName;
    let counter = 1;
    while (usedNames.has(safeName.toLowerCase())) {
      const suffix = `_${counter}`;
      const maxBaseLen = 31 - suffix.length;
      safeName = baseName.substring(0, maxBaseLen) + suffix;
      counter++;
    }
    usedNames.add(safeName.toLowerCase());
    
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  });
  
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  
  return buffer;
}
