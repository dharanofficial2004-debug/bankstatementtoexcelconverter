"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Sheet, Transaction } from "@/lib/types";
import { calculateConversionSummary, loadConversionSnapshot, saveConversionSnapshot } from "@/lib/conversionSession";
const loadSupabase = () => import("@/lib/supabase");

const Spreadsheet = dynamic(() => import("./Spreadsheet"), { ssr: false });
const LoginModal = dynamic(() => import("./LoginModal"), { ssr: false });

type Format = "csv" | "xlsx" | "json" | "iif";

export default function PreviewWorkspace({ conversionId }: { conversionId: string }) {
  const { showToast } = useToast();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState("");
  const [fileName, setFileName] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [pendingExport, setPendingExport] = useState<Format | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof calculateConversionSummary> | null>(null);
  const active = useMemo(() => sheets.find((sheet) => sheet.id === activeSheetId) ?? null, [sheets, activeSheetId]);
  const transactions = active?.transactions ?? [];

  useEffect(() => {
    const snapshot = loadConversionSnapshot(conversionId);
    if (snapshot) {
      setSheets(snapshot.sheets);
      setActiveSheetId(snapshot.activeSheetId);
      setFileName(snapshot.fileName);
      setSummary(snapshot.summary ?? calculateConversionSummary(snapshot.sheets[0]?.transactions ?? [], snapshot.sheets[0]?.bankDetected ?? null, snapshot.sheets[0]?.currencySymbol || "₹"));
    }
    setLoaded(true);
  }, [conversionId]);

  useEffect(() => {
    if (!sheets.length || !activeSheetId) return;
    saveConversionSnapshot(conversionId, { sheets, activeSheetId, fileName, createdAt: Date.now(), summary: summary ?? calculateConversionSummary(transactions, active?.bankDetected ?? null, active?.currencySymbol || "₹") });
  }, [conversionId, sheets, activeSheetId, fileName, summary, transactions, active]);

  const handleTransactionsChange = useCallback((updated: Transaction[]) => {
    setSheets((current) => current.map((sheet) => sheet.id === activeSheetId ? { ...sheet, transactions: updated } : sheet));
    setSummary((current) => calculateConversionSummary(updated, current?.bankName ?? active?.bankDetected ?? null, current?.currencySymbol ?? active?.currencySymbol ?? "₹"));
  }, [activeSheetId, active]);

  const exportFile = async (format: Format) => {
    if (!active || !transactions.length) return;
    try {
      const { supabase, isSupabaseConfigured } = await loadSupabase();
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setPendingExport(format);
          setShowLogin(true);
          return;
        }
      }
      const payload = format === "xlsx"
        ? { sheets: sheets.map((sheet) => ({ name: sheet.name, transactions: sheet.transactions })), format }
        : { transactions, format };
      const response = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bankstatement_${new Date().toISOString().slice(0, 10)}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Downloaded successfully ✓", "success");
    } catch {
      showToast("Export failed. Please try again.", "error");
    }
  };

  if (!loaded) return <div className="min-h-screen bg-slate-50" />;
  if (!active) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-6"><h1 className="text-xl font-bold text-slate-900">Preview expired</h1><Link href="/app" className="btn-primary">Start a new conversion</Link></div>;

  return <div className="flex flex-col h-screen bg-slate-50">
    <nav className="flex items-center h-14 px-4 bg-white border-b border-slate-200 gap-3">
      <Link href="/app" className="flex items-center gap-2 text-slate-800"><ChevronLeft size={18} /><FileSpreadsheet size={20} className="text-primary-600" /><span className="font-bold text-sm">StatementToExcel</span></Link>
      <span className="truncate text-sm text-slate-500">{fileName}</span>
      <div className="flex-1" />
      <button onClick={() => setShowLogin(true)} className="text-sm text-slate-600">Sign in</button>
      <div className="flex gap-1">
        {(["xlsx", "csv", "iif", "json"] as Format[]).map((format) => <button key={format} onClick={() => exportFile(format)} className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white"><Download size={12} />{format.toUpperCase()}</button>)}
      </div>
    </nav>
    <main className="flex-1 min-h-0 p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-shrink-0">
        {[
          ["Total Transactions", summary?.totalTransactions ?? transactions.length, "text-slate-800"],
          ["Bank Detected", summary?.bankName ?? active.bankDetected ?? "Parsed with AI", "text-primary-700"],
          ["Total Debit (Out)", `${summary?.currencySymbol ?? active.currencySymbol}${(summary?.totalDebit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-rose-600"],
          ["Total Credit (In)", `${summary?.currencySymbol ?? active.currencySymbol}${(summary?.totalCredit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-emerald-600"],
          ["Opening Balance", `${summary?.currencySymbol ?? active.currencySymbol}${(summary?.openingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-slate-700"],
          ["Closing Balance", `${summary?.currencySymbol ?? active.currencySymbol}${(summary?.closingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-slate-800"],
        ].map(([label, value, color]) => <div key={String(label)} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p><h4 className={`text-base font-bold ${color}`}>{value}</h4></div>)}
      </div>
      <div className="flex-1 min-h-0"><Spreadsheet transactions={transactions} bankDetected={active.bankDetected} isGhostMode={false} onTransactionsChange={handleTransactionsChange} sheets={sheets} activeSheetId={activeSheetId} onSheetsChange={setSheets} onActiveSheetIdChange={setActiveSheetId} /></div>
    </main>
    {showLogin && <LoginModal isOpen onClose={() => setShowLogin(false)} onLoginSuccess={async () => {
      setShowLogin(false);
      const format = pendingExport;
      setPendingExport(null);
      if (format) await exportFile(format);
    }} />}
  </div>;
}
