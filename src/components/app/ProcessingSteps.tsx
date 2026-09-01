"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Check,
  Loader2,
  Sparkles,
  Brain,
  Zap,
  ScanLine,
  AlertTriangle,
} from "lucide-react";

interface ProcessingStepsProps {
  fileName: string;
  /**
   * 0 – Reading PDF
   * 1 – Extracting text  (or "Detecting document type" when OCR path)
   * 2 – OCR scanning     (only shown when isOcrMode = true)
   * 3 – Analyzing with AI
   * 4 – Preparing spreadsheet
   *
   * When isOcrMode = false steps 0-1 map to the first two labels and step 2
   * jumps straight to "Analyzing with AI", matching the original 4-step flow.
   */
  currentStep: number;
  pageCount?: number;
  /** Set to true once we know the PDF is scanned and OCR is running */
  isOcrMode?: boolean;
  /** Live OCR page progress, e.g. "3 / 12" */
  ocrPageProgress?: { current: number; total: number } | null;
}

// ─── step definitions ─────────────────────────────────────────────────────────

const NORMAL_STEPS = [
  { label: "Reading your PDF",        sublabel: "Loading file into memory" },
  { label: "Extracting text",         sublabel: "Pulling content from all pages" },
  { label: "Analyzing with AI",       sublabel: "Our AI is reading your transactions" },
  { label: "Preparing spreadsheet",   sublabel: "Formatting data for preview" },
];

const OCR_STEPS = [
  { label: "Reading your PDF",        sublabel: "Loading file into memory" },
  { label: "Detecting document type", sublabel: "Checking for embedded text" },
  { label: "OCR scanning",            sublabel: "Converting scanned images to text" },
  { label: "Analyzing with AI",       sublabel: "Our AI is reading your transactions" },
  { label: "Preparing spreadsheet",   sublabel: "Formatting data for preview" },
];

// ─── cycling tips ─────────────────────────────────────────────────────────────

const AI_TIPS = [
  "Identifying date formats across all pages…",
  "Reading debit and credit columns…",
  "Detecting your bank's statement layout…",
  "Verifying transaction amounts…",
  "Matching opening and closing balances…",
  "Handling multi-line transaction descriptions…",
  "Cleaning up currency symbols and commas…",
  "Almost there — structuring your final rows…",
];

