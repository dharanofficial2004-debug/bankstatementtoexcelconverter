"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BANK_COLORS } from "@/lib/types";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  Paintbrush,
  Type,
  Plus,
  Trash2,
  Search,
  Undo2,
  Redo2,
} from "lucide-react";

interface SpreadsheetToolbarProps {
  cellRef: string;
  cellValue: string;
  bankDetected: string | null;
  transactionCount: number;
  isGhostMode: boolean;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SpreadsheetToolbar({
  cellRef,
  cellValue,
  bankDetected,
  transactionCount,
  isGhostMode,
  onAddRow,
  onDeleteRow,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  searchQuery,
  onSearchChange,
}: SpreadsheetToolbarProps) {
  const bankInfo = bankDetected
    ? BANK_COLORS[bankDetected] || BANK_COLORS.GENERIC
    : null;

  return (
    <div className="border-b border-sheet-border bg-white">
      {/* Formula Bar */}
      <div className="flex items-center h-9 border-b border-sheet-border">
        {/* Cell Reference Box */}
        <div className="flex items-center justify-center w-20 h-full px-2 border-r border-sheet-border bg-sheet-header-bg">
          <span className="text-xs font-mono font-medium text-slate-600">
            {cellRef || "A1"}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-sheet-border mx-1" />

        {/* Cell Value Display */}
        <div className="flex-1 px-3 flex items-center">
          <span className="text-sm font-mono text-slate-700 truncate">
            {cellValue || ""}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center h-9 px-2 gap-0.5">
        {/* Undo / Redo */}
        <ToolbarButton
          icon={<Undo2 size={15} />}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          icon={<Redo2 size={15} />}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        />

        <ToolbarSeparator />

        {/* Format buttons (decorative) */}
        <ToolbarButton icon={<Bold size={15} />} title="Bold" decorative />
        <ToolbarButton icon={<Italic size={15} />} title="Italic" decorative />
        <ToolbarButton icon={<Underline size={15} />} title="Underline" decorative />

        <ToolbarSeparator />

        <ToolbarButton icon={<AlignLeft size={15} />} title="Align" decorative />
        <ToolbarButton icon={<Type size={15} />} title="Text Color" decorative />
        <ToolbarButton icon={<Paintbrush size={15} />} title="Fill Color" decorative />

        <ToolbarSeparator />

        {/* Action buttons */}
        <ToolbarButton
          icon={<Plus size={15} />}
          onClick={onAddRow}
          title="Add Row"
          disabled={isGhostMode}
        />
        <ToolbarButton
          icon={<Trash2 size={15} />}
          onClick={onDeleteRow}
          title="Delete Row"
          disabled={isGhostMode}
        />

        <ToolbarSeparator />

        {/* Search */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-6 pl-7 pr-2 w-40 text-xs bg-slate-50 border border-slate-200 rounded 
              focus:outline-none focus:border-primary-400 focus:bg-white
              transition-colors font-sans"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bank Badge & Count */}
        {bankInfo && !isGhostMode && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
              bankInfo.bg,
              bankInfo.text
            )}
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {bankInfo.label} detected
          </div>
        )}

        {!isGhostMode && (
          <div className="ml-3 text-xs text-slate-500 font-medium">
            {transactionCount} transactions
          </div>
        )}

        {isGhostMode && (
          <div className="text-xs text-slate-400 italic">
            Upload a PDF to get started
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  onClick,
  disabled,
  title,
  decorative,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  decorative?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || decorative}
      title={title}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded",
        "text-slate-500 transition-colors",
        !disabled && !decorative && "hover:bg-slate-100 hover:text-slate-700 cursor-pointer",
        disabled && "opacity-40 cursor-not-allowed",
        decorative && "opacity-60 cursor-default"
      )}
    >
      {icon}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />;
}
