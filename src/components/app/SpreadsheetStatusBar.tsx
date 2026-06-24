"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpreadsheetStatusBarProps {
  totalRows: number;
  selectedCount: number;
  selectedDebitSum: number;
  selectedCreditSum: number;
  isEdited: boolean;
  isGhostMode: boolean;
}

export default function SpreadsheetStatusBar({
  totalRows,
  selectedCount,
  selectedDebitSum,
  selectedCreditSum,
  isEdited,
  isGhostMode,
}: SpreadsheetStatusBarProps) {
  return (
    <div className="flex items-center h-7 px-1 border-t border-sheet-border bg-sheet-header-bg text-xs select-none">
      {/* Sheet Tab */}
      <div className="flex items-center h-full">
        <div className="flex items-center h-full px-4 bg-white border-t-2 border-t-primary-600 border-x border-sheet-border rounded-t-sm -mb-px font-medium text-slate-700">
          Sheet1
        </div>
        <button className="flex items-center justify-center w-6 h-6 ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status indicators */}
      <div className="flex items-center gap-4 px-3 text-slate-500">
        {!isGhostMode && (
          <>
            <span>{totalRows} rows</span>

            {selectedCount > 1 && (
              <span className="text-primary-600 font-medium">
                {selectedCount} cells selected
              </span>
            )}

            {selectedDebitSum > 0 && (
              <span>
                Debit Sum:{" "}
                <span className="text-error-600 font-mono font-medium">
                  {selectedDebitSum.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </span>
            )}

            {selectedCreditSum > 0 && (
              <span>
                Credit Sum:{" "}
                <span className="text-success-600 font-mono font-medium">
                  {selectedCreditSum.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </span>
            )}

            {isEdited && (
              <span className={cn("flex items-center gap-1 text-warning-600 font-medium")}>
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                Edited
              </span>
            )}
          </>
        )}

        {isGhostMode && (
          <span className="text-slate-400 italic">Sample data — upload a PDF</span>
        )}
      </div>
    </div>
  );
}