const OCR_TIPS = [
  "Rasterising PDF pages to high-resolution images…",
  "Running character recognition on page content…",
  "Stitching text lines from scanned rows…",
  "Handling skewed or noisy scan regions…",
  "Assembling full-page text blocks…",
  "Preparing extracted text for AI analysis…",
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ProcessingSteps({
  fileName,
  currentStep,
  pageCount = 0,
  isOcrMode = false,
  ocrPageProgress = null,
}: ProcessingStepsProps) {
  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const startTimeRef = useRef<number>(Date.now());

  const steps = isOcrMode ? OCR_STEPS : NORMAL_STEPS;

  // OCR step index differs between modes
  const aiStepIndex  = isOcrMode ? 3 : 2;
  const ocrStepIndex = 2; // only relevant in OCR mode

  // Per-step estimated seconds
  const estimatedSeconds = isOcrMode
    ? Math.max(30, Math.round((pageCount || 10) * 2.5))   // ~2.5 s per page for OCR + AI
    : Math.max(10, Math.round((pageCount || 5) * 0.9));

  // Live timer — reset whenever the component mounts
  useEffect(() => {
    startTimeRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  // Cycle tips during the appropriate step
  useEffect(() => {
    const isTipStep =
      currentStep === aiStepIndex ||
      (isOcrMode && currentStep === ocrStepIndex);
    if (!isTipStep) return;
    const tips = currentStep === ocrStepIndex && isOcrMode ? OCR_TIPS : AI_TIPS;
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % tips.length),
      2500
    );
    return () => clearInterval(id);
  }, [currentStep, isOcrMode, aiStepIndex, ocrStepIndex]);

  // Smooth progress bar — different targets per step
  useEffect(() => {
    const targets = isOcrMode
      ? [8, 20, 55, 80, 97]   // 5-step OCR path
      : [12, 38, 72, 96];     // 4-step normal path
    const targetProgress = targets[currentStep] ?? 8;

    const id = setInterval(() => {
      setProgress((prev) => {
        if (Math.abs(prev - targetProgress) < 0.5) { clearInterval(id); return targetProgress; }
        const speed =
          currentStep === aiStepIndex || (isOcrMode && currentStep === ocrStepIndex)
            ? 0.4
            : 2;
        return prev < targetProgress
          ? Math.min(prev + speed, targetProgress)
          : Math.max(prev - speed, targetProgress);
      });
    }, 60);

    return () => clearInterval(id);
  }, [currentStep, isOcrMode, aiStepIndex, ocrStepIndex]);

  // Slow drift during OCR and AI steps
  useEffect(() => {
    const isDrift =
      currentStep === aiStepIndex || (isOcrMode && currentStep === ocrStepIndex);
    if (!isDrift) return;
    const id = setInterval(() => {
      setProgress((prev) => (prev < 90 ? Math.min(prev + 0.06, 90) : prev));
    }, 1000);
    return () => clearInterval(id);
  }, [currentStep, isOcrMode, aiStepIndex, ocrStepIndex]);

  const isOverEstimate = currentStep === aiStepIndex && elapsed > estimatedSeconds + 10;
  const activeTips = isOcrMode && currentStep === ocrStepIndex ? OCR_TIPS : AI_TIPS;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-6 py-10">
      <div className="w-full max-w-sm">

        {/* ── "Don't close tab" warning — shown only during OCR ── */}
        {isOcrMode && currentStep >= ocrStepIndex && currentStep < steps.length - 1 && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
            <AlertTriangle
              size={16}
              className="text-amber-500 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-amber-800 leading-tight">
                Scanned PDF detected — please don&apos;t close this tab
              </p>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                OCR takes longer than normal PDFs.{" "}
                {pageCount > 0
                  ? `Your ${pageCount}-page document may take up to ${Math.ceil(pageCount * 2.5)} seconds.`
                  : "Larger documents may take up to a minute."}
                {" "}Keep this tab open until processing is complete.
              </p>
            </div>
          </div>
        )}

        {/* ── File info card ── */}
        <div className="flex items-center gap-3 mb-7 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            {isOcrMode && currentStep === ocrStepIndex ? (
              <ScanLine size={20} className="text-violet-600" />
            ) : (
              <FileText size={20} className="text-primary-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{fileName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {ocrPageProgress
                ? `OCR: page ${ocrPageProgress.current} of ${ocrPageProgress.total}`
                : pageCount > 0
                ? `${pageCount} page${pageCount > 1 ? "s" : ""} detected`
                : "Reading file…"}
            </p>
          </div>
          {/* Live timer */}
          <div
            className="flex flex-col items-end flex-shrink-0"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-lg font-bold text-slate-800 tabular-nums leading-none">
              {formatElapsed(elapsed)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">elapsed</span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="relative mb-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  isOcrMode && currentStep === ocrStepIndex
                    ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                    : "linear-gradient(90deg, #3b82f6, #6366f1)",
                transition: "width 0.6s ease-out",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mb-7">
          <span>{Math.round(progress)}%</span>
          {pageCount > 0 && currentStep < steps.length - 1 && (
            <span>
              {isOverEstimate
                ? "Almost done — large statements take a bit longer"
                : `Est. ~${formatElapsed(estimatedSeconds)} total`}
            </span>
          )}
        </div>

        {/* ── Steps ── */}
        <div className="space-y-2 mb-7">
          {steps.map((step, i) => {
            const isCompleted = currentStep > i;
            const isActive    = currentStep === i;
            const isOcrStep   = isOcrMode && i === ocrStepIndex;

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
                  isActive && !isOcrStep && "bg-primary-50 border border-primary-100 shadow-sm",
                  isActive && isOcrStep  && "bg-violet-50 border border-violet-100 shadow-sm",
                  isCompleted && "opacity-60"
                )}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  ) : isActive && isOcrStep ? (
                    <ScanLine size={18} className="text-violet-600 animate-pulse" />
                  ) : isActive ? (
                    <Loader2 size={18} className="text-primary-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isCompleted              && "text-slate-400",
                      isActive && !isOcrStep   && "text-primary-700",
                      isActive && isOcrStep    && "text-violet-700",
                      !isCompleted && !isActive && "text-slate-300"
                    )}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <p className={cn(
                      "text-[11px] mt-0.5 truncate",
                      isOcrStep ? "text-violet-400" : "text-primary-400"
                    )}>
                      {step.sublabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── OCR cycling tip (only during OCR step) ── */}
        {isOcrMode && currentStep === ocrStepIndex && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ScanLine size={14} className="text-violet-500 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wide">
                OCR in progress
              </span>
            </div>
            <p
              key={tipIndex}
              className="text-sm text-slate-600 leading-relaxed animate-fade-in"
              style={{ minHeight: "1.5rem" }}
            >
              {activeTips[tipIndex]}
            </p>
            <div className="flex gap-1 mt-3">
              {activeTips.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-all duration-500",
                    i === tipIndex ? "bg-violet-400" : "bg-violet-100"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── AI cycling tip (only during AI step) ── */}
        {currentStep === aiStepIndex && (
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-violet-500 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wide">
                Intelligence at work
              </span>
            </div>
            <p
              key={tipIndex}
              className="text-sm text-slate-600 leading-relaxed animate-fade-in"
              style={{ minHeight: "1.5rem" }}
            >
              {AI_TIPS[tipIndex]}
            </p>
            <div className="flex gap-1 mt-3">
              {AI_TIPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-all duration-500",
                    i === tipIndex ? "bg-violet-400" : "bg-violet-100"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Normal text extract info ── */}
        {!isOcrMode && currentStep === 1 && pageCount > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
            <Zap size={16} className="text-blue-500 flex-shrink-0" />
            <p className="text-sm text-slate-600">
              Extracting text from{" "}
              <span className="font-semibold text-blue-700">
                {pageCount} page{pageCount > 1 ? "s" : ""}
              </span>
              . This usually takes a few seconds.
            </p>
          </div>
        )}

        {/* ── Reassurance when taking longer than expected ── */}
        {isOverEstimate && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              Your statement is quite detailed — the AI is taking extra care to
              capture every transaction accurately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
