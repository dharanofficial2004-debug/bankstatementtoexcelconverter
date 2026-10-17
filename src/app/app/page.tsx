"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import UploadZone, { UploadZoneHandle } from "@/components/app/UploadZone";
import { useToast } from "@/components/ui/Toast";
import { trackUploadPdf } from "@/lib/analytics";

const LoginModal = dynamic(() => import("@/components/app/LoginModal"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | "idle"          // file not yet selected
  | "selected"      // file selected, showing filename + Extract button
  | "authorizing"   // calling /api/extract/authorize
  | "extracting"    // browser reading PDF pages
  | "ocr_reauth"    // calling /api/extract/authorize again for OCR
  | "ocr_running"   // browser OCR-ing pages
  | "extracted"     // extraction done, showing preview + Convert button
  | "converting"    // calling /api/convert
  | "done";         // got jobId, navigating to /preview/{jobId}

interface ServerLimits {
  conversionId: string;
  maxPages: number;
  maxChars: number;
  isTrial: boolean;
  kind: "text" | "ocr";
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const uploadZoneRef = useRef<UploadZoneHandle>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [limits, setLimits] = useState<ServerLimits | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [extractedPages, setExtractedPages] = useState<number>(0);
  const [extractProgress, setExtractProgress] = useState<{ page: number; total: number } | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const [passwordPrompt, setPasswordPrompt] = useState<{ incorrect: boolean } | null>(null);
  const pendingPasswordRef = useRef<{ resolve: (pw: string) => void } | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // ── File selected ──────────────────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setStage("selected");
    setLimits(null);
    setExtractedText("");
    setExtractedPages(0);
    setExtractProgress(null);
    setPasswordPrompt(null);
    trackUploadPdf({ file_name: file.name });
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setStage("idle");
    setLimits(null);
    setExtractedText("");
    setExtractedPages(0);
  }, []);


  // ── Step 1: Click Extract → server authorize first ─────────────────────────
  const handleExtract = useCallback(async () => {
    if (!selectedFile || stage !== "selected") return;

    const isImage = selectedFile.type.startsWith("image/");
    const kind = isImage ? "ocr" : "text";

    setStage("authorizing");
    try {
      const res = await fetch("/api/extract/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, filename: selectedFile.name, fileSize: selectedFile.size }),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.code === "trial_complete") {
          setStage("selected");
          showToast(data.error || "Free trial complete.", "error");
          return;
        }
        if (res.status === 429) {
          setStage("selected");
          showToast(data.error || "Too many attempts. Please wait.", "error");
          return;
        }
        setStage("selected");
        showToast(data.error || "Server busy. Please try again.", "error");
        return;
      }

      const serverLimits: ServerLimits = {
        conversionId: data.conversionId,
        maxPages: data.maxPages,
        maxChars: data.maxChars,
        isTrial: data.isTrial,
        kind: data.kind,
      };
      setLimits(serverLimits);

      if (isImage || data.kind === "ocr") {
        await runOcr(selectedFile, serverLimits);
      } else {
        await runTextExtraction(selectedFile, serverLimits);
      }
    } catch {
      setStage("selected");
      showToast("Server busy. Please try again.", "error");
    }
  }, [selectedFile, stage, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Text extraction (browser-side, page-limited by server) ────────────────
  const runTextExtraction = useCallback(async (file: File, serverLimits: ServerLimits) => {
    setStage("extracting");
    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await openPdf(pdfjs, arrayBuffer);
      const pageCount = Math.min(pdf.numPages, serverLimits.maxPages);
      setExtractProgress({ page: 0, total: pageCount });

      let fullText = "";
      let foundImageOnlyPage = false;

      for (let i = 1; i <= pageCount; i++) {
        await new Promise((r) => setTimeout(r, 0)); // yield to browser
        setExtractProgress({ page: i, total: pageCount });
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as { str: string }[]).map((it) => it.str).join(" ") + "\n";
        const isImagePage = pageText.replace(/\s/g, "").length < 80;

        if (isImagePage && !foundImageOnlyPage) {
          // Mixed PDF: switch to OCR, re-authorize for OCR limits
          foundImageOnlyPage = true;
          setStage("ocr_reauth");
          const ocrLimits = await reauthorizeForOcr(serverLimits.conversionId);
          if (!ocrLimits) return; // error already shown
          await runOcr(file, ocrLimits);
          return;
        }

        fullText += pageText;
        if (fullText.length >= serverLimits.maxChars) break;
      }

      if (fullText.replace(/\s/g, "").length < 30) {
        setStage("selected");
        showToast("Couldn't read this PDF. Try a different file or incognito mode.", "error");
        return;
      }

      setExtractedText(fullText);
      setExtractedPages(pageCount);
      setStage("extracted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't read this PDF.";
      if (msg.toLowerCase().includes("password")) {
        setPasswordPrompt({ incorrect: false });
        // stage stays as extracting — password modal is shown
      } else {
        setStage("selected");
        showToast(msg, "error");
      }
    }
  }, [showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-authorize for OCR (reuses same reservation) ─────────────────────────
  const reauthorizeForOcr = useCallback(async (conversionId: string): Promise<ServerLimits | null> => {
    try {
      const res = await fetch("/api/extract/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "ocr", conversionId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStage("selected");
        showToast(data.error || "Server busy. Please try again.", "error");
        return null;
      }
      const newLimits: ServerLimits = {
        conversionId: data.conversionId,
        maxPages: data.maxPages,
        maxChars: data.maxChars,
        isTrial: data.isTrial,
        kind: "ocr",
      };
      setLimits(newLimits);
      return newLimits;
    } catch {
      setStage("selected");
      showToast("Server busy. Please try again.", "error");
      return null;
    }
  }, [showToast]);

  // ── OCR extraction (browser renders pages, calls /api/ocr/parse per page) ──
  const runOcr = useCallback(async (file: File, serverLimits: ServerLimits) => {
    setStage("ocr_running");
    const pageLimit = serverLimits.maxPages; // 1 for trial, 100 for paid
    setExtractProgress({ page: 0, total: pageLimit });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ocr/parse", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(120_000),
      });
      setExtractProgress({ page: pageLimit, total: pageLimit });
      if (!res.ok) {
        setStage("selected");
        showToast("Couldn't read this PDF.", "error");
        return;
      }
      const data = await res.json();
      if (!data.success || !data.text) {
        setStage("selected");
        showToast(data.error || "Couldn't read this PDF.", "error");
        return;
      }
      const text = String(data.text);
      setExtractedText(text);
      setExtractedPages(1);
      setLimits(serverLimits);
      setStage("extracted");
    } catch {
      setStage("selected");
      showToast("Couldn't read this PDF.", "error");
    }
  }, [showToast]);

  // ── PDF.js helpers ─────────────────────────────────────────────────────────
  async function loadPdfJs() {
    const PDFJS_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/legacy/build/pdf.min.mjs";
    type PdfJsModule = {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (args: { data: ArrayBuffer; password?: string }) => {
        onPassword?: (update: (pw: string) => void, reason: number) => void;
        promise: Promise<{
          numPages: number;
          getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }>;
        }>;
      };
    };
    const mod = (await import(/* webpackIgnore: true */ PDFJS_URL)) as PdfJsModule;
    mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    return mod;
  }

  async function openPdf(pdfjs: Awaited<ReturnType<typeof loadPdfJs>>, arrayBuffer: ArrayBuffer) {
    return new Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }>;
    }>((resolve, reject) => {
      const task = pdfjs.getDocument({ data: arrayBuffer });
      task.onPassword = (_update, reason) => {
        setPasswordPrompt({ incorrect: reason === 2 });
        pendingPasswordRef.current = { resolve: _update };
      };
      task.promise.then(resolve, reject);
    });
  }

  // ── Password submit ────────────────────────────────────────────────────────
  const submitPassword = () => {
    const pw = pdfPassword;
    setPdfPassword("");
    setPasswordPrompt(null);
    pendingPasswordRef.current?.resolve(pw);
    pendingPasswordRef.current = null;
  };

  // ── Step 2: Click Convert → server convert ─────────────────────────────────
  const handleConvert = useCallback(async () => {
    if (!limits || !extractedText || stage !== "extracted") return;
    setStage("converting");
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversionId: limits.conversionId,
          text: extractedText,
          pagesSubmitted: extractedPages,
          kind: limits.kind,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStage("extracted");
        if (data.code === "too_many") {
          showToast(`Too many attempts. Retry in ${data.retryAfterSec ?? 30}s.`, "error");
        } else {
          showToast(data.error || "Server busy. Please try again.", "error");
        }
        return;
      }
      setStage("done");
      router.push(`/preview/${data.jobId}`);
    } catch {
      setStage("extracted");
      showToast("Server busy. Please try again.", "error");
    }
  }, [limits, extractedText, extractedPages, stage, router, showToast]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  const isWorking = ["authorizing", "extracting", "ocr_reauth", "ocr_running", "converting", "done"].includes(stage);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center h-16 px-6 bg-white border-b border-slate-200 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg">StatementToExcel</span>
        </Link>
        <span className="flex-1" />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-sm text-slate-600">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Secure & Private
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-primary-100 text-primary-700 hover:bg-primary-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT PANEL: Stats + Testimonials ── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-slate-200 bg-white">
          <div className="flex flex-col h-full p-6 gap-5">

            {/* Stats grid — TOP */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              {[
                { val: "10K+", label: "Converted", color: "bg-blue-50 text-blue-700" },
                { val: "99%+", label: "Accuracy", color: "bg-green-50 text-green-700" },
                { val: "350+", label: "Banks", color: "bg-violet-50 text-violet-700" },
                { val: "4.9★", label: "Rating", color: "bg-amber-50 text-amber-700" },
              ].map((s) => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                  <p className="text-lg font-bold leading-none">{s.val}</p>
                  <p className="text-xs mt-1 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonials — BOTTOM, fill remaining space */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex-shrink-0">What people say</p>
              {[
                { quote: "Saved me hours every month. The lender accepted the output immediately.", name: "Sarah M.", role: "Chartered Accountant" },
                { quote: "Works perfectly with scanned statements. Far better than anything else.", name: "David R.", role: "Business Owner" },
                { quote: "Live preview is a game changer — I fix errors before downloading.", name: "Maria L.", role: "Freelance Bookkeeper" },
              ].map((t) => (
                <div key={t.name} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-shrink-0">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">"{t.quote}"</p>
                  <p className="text-xs font-semibold text-slate-900">{t.name} <span className="font-normal text-slate-400">· {t.role}</span></p>
                </div>
              ))}
            </div>

          </div>
        </aside>

        {/* ── CENTER: Upload / Conversion ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6 overflow-y-auto">

          {/* Upload zone */}
          {stage === "idle" && (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Convert Bank Statement to Excel
                </h1>
                <p className="text-slate-500 text-sm">
                  Upload your PDF — get a clean, editable spreadsheet in seconds.
                </p>
              </div>
              <div className="w-full max-w-md">
                <UploadZone
                  ref={uploadZoneRef}
                  onFileSelect={handleFileSelect}
                  isCollapsed={false}
                />
              </div>
              <div className="flex items-center gap-5 text-xs text-slate-400">
                {["SSL Encrypted", "99%+ Accuracy", "Files Auto-Deleted", "No Signup"].map((badge) => (
                  <div key={badge} className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {badge}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* File selected card */}
          {(stage === "selected" || isWorking || stage === "extracted") && selectedFile && (
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate text-sm">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {stage === "selected" && (
                <button onClick={handleRemoveFile} className="text-slate-300 hover:text-slate-500 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Progress bar */}
          {(stage === "extracting" || stage === "ocr_running") && extractProgress && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Reading page {extractProgress.page} of {extractProgress.total}…</span>
                <span>{Math.round((extractProgress.page / Math.max(extractProgress.total, 1)) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${extractProgress.total > 0 ? (extractProgress.page / extractProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Status messages */}
          {["authorizing", "ocr_reauth", "converting"].includes(stage) && (
            <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
              {stage === "authorizing" && "Preparing conversion…"}
              {stage === "ocr_reauth" && "Switching to advanced OCR…"}
              {stage === "converting" && "Creating your Excel file…"}
            </div>
          )}
          {stage === "done" && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done! Redirecting to your preview…
            </div>
          )}

          {/* Action buttons */}
          {stage === "selected" && (
            <button
              onClick={handleExtract}
              className="px-10 py-3.5 bg-primary-600 text-white rounded-xl font-semibold text-base hover:bg-primary-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
            >
              Convert to Excel →
            </button>
          )}
          {stage === "extracted" && (
            <button
              onClick={handleConvert}
              className="px-10 py-3.5 bg-primary-600 text-white rounded-xl font-semibold text-base hover:bg-primary-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
            >
              Download Excel →
            </button>
          )}
          {isWorking && !["extracted", "done"].includes(stage) && (
            <button disabled className="px-10 py-3.5 bg-primary-300 text-white rounded-xl font-semibold text-base cursor-not-allowed flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Processing…
            </button>
          )}
        </div>

        {/* ── RIGHT PANEL: Lifetime + Why choose us ── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-slate-200 bg-white">
          <div className="flex flex-col h-full p-6 gap-5">

            {/* Lifetime plan — TOP */}
            <div className="rounded-2xl bg-gradient-to-b from-primary-600 to-primary-800 p-5 text-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="font-bold text-sm">Lifetime Access</p>
              </div>
              <p className="text-primary-200 text-xs leading-relaxed mb-4">
                One payment. Unlimited conversions forever — no subscriptions, no renewal fees.
              </p>
              <div className="space-y-1.5 mb-4">
                {["Unlimited conversions", "All export formats", "Priority processing", "30-day money-back"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-primary-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-primary-100">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className="block w-full bg-white text-primary-700 text-center py-2.5 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors"
              >
                Get Lifetime Access →
              </Link>
            </div>

            {/* Why choose us — BOTTOM */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex-shrink-0">Why choose us</p>
              <div className="flex flex-col gap-2">
                {[
                  {
                    title: "Live Editable Preview",
                    desc: "Review and fix every row before you download.",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ),
                  },
                  {
                    title: "350+ Banks Supported",
                    desc: "HDFC, Chase, Barclays, HSBC auto-detected.",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    ),
                  },
                  {
                    title: "Scanned PDF & OCR",
                    desc: "Reads image-based and scanned statements.",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                  },
                  {
                    title: "No Merged Cells",
                    desc: "Clean output ready for QuickBooks & Xero.",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
                      </svg>
                    ),
                  },
                  {
                    title: "Bank-Grade Security",
                    desc: "256-bit SSL. Files deleted in 1 hour.",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                  },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-none mb-0.5">{f.title}</p>
                      <p className="text-xs text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* PDF password modal */}
      {passwordPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-slate-800 mb-1">Password Protected</h2>
            <p className="text-sm text-slate-500 mb-4">
              {passwordPrompt.incorrect ? "Incorrect password. Try again." : "This PDF requires a password."}
            </p>
            <input
              type="password"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPassword()}
              placeholder="Enter PDF password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={submitPassword}
                className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm font-medium"
              >
                Unlock
              </button>
              <button
                onClick={() => { setPasswordPrompt(null); setStage("selected"); }}
                className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login modal */}
      {showLogin && (
        <LoginModal
          isOpen
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
