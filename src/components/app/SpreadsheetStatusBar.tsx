"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Sheet } from "@/lib/types";



interface SpreadsheetStatusBarProps {
  totalRows: number;
  selectedCount: number;
  selectedSum: number | null;
  isEdited: boolean;
  isGhostMode: boolean;
  sheets?: Sheet[];
  activeSheetId?: string;
  onSheetsChange?: React.Dispatch<React.SetStateAction<Sheet[]>>;
  onActiveSheetIdChange?: (id: string) => void;
}

export default function SpreadsheetStatusBar({
  totalRows,
  selectedCount,
  selectedSum,
  isEdited,
  isGhostMode,
  sheets = [],
  activeSheetId = "",
  onSheetsChange,
  onActiveSheetIdChange,
}: SpreadsheetStatusBarProps) {
  return (
    <div className="flex items-center h-8 border-t border-sheet-border bg-slate-50 text-xs select-none">
      {/* Sheet Tabs */}
      <div className="flex items-center h-full px-1 border-r border-sheet-border overflow-x-auto max-w-[60%] scrollbar-none gap-0.5">
        {sheets.map((s) => {
          const isActive = s.id === activeSheetId;
          return (
            <div
              key={s.id}
              className={cn(
                "group flex items-center gap-1.5 h-full px-3 border-x border-t border-transparent cursor-pointer font-medium text-slate-600 transition-all select-none border-b-2",
                isActive
                  ? "bg-white text-primary-700 border-t-sheet-border border-x-sheet-border border-b-primary-600 font-semibold"
                  : "hover:bg-slate-200 hover:text-slate-700 border-b-transparent"
              )}
              onClick={() => onActiveSheetIdChange?.(s.id)}
              onDoubleClick={() => {
                if (isGhostMode) return;
                const newName = prompt("Rename Sheet:", s.name);
                if (newName && newName.trim() && onSheetsChange) {
                  onSheetsChange((prev) =>
                    prev.map((sheet) =>
                      sheet.id === s.id ? { ...sheet, name: newName.trim() } : sheet
                    )
                  );
                }
              }}
            >
              <span className="truncate max-w-[120px]">{s.name}</span>
              {sheets.length > 1 && !isGhostMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(`Are you sure you want to delete sheet "${s.name}"?`) &&
                      onSheetsChange &&
                      onActiveSheetIdChange
                    ) {
                      const newSheets = sheets.filter((sheet) => sheet.id !== s.id);
                      onSheetsChange(newSheets);
                      if (isActive) {
                        onActiveSheetIdChange(newSheets[0].id);
                      }
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-slate-100 p-0.5 opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Add sheet button */}
        {!isGhostMode && onSheetsChange && onActiveSheetIdChange && (
          <button
            onClick={() => {
              const newSheet: Sheet = {
                id: crypto.randomUUID(),
                name: `Sheet ${sheets.length + 1}`,
                transactions: [],
                bankDetected: null,
                currencySymbol: "",
                headers: [],
              };
              onSheetsChange((prev) => [...prev, newSheet]);
              onActiveSheetIdChange(newSheet.id);
            }}
            className="flex items-center justify-center w-6 h-6 ml-1 text-slate-500 hover:text-primary-600 hover:bg-slate-200 rounded transition-colors"
            title="Add New Sheet"
          >
            <Plus size={13} />
          </button>
        )}
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

            {selectedSum !== null && (
              <span>
                Sum:{" "}
                <span className="text-primary-800 font-mono font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                  {selectedSum.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
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
