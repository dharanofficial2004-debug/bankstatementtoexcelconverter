export interface Transaction {
  id: string;
  date: string;
  description: string;
  chqRefNo: string;
  debit: string;
  credit: string;
  balance: string;
  [key: string]: string;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export interface SpreadsheetColumn {
  key: string;
  label: string;
  letter: string;
  width: number;
  type: "number" | "text" | "date" | "currency";
}

export interface UndoAction {
  row: number;
  col: number;
  oldValue: string;
  newValue: string;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  row: number;
  col: number;
}

export const COLUMNS: SpreadsheetColumn[] = [
  { key: "date", label: "Date", letter: "A", width: 120, type: "date" },
  { key: "description", label: "Description", letter: "B", width: 280, type: "text" },
  { key: "chqRefNo", label: "Chq/Ref. No.", letter: "C", width: 160, type: "text" },
  { key: "debit", label: "Withdrawal (Dr.)", letter: "D", width: 140, type: "currency" },
  { key: "credit", label: "Deposit (Cr.)", letter: "E", width: 140, type: "currency" },
  { key: "balance", label: "Balance", letter: "F", width: 140, type: "currency" },
];

export const GHOST_DATA: Transaction[] = [
  { id: "g1", date: "01/06/2026", description: "UPI-HDFC-John Doe", chqRefNo: "UPI-123456", debit: "2,500.00", credit: "", balance: "47,500.00" },
  { id: "g2", date: "02/06/2026", description: "NEFT-SALARY-ACME", chqRefNo: "NEFT-98765", debit: "", credit: "65,000.00", balance: "1,12,500.00" },
  { id: "g3", date: "03/06/2026", description: "ATM-CASH WITHDRAWAL", chqRefNo: "ATM-001", debit: "10,000.00", credit: "", balance: "1,02,500.00" },
  { id: "g4", date: "05/06/2026", description: "POS-AMAZON-PURCHASE", chqRefNo: "POS-456", debit: "3,299.00", credit: "", balance: "99,201.00" },
  { id: "g5", date: "07/06/2026", description: "UPI-SWIGGY", chqRefNo: "UPI-23456", debit: "450.00", credit: "", balance: "98,751.00" },
  { id: "g6", date: "10/06/2026", description: "IMPS-RENT PAYMENT", chqRefNo: "IMPS-999", debit: "15,000.00", credit: "", balance: "83,751.00" },
  { id: "g7", date: "12/06/2026", description: "NEFT-FREELANCE", chqRefNo: "NEFT-555", debit: "", credit: "25,000.00", balance: "1,08,751.00" },
  { id: "g8", date: "15/06/2026", description: "ECS-ELECTRICITY", chqRefNo: "ECS-111", debit: "2,150.00", credit: "", balance: "1,06,601.00" },
];

export interface ConvertResponse {
  success: boolean;
  bank_detected: string;
  transactions: Transaction[];
  total: number;
  pages: number;
  headers?: string[];
  error?: string;
}

export const BANK_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  HDFC: { bg: "bg-red-50", text: "text-red-800", label: "HDFC Bank" },
  SBI: { bg: "bg-blue-50", text: "text-blue-800", label: "State Bank of India" },
  ICICI: { bg: "bg-orange-50", text: "text-orange-800", label: "ICICI Bank" },
  AXIS: { bg: "bg-purple-50", text: "text-purple-800", label: "Axis Bank" },
  KOTAK: { bg: "bg-red-50", text: "text-red-700", label: "Kotak Mahindra Bank" },
  CHASE: { bg: "bg-blue-50", text: "text-blue-900", label: "Chase Bank" },
  BARCLAYS: { bg: "bg-cyan-50", text: "text-cyan-800", label: "Barclays" },
  HSBC: { bg: "bg-red-50", text: "text-red-800", label: "HSBC" },
  BOA: { bg: "bg-red-50", text: "text-red-900", label: "Bank of America" },
  WELLS_FARGO: { bg: "bg-yellow-50", text: "text-yellow-800", label: "Wells Fargo" },
  GENERIC: { bg: "bg-slate-50", text: "text-slate-700", label: "Bank detected" },
};
