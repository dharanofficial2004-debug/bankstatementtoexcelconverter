import type { Sheet, Transaction } from "./types";

const PREFIX = "statementtoexcel:conversion:";

export interface ConversionSnapshot {
  sheets: Sheet[];
  activeSheetId: string;
  fileName: string;
  createdAt: number;
  summary: ConversionSummary;
}

export interface ConversionSummary {
  totalTransactions: number;
  totalDebit: number;
  totalCredit: number;
  openingBalance: number;
  closingBalance: number;
  bankName: string | null;
  currencySymbol: string;
}

export function calculateConversionSummary(transactions: Transaction[], bankName: string | null, currencySymbol: string): ConversionSummary {
  let totalDebit = 0, totalCredit = 0, openingBalance = 0, closingBalance = 0;
  for (const tx of transactions) {
    totalDebit += parseFloat(String(tx.debit || "").replace(/,/g, "")) || 0;
    totalCredit += parseFloat(String(tx.credit || "").replace(/,/g, "")) || 0;
  }
  if (transactions.length) {
    const first = transactions.find((tx) => tx.description.toLowerCase().includes("opening balance")) || transactions.find((tx) => tx.balance && !isNaN(parseFloat(String(tx.balance).replace(/,/g, ""))));
    if (first) {
      const balance = parseFloat(String(first.balance).replace(/,/g, "")) || 0;
      const credit = parseFloat(String(first.credit).replace(/,/g, "")) || 0;
      const debit = parseFloat(String(first.debit).replace(/,/g, "")) || 0;
      openingBalance = first.description.toLowerCase().includes("opening balance") ? balance : balance - credit + debit;
    }
    const last = [...transactions].reverse().find((tx) => tx.balance && !isNaN(parseFloat(String(tx.balance).replace(/,/g, ""))));
    closingBalance = last ? parseFloat(String(last.balance).replace(/,/g, "")) || 0 : openingBalance + totalCredit - totalDebit;
  }
  return { totalTransactions: transactions.length, totalDebit, totalCredit, openingBalance, closingBalance, bankName, currencySymbol };
}

export function createConversionId(): string {
  return crypto.randomUUID();
}

export function saveConversionSnapshot(id: string, snapshot: ConversionSnapshot): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(`${PREFIX}${id}`, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function loadConversionSnapshot(id: string): ConversionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${id}`);
    if (!raw) return null;
    const value = JSON.parse(raw) as ConversionSnapshot;
    if (!Array.isArray(value.sheets) || !value.activeSheetId) return null;
    return value;
  } catch {
    return null;
  }
}

export function saveLatestConversion(id: string): void {
  if (typeof window !== "undefined") localStorage.setItem("statementtoexcel:latest", id);
}
