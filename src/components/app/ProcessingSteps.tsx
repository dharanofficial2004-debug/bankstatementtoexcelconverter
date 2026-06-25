"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, Check, Loader2 } from "lucide-react";

interface ProcessingStepsProps {
  fileName: string;
  currentStep: number; // 0: Uploading PDF, 1: Extracting text, 2: Analyzing with AI, 3: Preparing spreadsheet
}

const STEPS = [
  { label: "Uploading PDF..." },
  { label: "Extracting text..." },
  { label: "Analyzing with AI..." },
  { label: "Preparing spreadsheet..." },
];

export default function ProcessingSteps({ fileName, currentStep }: ProcessingStepsProps) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Map currentStep to target progress value
    const targetProgress = [15, 45, 75, 95][currentStep] || 10;
    
    // Smoothly animate progress transition using functional state updater
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 1.5, targetProgress);
        } else if (prev > targetProgress) {
          return Math.max(prev - 1.5, targetProgress);
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 15);

    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-full max-w-md">
        {/* File info */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <FileText size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 truncate max-w-[300px]">
              {fileName}
            </p>
            <p className="text-xs text-slate-500">Processing bank statement...</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const isCompleted = currentStep > i;
            const isActive = currentStep === i;

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300",
                  isActive && "bg-primary-50",
                  isCompleted && "bg-success-50/50"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-success-500 flex items-center justify-center animate-check-in">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <Loader2 size={20} className="text-primary-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                  )}
                </div>

                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isCompleted && "text-success-700 font-medium",
                    isActive && "text-primary-700 font-medium",
                    !isCompleted && !isActive && "text-slate-400"
                  )}
                >
                  {isCompleted
                    ? step.label.replace("...", " ✓")
                    : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
