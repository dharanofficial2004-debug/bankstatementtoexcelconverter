"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";

interface SpreadsheetCellProps {
  value: string;
  row: number;
  col: number;
  isSelected: boolean;
  isEditing: boolean;
  isInRange: boolean;
  isDebit: boolean;
  isCredit: boolean;
  isGhost: boolean;
  onSelect: (row: number, col: number) => void;
  onDoubleClick: (row: number, col: number) => void;
  onEdit: (row: number, col: number, value: string) => void;
  onKeyNav: (e: React.KeyboardEvent, row: number, col: number) => void;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onContextMenu: (e: React.MouseEvent, row: number, col: number) => void;
}

const SpreadsheetCell = memo(function SpreadsheetCell({
  value,
  row,
  col,
  isSelected,
  isEditing,
  isInRange,
  isDebit,
  isCredit,
  isGhost,
  onSelect,
  onDoubleClick,
  onEdit,
  onKeyNav,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
}: SpreadsheetCellProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      setEditValue(value);
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [isEditing, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing) {
        if (e.key === "Enter") {
          e.preventDefault();
          onEdit(row, col, editValue);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEditValue(value);
          onEdit(row, col, value);
        } else if (e.key === "Tab") {
          e.preventDefault();
          onEdit(row, col, editValue);
          onKeyNav(e, row, col);
        }
      } else {
        onKeyNav(e, row, col);
      }
    },
    [isEditing, editValue, value, row, col, onEdit, onKeyNav]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect(row, col);
    },
    [row, col, onSelect]
  );

  const handleDblClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onDoubleClick(row, col);
    },
    [row, col, onDoubleClick]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        onMouseDown(row, col);
      }
    },
    [row, col, onMouseDown]
  );

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(row, col);
  }, [row, col, onMouseEnter]);

  const handleContextMenuEvent = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e, row, col);
    },
    [row, col, onContextMenu]
  );

  return (
    <td
      ref={cellRef}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      className={cn(
        "sheet-cell",
        isSelected && !isEditing && "sheet-cell--selected",
        isEditing && "sheet-cell--editing",
        isInRange && !isSelected && "sheet-cell--in-range",
        isDebit && "text-error-600",
        isCredit && "text-success-600",
        isGhost && "text-slate-300",
        row % 2 === 1 && "bg-sheet-row-alt",
        !isGhost && !isSelected && !isInRange && "hover:bg-sheet-row-hover"
      )}
      onClick={handleClick}
      onDoubleClick={handleDblClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onContextMenu={handleContextMenuEvent}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onEdit(row, col, editValue)}
          className="w-full h-full px-2 py-1.5 text-sm font-mono outline-none bg-white border-none"
          autoComplete="off"
          spellCheck={false}
        />
      ) : (
        <span className="block truncate">{value}</span>
      )}
    </td>
  );
});

export default SpreadsheetCell;
