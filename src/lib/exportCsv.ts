import { Transaction } from "./types";

export function exportToCsv(transactions: Transaction[], headers?: string[]): string {
  // UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  
  const csvHeaders = ["#", ...(headers && headers.length > 0 ? headers : ["Date", "Description", "Chq/Ref. No.", "Withdrawal", "Deposit", "Balance"])];
  
  const escapeField = (field: string): string => {
    if (!field) return "";
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = transactions.map((t, i) => {
    const row = [String(i + 1)];
    if (headers && headers.length > 0) {
      headers.forEach((_, idx) => {
        row.push(escapeField(t[`col${idx}`] !== undefined ? t[`col${idx}`] : ""));
      });
    } else {
      row.push(
        escapeField(t.date),
        escapeField(t.description),
        escapeField(t.chqRefNo),
        escapeField(t.debit),
        escapeField(t.credit),
        escapeField(t.balance)
      );
    }
    return row;
  });
  
  const csv = [csvHeaders.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  
  return BOM + csv;
}
