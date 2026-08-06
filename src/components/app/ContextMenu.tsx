"use client";

import React, { useEffect, useRef } from "react";
import {
  Pencil,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Trash2,
  Eraser,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEditCell: () => void;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onDeleteRow: () => void;
  onClearCell: () => void;
  onMoveColumnLeft?: () => void;
  onMoveColumnRight?: () => void;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onEditCell,
  onInsertRowAbove,
  onInsertRowBelow,
  onDeleteRow,
  onClearCell,
  onMoveColumnLeft,
  onMoveColumnRight,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position so menu stays on screen
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 280);

  const items = [
    { icon: <Pencil size={14} />, label: "Edit cell", onClick: onEditCell },
    { type: "separator" as const },
    {
      icon: <ArrowUpFromLine size={14} />,
      label: "Insert row above",
      onClick: onInsertRowAbove,
    },
    {
      icon: <ArrowDownFromLine size={14} />,
      label: "Insert row below",
      onClick: onInsertRowBelow,
    },
    {
      icon: <Trash2 size={14} />,
      label: "Delete row",
      onClick: onDeleteRow,
      danger: true,
    },
    { type: "separator" as const },
    { icon: <Eraser size={14} />, label: "Clear cell", onClick: onClearCell },
    { type: "separator" as const },
    {
      icon: <ArrowLeft size={14} />,
      label: "Move column left",
      onClick: onMoveColumnLeft || (() => {}),
    },
    {
      icon: <ArrowRight size={14} />,
      label: "Move column right",
      onClick: onMoveColumnRight || (() => {}),
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 animate-scale-in origin-top-left"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[180px]">
        {items.map((item, i) => {
          if ("type" in item && item.type === "separator") {
            return (
              <div key={i} className="h-px bg-slate-100 my-1 mx-2" />
            );
          }
          const menuItem = item as {
            icon: React.ReactNode;
            label: string;
            onClick: () => void;
            danger?: boolean;
          };
          return (
            <button
              key={i}
              onClick={() => {
                menuItem.onClick();
                onClose();
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-left
                transition-colors
                ${
                  menuItem.danger
                    ? "text-error-600 hover:bg-error-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
            >
              <span className="opacity-60">{menuItem.icon}</span>
              {menuItem.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
