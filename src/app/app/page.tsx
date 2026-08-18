"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import UploadZone, { UploadZoneHandle } from "@/components/app/UploadZone";
import ProcessingSteps from "@/components/app/ProcessingSteps";

const Spreadsheet = dynamic(() => import("@/components/app/Spreadsheet"), { ssr: false });
const LoginModal = dynamic(() => import("@/components/app/LoginModal"), { ssr: false });
import { useToast } from "@/components/ui/Toast";
import { Transaction, ConvertResponse } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadPdfToStorage, uploadUnlockedPdfToStorage } from "@/lib/storage";
import {
  trackUploadPdf,
  trackConversionStarted,
  trackPreviewDisplayed,
  trackSignupStarted,
  trackDownloadButtonClicked,
  trackDownloadExcel,
  trackDownloadCsv,
  trackPaymentPageViewed,
  trackPaymentInitiated,
  trackPaymentSuccess,
  trackPaymentFailed,
  detectTrafficSource,
} from "@/lib/analytics";
import {
  LIFETIME_PRICE_USD,
  PER_CONVERSION_PRICE_USD,
  LIFETIME_OFFER_LIMIT,
  formatUSD,
} from "@/lib/pricing";
import {
  FileSpreadsheet,
  Download,
  FileDown,
  User,
  Sparkles,
  Zap,
  X,
  Clock,
  Lock,
  ChevronDown,
} from "lucide-react";

