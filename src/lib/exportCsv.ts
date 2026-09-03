import { Transaction } from "./types";

export function exportToCsv(transactions: Transaction[]): string {
  // UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  
  const hasCheque = transactions.some(t => t.cheque_number && t.cheque_number.trim() !== "");
  const hasCategory = transactions.some(t => t.category && t.category.trim() !== "");

  const csvHeaders = ["#", "Date", "Description", "Debit", "Credit", "Balance"];
  if (hasCheque) csvHeaders.push("Cheque Number");
  if (hasCategory) csvHeaders.push("Category");
  
  const escapeField = (field: string | number | null | undefined): string => {
    if (field === undefined || field === null) return "";
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = transactions.map((t, i) => {
    const row = [
      String(i + 1),
      escapeField(t.date),
      escapeField(t.description),
      escapeField(t.debit),
      escapeField(t.credit),
      escapeField(t.balance)
    ];
    if (hasCheque) row.push(escapeField(t.cheque_number));
    if (hasCategory) row.push(escapeField(t.category));
    return row;
  });
  
  const csv = [csvHeaders.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  
  return BOM + csv;
}
