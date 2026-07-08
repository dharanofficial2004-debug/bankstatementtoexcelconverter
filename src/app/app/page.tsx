"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import UploadZone from "@/components/app/UploadZone";
import ProcessingSteps from "@/components/app/ProcessingSteps";
import Spreadsheet from "@/components/app/Spreadsheet";
import ExportModal from "@/components/app/ExportModal";
import LoginModal from "@/components/app/LoginModal";
import { useToast } from "@/components/ui/Toast";
import { Transaction, ConvertResponse, GHOST_DATA } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getPrice, DocumentMetrics } from "@/lib/pricing";
import {
  FileSpreadsheet,
  Download,
  FileDown,
  User,
  LogOut,
} from "lucide-react";

// Add Razorpay window typing
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

type AppState = "upload" | "processing" | "preview" | "spreadsheet";

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

  // Payment flow state
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractionMeta, setExtractionMeta] = useState<DocumentMetrics | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>([]);

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
        const { text, pages } = await extractPdfText(file);

        // Step 2: Calculate metrics
        const words = text.split(/\s+/).filter(Boolean).length;
        const characters = text.length;

        setExtractedText(text);
        setExtractionMeta({ pages, words, characters });
        
        // Generate Real Preview Data
        setProcessingStep(2);
        try {
          // Sniff for the first date-like string to skip headers
          const dateRegex = /(?:\d{1,4}[./-]\d{1,2}[./-]\d{1,4})|(?:\d{1,2}[\s./-]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s./-]+\d{2,4})/i;
          const match = text.match(dateRegex);
          const startIndex = match?.index !== undefined ? Math.max(0, match.index - 200) : 0;
          const tinyText = text.substring(startIndex, startIndex + 2500);
          const previewRes = await fetch("/api/parse-bank-statement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: tinyText }),
          });
          if (previewRes.ok) {
            const previewData = await previewRes.json();
            if (previewData.success && previewData.transactions) {
              setPreviewTransactions(previewData.transactions.slice(0, 6)); 
            }
          }
        } catch (e) {
          console.error("Preview generation failed:", e);
        }

        // Show preview instead of going directly to AI
        setAppState("preview");

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "We could not fully extract this statement. Please try again.";
        showToast(errorMsg, "error");
        setAppState("upload");
      }
    },
    [showToast, extractPdfText]
  );

  const startAIConversion = async (text: string) => {
    setIsConverting(true);
    setProcessingStep(2); // Analyzing with AI...
    
    try {
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
        
        const cleanName = fileName.replace(/\.pdf$/i, "");
        
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
      const errorMsg = err instanceof Error ? err.message : "We could not fully parse this statement. Please try again.";
      showToast(errorMsg, "error");
      setAppState("upload");
    } finally {
      setIsConverting(false);
    }
  };

  const initRazorpayPayment = async () => {
    if (!extractionMeta || !supabase) return;
    setIsProcessingPayment(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Create order
      const createOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          pages: extractionMeta.pages,
          words: extractionMeta.words,
          characters: extractionMeta.characters,
          filename: fileName
        }),
      });

      const orderData = await createOrderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StatementToExcel",
        description: `Unlock ${fileName} Conversion`,
        order_id: orderData.orderId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_record_id: orderData.paymentRecordId
              }),
            });

            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              showToast("Payment successful! Starting conversion...", "success");
              if (extractedText) {
                startAIConversion(extractedText);
              }
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Payment verification failed";
            showToast(msg, "error");
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          email: userEmail || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (response: any) {
        showToast(response.error.description || "Payment failed", "error");
        setIsProcessingPayment(false);
      });
      rzp.open();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment initialization failed";
      showToast(errorMsg, "error");
      setIsProcessingPayment(false);
    }
  };

  const handlePayAndUnlock = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      initRazorpayPayment();
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsAuthenticated(true);
    // After successful login, check session and initiate payment
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email || null);
        initRazorpayPayment();
      }
    });
  };

  const handleExport = useCallback(
    (format: "csv" | "xlsx" | "json") => {
      if (!isAuthenticated && isSupabaseConfigured()) {
        setExportFormat(format);
        setExportModalOpen(true);
        return;
      }

      performExport(format);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const txsToUse = appState === "preview" 
      ? (previewTransactions.length > 0 ? previewTransactions : GHOST_DATA) 
      : transactions;
    const totalTransactions = txsToUse.length;
    let totalDebit = 0;
    let totalCredit = 0;
    let openingBalance = 0;
    let closingBalance = 0;

    txsToUse.forEach((tx) => {
      const debitVal = parseFloat(String(tx.debit).replace(/,/g, "")) || 0;
      const creditVal = parseFloat(String(tx.credit).replace(/,/g, "")) || 0;
      totalDebit += debitVal;
      totalCredit += creditVal;
    });

    if (txsToUse.length > 0) {
      const opRow = txsToUse.find((tx) =>
        tx.description.toLowerCase().includes("opening balance")
      );
      if (opRow) {
        openingBalance = parseFloat(String(opRow.balance).replace(/,/g, "")) || 0;
      } else {
        const firstWithBal = txsToUse.find(
          (tx) => tx.balance && !isNaN(parseFloat(String(tx.balance).replace(/,/g, "")))
        );
        if (firstWithBal) {
          const bal = parseFloat(String(firstWithBal.balance).replace(/,/g, "")) || 0;
          const cr = parseFloat(String(firstWithBal.credit).replace(/,/g, "")) || 0;
          const dr = parseFloat(String(firstWithBal.debit).replace(/,/g, "")) || 0;
          openingBalance = bal - cr + dr;
        }
      }

      const lastWithBal = [...txsToUse]
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
  }, [transactions, appState, previewTransactions]);

  const currentPricing = useMemo(() => {
    if (!extractionMeta) return null;
    return getPrice(extractionMeta);
  }, [extractionMeta]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="flex items-center h-14 px-4 bg-white border-b border-slate-200 gap-3 flex-shrink-0 relative z-10">
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
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600
              hover:text-primary-600 transition-colors ml-2"
          >
            <User size={16} />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {appState === "upload" && (
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={false} />
        )}

        {appState === "processing" && (
          <ProcessingSteps
            fileName={fileName}
            currentStep={processingStep}
          />
        )}        
        
        {(appState === "preview" || appState === "spreadsheet") && (
          <div className="h-full p-4 flex flex-col overflow-hidden relative">
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
            <div className="flex-1 min-h-0 relative">
              <Spreadsheet
                transactions={appState === "preview" ? previewTransactions : transactions}
                bankDetected={appState === "preview" ? "Preview Mode" : bankDetected}
                isGhostMode={appState === "preview"}
                onTransactionsChange={handleTransactionsChange}
                sheets={sheets}
                activeSheetId={activeSheetId}
                onSheetsChange={setSheets}
                onActiveSheetIdChange={setActiveSheetId}
              />
              
              {/* Inline Payment Overlay for preview mode */}
              {appState === "preview" && (
                <div className="absolute bottom-0 left-0 right-0 h-[300px] z-[30] bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-8">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md text-center mx-4">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Preview Ready</h3>
                    <p className="text-sm text-slate-500 mb-5">
                      We've extracted a preview from your {extractionMeta?.pages || 0} page document. 
                      Unlock the full conversion to access all data and export options.
                    </p>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-600">Conversion Price</span>
                      <span className="text-xl font-bold text-slate-800">
                        ${currentPricing?.priceUSD.toFixed(2)} <span className="text-xs text-slate-500">USD</span>
                      </span>
                    </div>
                    <button
                      onClick={handlePayAndUnlock}
                      disabled={isProcessingPayment || isConverting}
                      className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-sm shadow-primary-600/20 disabled:opacity-70"
                    >
                      {isProcessingPayment || isConverting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          <span>Pay & Unlock Full Conversion</span>
                        </>
                      )}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      <span>Secure payment via Razorpay</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Login Modal for Auth flow */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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