// Add Razorpay window typing
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const { showToast } = useToast();

  // Payment / usage flow state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<"csv" | "xlsx" | "json" | "iif" | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPickerIntent, setPendingPickerIntent] = useState(false);
  const [offerSoldOut, setOfferSoldOut] = useState(false);
  const [offerRemaining, setOfferRemaining] = useState<number>(LIFETIME_OFFER_LIMIT);
  const [countdown, setCountdown] = useState<string>("");
  const uploadZoneRef = useRef<UploadZoneHandle>(null);
  const pickerBusyRef = useRef(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // PDF password prompt state
  const [pdfPasswordPrompt, setPdfPasswordPrompt] = useState<{
    incorrect: boolean;
    fileName: string;
  } | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const pendingPdfPasswordRef = useRef<{ resolve: (pw: string) => void } | null>(null);
  const submittedPdfPasswordRef = useRef<string | null>(null);

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

  // Fetch conversions_used for the current user
  const fetchUserUsage = useCallback(async (accessToken: string) => {
    try {
      await fetch("/api/usage/get", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // ignore
    }
  }, []);

  // Check auth state
  React.useEffect(() => {
    // Capture traffic source on first render
    detectTrafficSource();

    if (!isSupabaseConfigured() || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        fetchUserUsage(session.access_token);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user.email || null);
      if (session) fetchUserUsage(session.access_token);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserUsage]);

  // Daily countdown for the lifetime offer ("Offer ends soon")
  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const extractPdfText = useCallback(async (file: File): Promise<{ text: string; pages: number }> => {
    // Dynamically import PDF.js as an ES module natively in the browser, bypassing Webpack parsing.
    const PDFJS_URLS = [
      "https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs",
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs",
    ];
    const PDFJS_WORKER_URLS = [
      "https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs",
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs",
    ];

    interface PdfJsModule {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (args: {
        data: ArrayBuffer;
      }) => {
        onPassword?: (updatePassword: (pw: string) => void, reason: number) => void;
        promise: Promise<{
          numPages: number;
          getPage: (index: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string }>;
            }>;
          }>;
        }>;
      };
    }

    let pdfjs: PdfJsModule | null = null;

    for (let i = 0; i < PDFJS_URLS.length; i++) {
      try {
        const mod = (await import(/* webpackIgnore: true */ PDFJS_URLS[i])) as PdfJsModule;
        pdfjs = mod;
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URLS[i];
        break;
      } catch {
        // Try the next CDN if this one is blocked or unreachable.
      }
    }

    if (!pdfjs) {
      throw new Error("Could not load the PDF reader. Please check your internet connection and try again.");
    }

    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF. If it is password protected, ask the user for the password
    // (via the modal) and then continue loading exactly as before.
    const pdf = await new Promise<{
      numPages: number;
      getPage: (index: number) => Promise<{
        getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
      }>;
    }>((resolve, reject) => {
      let loadTimer: ReturnType<typeof setTimeout> | null = null;
      const startLoadTimer = () => {
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(() => {
          reject(new Error("Timed out reading this PDF. Please try a smaller file."));
        }, 60000);
      };

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      loadingTask.onPassword = (updatePassword, reason) => {
        setPdfPassword("");
        setPdfPasswordPrompt({ incorrect: reason === 2, fileName: file.name });
        pendingPdfPasswordRef.current = {
          resolve: (pw: string) => {
            startLoadTimer();
            updatePassword(pw);
          },
        };
      };

      startLoadTimer();
      loadingTask.promise.then(
        (loadedPdf) => {
          if (loadTimer) clearTimeout(loadTimer);
          resolve(loadedPdf);
        },
        (err) => {
          if (loadTimer) clearTimeout(loadTimer);
          reject(err);
        }
      );
    });

    if (pdf.numPages > 100) {
      throw new Error("File has too many pages. Maximum page limit is 100.");
    }

    let fullText = "";
    const startedAt = Date.now();
    for (let i = 1; i <= pdf.numPages; i++) {
      if (Date.now() - startedAt > 120000) {
        throw new Error("Timed out extracting text. Please try a smaller file.");
      }
      // Yield to the browser so the page stays responsive while parsing large statements.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => (item as { str: string }).str);
      fullText += strings.join(" ") + "\n";
    }

    return { text: fullText, pages: pdf.numPages };
  }, []);

  const startUpload = async (file: File) => {
    setFileName(file.name);
    setAppState("processing");
    setProcessingStep(0);
    setPdfPasswordPrompt(null);
    setPdfPassword("");
    pendingPdfPasswordRef.current = null;
    submittedPdfPasswordRef.current = null;

    // Track upload
    trackUploadPdf({ file_name: file.name });

    // Background: save a copy of the original PDF to Supabase Storage.
    // Fire-and-forget — never blocks the extract → AI → preview flow.
    void uploadPdfToStorage(file);

    try {
      setProcessingStep(1);
      const { text } = await extractPdfText(file);

      // Background: if the PDF was password protected, save an unlocked copy
      // to Storage so it can be opened without a prompt. Fire-and-forget.
      if (submittedPdfPasswordRef.current) {
        void uploadUnlockedPdfToStorage(file, submittedPdfPasswordRef.current);
      }

      await startAIConversion(text);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "We could not fully extract this statement. Please try again.";
      showToast(errorMsg, "error");
      setAppState("upload");
    }
  };

  const submitPdfPassword = () => {
    const pw = pdfPassword;
    submittedPdfPasswordRef.current = pw;
    pendingPdfPasswordRef.current?.resolve(pw);
    pendingPdfPasswordRef.current = null;
    setPdfPassword("");
    setPdfPasswordPrompt(null);
  };

  const cancelPdfPassword = () => {
    // Resolve with an empty password — pdf.js throws "No password given"
    // and the upload is aborted like before.
    pendingPdfPasswordRef.current?.resolve("");
    pendingPdfPasswordRef.current = null;
    setPdfPassword("");
    setPdfPasswordPrompt(null);
  };

  const fetchOfferStatus = async () => {
    try {
      const res = await fetch("/api/payment/offer-status");
      const d = await res.json();
      if (d && typeof d.soldOut === "boolean") {
        setOfferSoldOut(d.soldOut);
        setOfferRemaining(d.remaining ?? 0);
      }
    } catch {
      // ignore
    }
  };

  // Called when the user clicks the upload area but BEFORE the file picker opens.
  // If the free conversion is used, block the picker and show payment.
  const attemptOpenPicker = async () => {
    if (pickerBusyRef.current) return;
    pickerBusyRef.current = true;
    try {
      if (!isSupabaseConfigured() || !supabase) {
        uploadZoneRef.current?.openPicker();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        uploadZoneRef.current?.openPicker();
        return;
      }

      try {
        const res = await fetch("/api/usage/get", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const d = await res.json();
          const isFree = (d.conversions_used ?? 0) === 0;
          if (d.plan === "lifetime" || isFree || (d.paid_credits ?? 0) > 0) {
            uploadZoneRef.current?.openPicker();
          } else {
            setPendingPickerIntent(true);
            setShowPlanModal(true);
            fetchOfferStatus();
          }
        } else {
          uploadZoneRef.current?.openPicker();
        }
      } catch {
        uploadZoneRef.current?.openPicker();
      }
    } finally {
      pickerBusyRef.current = false;
    }
  };

  const handleAreaClick = () => {
    attemptOpenPicker();
  };

  const processPendingUpload = async (file: File) => {
    setPendingFile(null);

    if (!isSupabaseConfigured() || !supabase) {
      await startUpload(file);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await startUpload(file);
      return;
    }

    // Block the conversion when the free one is already used
    try {
      const res = await fetch("/api/usage/get", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        const isFree = (d.conversions_used ?? 0) === 0;
        if (d.plan === "lifetime" || isFree) {
          await startUpload(file);
        } else if ((d.paid_credits ?? 0) > 0) {
          const cRes = await fetch("/api/usage/consume", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (cRes.ok) {
            await startUpload(file);
          } else {
            setPendingFile(file);
            setShowPlanModal(true);
            fetchOfferStatus();
          }
        } else {
          setPendingFile(file);
          setShowPlanModal(true);
          fetchOfferStatus();
        }
      } else {
        await startUpload(file);
      }
    } catch {
      await startUpload(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!isSupabaseConfigured() || !supabase) {
      await startUpload(file);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setPendingFile(null);
      await startUpload(file);
      return;
    }
    setPendingFile(file);
    await processPendingUpload(file);
  };

  const startAIConversion = async (text: string) => {
    setProcessingStep(2); // Analyzing with AI...

    // Track conversion started
    trackConversionStarted();

    try {
      const fetchHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          fetchHeaders["Authorization"] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch("/api/parse-bank-statement", {
        method: "POST",
        headers: fetchHeaders,
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

        // Track preview displayed
        trackPreviewDisplayed({
          bank: data.bank_detected ?? undefined,
          transaction_count: data.transactions.length,
        });

        // Count this conversion towards usage (only when signed in)
        try {
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const incRes = await fetch("/api/usage/increment", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
              });
              if (!incRes.ok) {
                const errBody = await incRes.json().catch(() => ({}));
                console.error("[usage] increment failed:", incRes.status, errBody);
              }
            }
          }
        } catch (e) {
          console.error("[usage] increment error:", e);
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
      // conversion complete
    }
  };

  const initPlanPayment = async (plan: "lifetime" | "per_conversion") => {
    if (!isSupabaseConfigured() || !supabase) return;
    setIsProcessingPayment(true);

    // Track payment page viewed
    trackPaymentPageViewed({ plan });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsProcessingPayment(false);
        setShowPlanModal(false);
        trackSignupStarted({ trigger: "payment_gate" });
        setShowLoginModal(true);
        return;
      }

      // Create order
      const createOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ plan }),
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
        description: plan === "lifetime" ? "Lifetime Access ($100)" : "Per Conversion Credit ($2)",
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
              // Track successful payment
              trackPaymentSuccess({
                plan,
                value: orderData.priceINR ?? 0,
                currency: orderData.currency ?? "INR",
                transaction_id: response.razorpay_payment_id,
              });
              showToast(
                plan === "lifetime"
                  ? "Lifetime access unlocked! 🎉"
                  : "Credit added! You can convert your file now.",
                "success"
              );
              setShowPlanModal(false);
              setIsProcessingPayment(false);
              setPendingPickerIntent(false);
              if (pendingFile) {
                const fileToProcess = pendingFile;
                setPendingFile(null);
                await processPendingUpload(fileToProcess);
              } else if (pendingExportFormat) {
                const fmt = pendingExportFormat;
                setPendingExportFormat(null);
                await handleExport(fmt);
              } else {
                attemptOpenPicker();
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
        trackPaymentFailed({ plan, reason: response.error?.description });
        showToast(response.error.description || "Payment failed", "error");
        setIsProcessingPayment(false);
      });

      // Track payment initiated (Razorpay modal about to open)
      trackPaymentInitiated({
        plan,
        value: orderData.priceINR ?? 0,
        currency: orderData.currency ?? "INR",
      });

      rzp.open();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment initialization failed";
      showToast(errorMsg, "error");
      setIsProcessingPayment(false);
    }
  };

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    setIsAuthenticated(true);
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email || null);
        fetchUserUsage(session.access_token).then(() => {
          // Re-trigger the pending export after login
          if (pendingExportFormat) {
            const fmt = pendingExportFormat;
            setPendingExportFormat(null);
            setTimeout(() => handleExport(fmt), 100);
          }
          // Re-trigger the pending upload after login
          if (pendingFile) {
            const fileToProcess = pendingFile;
            setPendingFile(null);
            setTimeout(() => processPendingUpload(fileToProcess), 100);
          }
          // Re-trigger the file picker after login
          if (pendingPickerIntent) {
            setPendingPickerIntent(false);
            setTimeout(() => attemptOpenPicker(), 100);
          }
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserUsage, pendingExportFormat, pendingFile]);

  const handleExport = useCallback(
    async (format: "csv" | "xlsx" | "json" | "iif") => {
      // Track button click immediately (before auth check)
      trackDownloadButtonClicked({ format });

      if (!isAuthenticated || !isSupabaseConfigured()) {
        showToast("Sign in to download your converted file.", "info");
        setPendingExportFormat(format);
        trackSignupStarted({ trigger: "download_gate" });
        setShowLoginModal(true);
        return;
      }

      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        showToast("Sign in to download your converted file.", "info");
        setPendingExportFormat(format);
        trackSignupStarted({ trigger: "download_gate" });
        setShowLoginModal(true);
        return;
      }

      await performExport(format);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, transactions, sheets]
  );

  const performExport = async (format: "csv" | "xlsx" | "json" | "iif") => {
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

      // Track successful download
      if (format === "xlsx") {
        trackDownloadExcel({ bank: bankDetected ?? undefined, transaction_count: transactions.length });
      } else if (format === "csv") {
        trackDownloadCsv({ bank: bankDetected ?? undefined, transaction_count: transactions.length });
      }

      showToast(`Downloaded successfully ✓`, "success");
    } catch {
      showToast("Export failed. Please try again.", "error");
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

    return { totalTransactions, totalDebit, totalCredit, openingBalance, closingBalance };
  }, [transactions]);

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
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={true} ref={uploadZoneRef} onAreaClick={handleAreaClick} />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export Dropdown */}
        {appState === "spreadsheet" && (
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                text-white bg-primary-600 rounded-lg
                hover:bg-primary-700 transition-all shadow-sm"
            >
              <FileDown size={13} />
              <span>Export</span>
              <ChevronDown size={12} className={`transition-transform duration-150 ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <>
                {/* backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-[15]"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-[20] py-1 overflow-hidden">
                  {(
                    [
                      { format: "xlsx", label: "Excel (.xlsx)", icon: <FileDown size={13} /> },
                      { format: "csv",  label: "CSV (.csv)",    icon: <Download size={13} /> },
                      { format: "iif",  label: "IIF (QuickBooks)", icon: <Download size={13} /> },
                      { format: "json", label: "JSON (.json)",  icon: <Download size={13} /> },
                    ] as const
                  ).map(({ format, label, icon }) => (
                    <button
                      key={format}
                      onClick={() => {
                        setShowExportMenu(false);
                        handleExport(format);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700
                        hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-slate-400">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* User */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              trackSignupStarted({ trigger: "navbar" });
              setShowLoginModal(true);
            }}
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
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={false} ref={uploadZoneRef} onAreaClick={handleAreaClick} />
        )}

        {appState === "processing" && (
          <ProcessingSteps
            fileName={fileName}
            currentStep={processingStep}
          />
        )}        
        
        {appState === "spreadsheet" && (
          <div className="h-full p-4 flex flex-col overflow-hidden relative">
            {/* Summary Cards */}
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

            {/* Spreadsheet Grid */}
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

      {/* Auth Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingExportFormat(null); }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Plan Modal — shown before upload when the free conversion is used */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPlanModal(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">You've used your free conversion</h2>
              <p className="text-sm text-slate-500">Pick a plan to keep converting bank statements to Excel.</p>
            </div>

            <div className="grid gap-4">
              {/* Lifetime Access */}
              <div className="relative rounded-2xl border-2 border-primary-500 p-5 shadow-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-full shadow">
                    <Clock size={11} />
                    {offerSoldOut ? "SOLD OUT" : `OFFER ENDS IN ${countdown}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={22} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">Lifetime Access</h3>
                    <p className="text-xs text-slate-500">Pay once, convert unlimited statements forever</p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900">{formatUSD(LIFETIME_PRICE_USD)}</span>
                    <span className="text-sm text-slate-500 ml-1">one-time</span>
                  </div>
                  <button
                    onClick={() => initPlanPayment("lifetime")}
                    disabled={isProcessingPayment || offerSoldOut}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {isProcessingPayment ? "Processing..." : offerSoldOut ? "Sold Out" : "Get Lifetime Access"}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-slate-400">
                  {offerSoldOut
                    ? "This offer is no longer available."
                    : `Limited to ${LIFETIME_OFFER_LIMIT} users — only ${offerRemaining} spots left.`}
                </p>
              </div>

              {/* Pay Per Conversion */}
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Zap size={22} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">Pay Per Conversion</h3>
                    <p className="text-xs text-slate-500">Pay only when you need to convert a statement</p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900">{formatUSD(PER_CONVERSION_PRICE_USD)}</span>
                    <span className="text-sm text-slate-500 ml-1">per file</span>
                  </div>
                  <button
                    onClick={() => initPlanPayment("per_conversion")}
                    disabled={isProcessingPayment}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {isProcessingPayment ? "Processing..." : `Pay ${formatUSD(PER_CONVERSION_PRICE_USD)} & Convert`}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Secure payments via Razorpay. Your file is processed right after payment.
            </p>
          </div>
        </div>
      )}

      {/* PDF Password Modal — shown when the uploaded PDF is password protected */}
      {pdfPasswordPrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={cancelPdfPassword}
          />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <Lock size={24} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {pdfPasswordPrompt.incorrect
                ? "Incorrect password"
                : "This PDF is password protected"}
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              {pdfPasswordPrompt.incorrect
                ? "The password you entered is wrong. Please try again."
                : `Enter the password to unlock "${pdfPasswordPrompt.fileName}".`}
            </p>
            <input
              type="password"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitPdfPassword();
              }}
              placeholder="Enter PDF password"
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                placeholder:text-slate-400"
            />
            <div className="mt-5 flex gap-2">
              <button
                onClick={cancelPdfPassword}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitPdfPassword}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

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
