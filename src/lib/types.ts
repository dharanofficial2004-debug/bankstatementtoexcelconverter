export interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  cheque_number?: string;
  upi_reference?: string;
  [key: string]: string | undefined;
}

export interface Sheet {
  id: string;
  name: string;
  transactions: Transaction[];
  bankDetected: string | null;
  currencySymbol: string;
  headers: string[];
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
  transactionId?: string;
  colKey?: string;
  oldValue?: string;
  newValue?: string;
  batch?: {
    transactionId: string;
    colKey: string;
    oldValue: string;
    newValue: string;
  }[];
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
  { key: "description", label: "Description", letter: "B", width: 350, type: "text" },
  { key: "debit", label: "Debit", letter: "C", width: 140, type: "currency" },
  { key: "credit", label: "Credit", letter: "D", width: 140, type: "currency" },
  { key: "balance", label: "Balance", letter: "E", width: 140, type: "currency" },
  { key: "cheque_number", label: "Cheque Number", letter: "F", width: 140, type: "text" },
  { key: "upi_reference", label: "UPI Reference", letter: "G", width: 180, type: "text" },
];

export const GHOST_DATA: Transaction[] = [
  { id: "g1", date: "2026-06-01", description: "UPI-HDFC-John Doe", debit: "2,500.00", credit: "", balance: "47,500.00" },
  { id: "g2", date: "2026-06-02", description: "NEFT-SALARY-ACME", debit: "", credit: "65,000.00", balance: "1,12,500.00" },
  { id: "g3", date: "2026-06-03", description: "ATM-CASH WITHDRAWAL", debit: "10,000.00", credit: "", balance: "1,02,500.00" },
  { id: "g4", date: "2026-06-05", description: "POS-AMAZON-PURCHASE", debit: "3,299.00", credit: "", balance: "99,201.00" },
  { id: "g5", date: "2026-06-07", description: "UPI-SWIGGY", debit: "450.00", credit: "", balance: "98,751.00" },
  { id: "g6", date: "2026-06-10", description: "IMPS-RENT PAYMENT", debit: "15,000.00", credit: "", balance: "83,751.00" },
  { id: "g7", date: "2026-06-12", description: "NEFT-FREELANCE", debit: "", credit: "25,000.00", balance: "1,08,751.00" },
  { id: "g8", date: "2026-06-15", description: "ECS-ELECTRICITY", debit: "2,150.00", credit: "", balance: "1,06,601.00" },
];

export interface ConvertResponse {
  success: boolean;
  bank_detected: string;
  currency_symbol: string;
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
