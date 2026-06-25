"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import UploadZone from "@/components/app/UploadZone";
import ProcessingSteps from "@/components/app/ProcessingSteps";
import Spreadsheet from "@/components/app/Spreadsheet";
import ExportModal from "@/components/app/ExportModal";
import { useToast } from "@/components/ui/Toast";
import { Transaction, ConvertResponse } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  FileSpreadsheet,
  Download,
  FileDown,
  User,
  LogOut,
} from "lucide-react";

type AppState = "upload" | "processing" | "spreadsheet";

interface Sheet {
  id: string;
  name: string;
  transactions: Transaction[];
  bankDetected: string | null;
  headers: string[];
}

export default function AppPage() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string>("");
  const [pendingUploadData, setPendingUploadData] = useState<{
    transactions: Transaction[];
    bankDetected: string | null;
    headers: string[];
    fileName: string;
  } | null>(null);

  const [fileName, setFileName] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "json">("csv");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const { showToast } = useToast();

  const activeSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || null;
  }, [sheets, activeSheetId]);

  const transactions = useMemo(() => activeSheet ? activeSheet.transactions : [], [activeSheet]);
  const bankDetected = activeSheet ? activeSheet.bankDetected : null;
  const headers = activeSheet ? activeSheet.headers : [];

  const handleTransactionsChange = useCallback((updated: Transaction[]) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheetId ? { ...s, transactions: updated } : s))
    );
  }, [activeSheetId]);

  // Check auth state
  React.useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const extractPdfText = useCallback(async (file: File): Promise<{ text: string; pages: number }> => {
    // Dynamically import PDF.js as an ES module natively in the browser, bypassing Webpack parsing.
    // @ts-expect-error: unpkg CDN ESM dynamic import is not resolvable at build time
    const pdfjs = (await import(/* webpackIgnore: true */ "https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs")) as {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (args: { data: ArrayBuffer }) => {
        promise: Promise<{
          numPages: number;
          getPage: (index: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string }>;
            }>;
          }>;
        }>;
      };
    };

    pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    if (pdf.numPages > 100) {
      throw new Error("File has too many pages. Maximum page limit is 100.");
    }

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => (item as { str: string }).str);
      fullText += strings.join(" ") + "\n";
    }

    return { text: fullText, pages: pdf.numPages };
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setAppState("processing");
      setProcessingStep(0); // Uploading PDF...

      try {
        // Step 1: Extract PDF text locally
        setProcessingStep(1); // Extracting text...
        const { text } = await extractPdfText(file);

        // Step 2: Send extracted text to route
        setProcessingStep(2); // Analyzing with AI...
        const response = await fetch("/api/parse-bank-statement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data: ConvertResponse = await response.json();

        if (data.success && data.transactions.length > 0) {
          // Step 3: Preparing spreadsheet...
          setProcessingStep(3);
          await new Promise((resolve) => setTimeout(resolve, 800)); // Small transition delay
          
          const cleanName = file.name.replace(/\.pdf$/i, "");
          
          if (sheets.length > 0) {
            setPendingUploadData({
              transactions: data.transactions,
              bankDetected: data.bank_detected,
              headers: data.headers || [],
              fileName: cleanName,
            });
            setAppState("spreadsheet");
          } else {
            const newSheet = {
              id: crypto.randomUUID(),
              name: cleanName,
              transactions: data.transactions,
              bankDetected: data.bank_detected,
              headers: data.headers || [],
            };
            setSheets([newSheet]);
            setActiveSheetId(newSheet.id);
            setAppState("spreadsheet");
          }
        } else {
          showToast(data.error || "We could not fully parse this statement. Please upload another file.", "error");
          setAppState("upload");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "We could not fully parse this statement. Please upload another file.";
        showToast(errorMsg, "error");
        setAppState("upload");
      }
    },
    [showToast, extractPdfText, sheets]
  );

  const handleExport = useCallback(
    async (format: "csv" | "xlsx" | "json") => {
      if (!isAuthenticated && isSupabaseConfigured()) {
        setExportFormat(format);
        setExportModalOpen(true);
        return;
      }

      await performExport(format);
    },
    [isAuthenticated, transactions, sheets]
  );

  const performExport = async (format: "csv" | "xlsx" | "json") => {
    try {
      const bodyPayload = format === "xlsx" 
        ? { sheets: sheets.map(s => ({ name: s.name, transactions: s.transactions })), format }
        : { transactions, format, headers };

      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        showToast("Export failed. Please try again.", "error");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `bankstatement_${date}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Downloaded successfully ✓`, "success");
      setExportModalOpen(false);
    } catch {
      showToast("Export failed. Please try again.", "error");
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      showToast("Signed out successfully", "info");
    }
  };

  // Calculate dynamic stats
  const summary = useMemo(() => {
    const totalTransactions = transactions.length;
    let totalDebit = 0;
    let totalCredit = 0;
    let openingBalance = 0;
    let closingBalance = 0;

    transactions.forEach((tx) => {
      const debitVal = parseFloat(String(tx.debit).replace(/,/g, "")) || 0;
      const creditVal = parseFloat(String(tx.credit).replace(/,/g, "")) || 0;
      totalDebit += debitVal;
      totalCredit += creditVal;
    });

    if (transactions.length > 0) {
      const opRow = transactions.find((tx) =>
        tx.description.toLowerCase().includes("opening balance")
      );
      if (opRow) {
        openingBalance = parseFloat(String(opRow.balance).replace(/,/g, "")) || 0;
      } else {
        const firstWithBal = transactions.find(
          (tx) => tx.balance && !isNaN(parseFloat(String(tx.balance).replace(/,/g, "")))
        );
        if (firstWithBal) {
          const bal = parseFloat(String(firstWithBal.balance).replace(/,/g, "")) || 0;
          const cr = parseFloat(String(firstWithBal.credit).replace(/,/g, "")) || 0;
          const dr = parseFloat(String(firstWithBal.debit).replace(/,/g, "")) || 0;
          openingBalance = bal - cr + dr;
        }
      }

      const lastWithBal = [...transactions]
        .reverse()
        .find((tx) => tx.balance && !isNaN(parseFloat(String(tx.balance).replace(/,/g, ""))));
      if (lastWithBal) {
        closingBalance = parseFloat(String(lastWithBal.balance).replace(/,/g, "")) || 0;
      } else {
        closingBalance = openingBalance + totalCredit - totalDebit;
      }
    }

    return {
      totalTransactions,
      totalDebit,
      totalCredit,
      openingBalance,
      closingBalance,
    };
  }, [transactions]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="flex items-center h-14 px-4 bg-white border-b border-slate-200 gap-3 flex-shrink-0">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-800 hover:text-primary-600 transition-colors mr-4"
        >
          <FileSpreadsheet size={22} className="text-primary-600" />
          <span className="font-bold text-sm hidden sm:inline">StatementToExcel</span>
        </Link>

        {/* Filename */}
        {fileName && appState !== "upload" && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-sm text-slate-600 max-w-[200px]">
            <span className="truncate">{fileName}</span>
          </div>
        )}

        {/* Upload another */}
        {appState === "spreadsheet" && (
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={true} />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export Buttons */}
        {appState === "spreadsheet" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport("json")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                text-slate-600 bg-white border border-slate-200 rounded-lg
                hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                text-slate-600 bg-white border border-slate-200 rounded-lg
                hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                text-white bg-primary-600 rounded-lg
                hover:bg-primary-700 transition-all shadow-sm"
            >
              <FileDown size={13} />
              <span>Export Excel</span>
            </button>
          </div>
        )}

        {/* User */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600
              hover:text-primary-600 transition-colors ml-2"
          >
            <User size={16} />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {appState === "upload" && (
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={false} />
        )}

        {appState === "processing" && (
          <ProcessingSteps
            fileName={fileName}
            currentStep={processingStep}
          />
        )}        {appState === "spreadsheet" && (
          <div className="h-full p-4 flex flex-col overflow-hidden">
            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4 flex-shrink-0">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all hover:shadow hover:border-primary-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Transactions</p>
                <h4 className="text-xl font-bold text-slate-800">{summary.totalTransactions}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all hover:shadow hover:border-red-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Debit (Out)</p>
                <h4 className="text-xl font-bold text-rose-600">
                  {summary.totalDebit > 0 ? `₹${summary.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00"}
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all hover:shadow hover:border-emerald-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Credit (In)</p>
                <h4 className="text-xl font-bold text-emerald-600">
                  {summary.totalCredit > 0 ? `₹${summary.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00"}
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all hover:shadow hover:border-violet-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Opening Balance</p>
                <h4 className="text-xl font-bold text-slate-700">
                  ₹{summary.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all hover:shadow hover:border-indigo-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Closing Balance</p>
                <h4 className={`text-xl font-bold ${summary.closingBalance >= 0 ? "text-slate-800" : "text-red-700"}`}>
                  ₹{summary.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 min-h-0">
              <Spreadsheet
                transactions={transactions}
                bankDetected={bankDetected}
                isGhostMode={false}
                onTransactionsChange={handleTransactionsChange}
                sheets={sheets}
                activeSheetId={activeSheetId}
                onSheetsChange={setSheets}
                onActiveSheetIdChange={setActiveSheetId}
              />
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExportDirect={() => performExport(exportFormat)}
        format={exportFormat}
      />

      {/* Merge/New Sheet Prompt Modal */}
      {pendingUploadData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Import Statement</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We parsed <strong>{pendingUploadData.transactions.length}</strong> transactions from <strong>{pendingUploadData.fileName}</strong>. 
              How would you like to add them to your workspace?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  // Merge into active sheet
                  setSheets(prev => prev.map(s => {
                    if (s.id === activeSheetId) {
                      const merged = [
                        ...s.transactions,
                        ...pendingUploadData.transactions.map(t => ({ ...t, id: crypto.randomUUID() }))
                      ];
                      return { ...s, transactions: merged };
                    }
                    return s;
                  }));
                  setPendingUploadData(null);
                  showToast("Merged transactions successfully!", "success");
                }}
                className="w-full py-2 px-4 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors border border-primary-200"
              >
                Merge with Active Sheet ({sheets.find(s => s.id === activeSheetId)?.name})
              </button>
              <button
                onClick={() => {
                  // Create new sheet
                  const newSheet = {
                    id: crypto.randomUUID(),
                    name: pendingUploadData.fileName,
                    transactions: pendingUploadData.transactions,
                    bankDetected: pendingUploadData.bankDetected,
                    headers: pendingUploadData.headers
                  };
                  setSheets(prev => [...prev, newSheet]);
                  setActiveSheetId(newSheet.id);
                  setPendingUploadData(null);
                  showToast("Created new sheet!", "success");
                }}
                className="w-full py-2 px-4 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                Create New Sheet
              </button>
              <button
                onClick={() => setPendingUploadData(null)}
                className="w-full py-2 px-4 bg-white text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
