"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileText, Check, Loader2, Sparkles, Brain, Zap } from "lucide-react";

interface ProcessingStepsProps {
  fileName: string;
  currentStep: number; // 0: Uploading PDF, 1: Extracting text, 2: Analyzing with AI, 3: Preparing spreadsheet
  pageCount?: number;
}

const STEPS = [
  { label: "Reading your PDF", sublabel: "Loading file into memory" },
  { label: "Extracting text", sublabel: "Pulling content from all pages" },
  { label: "Analyzing with AI", sublabel: "Our AI is reading your transactions" },
  { label: "Preparing spreadsheet", sublabel: "Formatting data for preview" },
];

// Fun, reassuring tips that cycle during the AI step
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

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ProcessingSteps({
  fileName,
  currentStep,
  pageCount = 0,
}: ProcessingStepsProps) {
  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const startTimeRef = useRef<number>(Date.now());

  // Estimate: ~0.9s per page for AI, minimum 10s
  const estimatedSeconds = Math.max(10, Math.round((pageCount || 5) * 0.9));

  // Live timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Cycle tips every 2.5s only during AI step
  useEffect(() => {
    if (currentStep !== 2) return;
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % AI_TIPS.length);
    }, 2500);
    return () => clearInterval(id);
  }, [currentStep]);

  // Smooth progress bar
  useEffect(() => {
    const targets = [12, 38, 72, 96];
    const targetProgress = targets[currentStep] ?? 8;

    const id = setInterval(() => {
      setProgress((prev) => {
        if (Math.abs(prev - targetProgress) < 0.5) {
          clearInterval(id);
          return targetProgress;
        }
        // Slow crawl during AI step to avoid jumping to 100 too fast
        const speed = currentStep === 2 ? 0.4 : 2;
        return prev < targetProgress
          ? Math.min(prev + speed, targetProgress)
          : Math.max(prev - speed, targetProgress);
      });
    }, 60);

    return () => clearInterval(id);
  }, [currentStep]);

  // During AI step, drift progress slightly based on elapsed time (optimism bias)
  useEffect(() => {
    if (currentStep !== 2) return;
    const id = setInterval(() => {
      setProgress((prev) => {
        // Drift up slowly but never past 90 (leave headroom for real completion)
        if (prev < 90) return Math.min(prev + 0.08, 90);
        return prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [currentStep]);

  const isOverEstimate = currentStep === 2 && elapsed > estimatedSeconds + 10;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-6 py-10">
      <div className="w-full max-w-sm">

        {/* ── File info card ── */}
        <div className="flex items-center gap-3 mb-7 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{fileName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {pageCount > 0 ? `${pageCount} page${pageCount > 1 ? "s" : ""} detected` : "Reading file…"}
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
              className="h-full rounded-full transition-none"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                transition: "width 0.6s ease-out",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mb-7">
          <span>{Math.round(progress)}%</span>
          {pageCount > 0 && currentStep <= 2 && (
            <span>
              {isOverEstimate
                ? "Almost done — large statements take a bit longer"
                : `Est. ~${formatElapsed(estimatedSeconds)} total`}
            </span>
          )}
        </div>

        {/* ── Steps ── */}
        <div className="space-y-2 mb-7">
          {STEPS.map((step, i) => {
            const isCompleted = currentStep > i;
            const isActive = currentStep === i;

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
                  isActive && "bg-primary-50 border border-primary-100 shadow-sm",
                  isCompleted && "opacity-60"
                )}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
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
                      isCompleted && "text-slate-400",
                      isActive && "text-primary-700",
                      !isCompleted && !isActive && "text-slate-300"
                    )}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-[11px] text-primary-400 mt-0.5 truncate">
                      {step.sublabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── AI cycling tip (only during step 2) ── */}
        {currentStep === 2 && (
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

        {/* ── During text extract step ── */}
        {currentStep === 1 && pageCount > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
            <Zap size={16} className="text-blue-500 flex-shrink-0" />
            <p className="text-sm text-slate-600">
              Extracting text from{" "}
              <span className="font-semibold text-blue-700">{pageCount} page{pageCount > 1 ? "s" : ""}</span>
              . This usually takes a few seconds.
            </p>
          </div>
        )}

        {/* ── Reassurance message when taking long ── */}
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
