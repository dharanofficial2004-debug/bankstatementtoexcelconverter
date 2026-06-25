import { Transaction } from "./types";

export function exportToCsv(transactions: Transaction[]): string {
  // UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  
  const csvHeaders = ["#", "Date", "Description", "Debit", "Credit", "Balance"];
  
  const escapeField = (field: string | number | null | undefined): string => {
    if (field === undefined || field === null) return "";
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = transactions.map((t, i) => {
    return [
      String(i + 1),
      escapeField(t.date),
      escapeField(t.description),
      escapeField(t.debit),
      escapeField(t.credit),
      escapeField(t.balance)
    ];
  });
  
  const csv = [csvHeaders.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  
  return BOM + csv;
}
