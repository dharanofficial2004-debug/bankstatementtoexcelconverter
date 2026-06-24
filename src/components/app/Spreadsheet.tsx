"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import SpreadsheetCell from "./SpreadsheetCell";
import SpreadsheetToolbar from "./SpreadsheetToolbar";
import SpreadsheetStatusBar from "./SpreadsheetStatusBar";
import ContextMenu from "./ContextMenu";
import {
  Transaction,
  CellPosition,
  ContextMenuState,
  UndoAction,
  COLUMNS,
  GHOST_DATA,
} from "@/lib/types";
import { cellRef as getCellRef, cn } from "@/lib/utils";

interface SpreadsheetProps {
  transactions: Transaction[];
  bankDetected: string | null;
  isGhostMode: boolean;
  onTransactionsChange: (transactions: Transaction[]) => void;
  headers?: string[];
}

export default function Spreadsheet({
  transactions,
  bankDetected,
  isGhostMode,
  onTransactionsChange,
  headers,
}: SpreadsheetProps) {
  const data = isGhostMode ? GHOST_DATA : transactions;

  const columns = useMemo(() => {
    if (!headers || headers.length === 0) return COLUMNS;
    return headers.map((header, idx) => {
      const hLower = header.toLowerCase();
      let type: "number" | "text" | "date" | "currency" = "text";
      if (hLower.includes("date")) type = "date";
      else if (hLower.includes("withdrawal") || hLower.includes("debit") || hLower.includes("deposit") || hLower.includes("credit") || hLower.includes("balance") || hLower.includes("amount")) {
        type = "currency";
      }
      return {
        key: `col${idx}`,
        label: header,
        letter: String.fromCharCode(65 + idx),
        width: hLower.includes("description") || hLower.includes("particulars") || hLower.includes("narration") ? 280 : 120,
        type
      };
    });
  }, [headers]);

  const COL_KEYS = useMemo(() => {
    return columns.map((col) => col.key);
  }, [columns]);

  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [rangeStart, setRangeStart] = useState<CellPosition | null>(null);
  const [rangeEnd, setRangeEnd] = useState<CellPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    row: 0,
    col: 0,
  });
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);
  const [isEdited, setIsEdited] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((t) =>
      columns.some(col => (t[col.key] || "").toLowerCase().includes(q))
    );
  }, [data, searchQuery, columns]);

  // Get cell value by position
  const getCellValue = useCallback(
    (row: number, col: number): string => {
      if (col === 0) return String(row + 1);
      const key = COL_KEYS[col - 1];
      return filteredData[row]?.[key] || "";
    },
    [filteredData, COL_KEYS]
  );

  // Calculate selected range cells
  const isInRange = useCallback(
    (row: number, col: number): boolean => {
      if (!rangeStart || !rangeEnd) return false;
      const minRow = Math.min(rangeStart.row, rangeEnd.row);
      const maxRow = Math.max(rangeStart.row, rangeEnd.row);
      const minCol = Math.min(rangeStart.col, rangeEnd.col);
      const maxCol = Math.max(rangeStart.col, rangeEnd.col);
      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    },
    [rangeStart, rangeEnd]
  );

  // Count selected cells
  const selectedCount = useMemo(() => {
    if (!rangeStart || !rangeEnd) return selectedCell ? 1 : 0;
    const rowCount = Math.abs(rangeEnd.row - rangeStart.row) + 1;
    const colCount = Math.abs(rangeEnd.col - rangeStart.col) + 1;
    return rowCount * colCount;
  }, [rangeStart, rangeEnd, selectedCell]);

  // Calculate selected cells numeric sum
  const selectedSum = useMemo(() => {
    let sum = 0;
    let hasNumbers = false;
    if (rangeStart && rangeEnd) {
      const minRow = Math.min(rangeStart.row, rangeEnd.row);
      const maxRow = Math.max(rangeStart.row, rangeEnd.row);
      const minCol = Math.min(rangeStart.col, rangeEnd.col);
      const maxCol = Math.max(rangeStart.col, rangeEnd.col);
      
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (c === 0) continue; // Skip row number column
          const val = getCellValue(r, c);
          const cleaned = val.replace(/,/g, "").trim();
          const num = parseFloat(cleaned);
          if (cleaned && !isNaN(num)) {
            sum += num;
            hasNumbers = true;
          }
        }
      }
    }
    return hasNumbers ? sum : null;
  }, [rangeStart, rangeEnd, getCellValue]);

  // Cell selection
  const handleSelect = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditingCell(null);
    setRangeStart(null);
    setRangeEnd(null);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  // Double-click to edit
  const handleDoubleClick = useCallback(
    (row: number, col: number) => {
      if (col === 0 || isGhostMode) return;
      setEditingCell({ row, col });
      setSelectedCell({ row, col });
    },
    [isGhostMode]
  );

  // Cell edit complete
  const handleEdit = useCallback(
    (row: number, col: number, value: string) => {
      if (isGhostMode) return;
      const key = COL_KEYS[col - 1];
      const oldValue = filteredData[row]?.[key] || "";
      if (value !== oldValue) {
        // Find original index in transactions
        const originalIndex = transactions.findIndex(
          (t) => t.id === filteredData[row].id
        );
        if (originalIndex !== -1) {
          const updated = [...transactions];
          updated[originalIndex] = { ...updated[originalIndex], [key]: value };
          onTransactionsChange(updated);
          setUndoStack((prev) => [
            ...prev,
            { row: originalIndex, col, oldValue, newValue: value },
          ]);
          setRedoStack([]);
          setIsEdited(true);
        }
      }
      setEditingCell(null);
    },
    [isGhostMode, filteredData, transactions, onTransactionsChange, COL_KEYS]
  );

  // Keyboard navigation
  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent, row: number, col: number) => {
      const maxRow = filteredData.length - 1;
      const maxCol = columns.length - 1;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (row > 0) handleSelect(row - 1, col);
          break;
        case "ArrowDown":
        case "Enter":
          e.preventDefault();
          if (row < maxRow) handleSelect(row + 1, col);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (col > 0) handleSelect(row, col - 1);
          break;
        case "ArrowRight":
        case "Tab":
          e.preventDefault();
          if (col < maxCol) handleSelect(row, col + 1);
          else if (row < maxRow) handleSelect(row + 1, 0);
          break;
        case "Delete":
        case "Backspace":
          if (!editingCell && col > 0 && !isGhostMode) {
            e.preventDefault();
            handleEdit(row, col, "");
          }
          break;
        case "F2":
          e.preventDefault();
          if (col > 0 && !isGhostMode) {
            setEditingCell({ row, col });
          }
          break;
        default:
          // Start editing by typing
          if (
            !editingCell &&
            col > 0 &&
            !isGhostMode &&
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey
          ) {
            setEditingCell({ row, col });
          }
          break;
      }
    },
    [filteredData.length, handleSelect, handleEdit, editingCell, isGhostMode]
  );

  // Drag selection
  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      setIsDragging(true);
      setRangeStart({ row, col });
      setRangeEnd({ row, col });
      setSelectedCell({ row, col });
      setEditingCell(null);
    },
    []
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isDragging) {
        setRangeEnd({ row, col });
      }
    },
    [isDragging]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      if (isGhostMode) return;
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        row,
        col,
      });
      setSelectedCell({ row, col });
    },
    [isGhostMode]
  );

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    const key = COL_KEYS[action.col - 1];
    const updated = [...transactions];
    updated[action.row] = { ...updated[action.row], [key]: action.oldValue };
    onTransactionsChange(updated);
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, action]);
  }, [undoStack, transactions, onTransactionsChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    const key = COL_KEYS[action.col - 1];
    const updated = [...transactions];
    updated[action.row] = { ...updated[action.row], [key]: action.newValue };
    onTransactionsChange(updated);
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, action]);
  }, [redoStack, transactions, onTransactionsChange]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedCell) {
        const val = getCellValue(selectedCell.row, selectedCell.col);
        navigator.clipboard.writeText(val);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleUndo, handleRedo, selectedCell, getCellValue]);

  // Helper to create a new row populated with all key fields
  const createEmptyRow = useCallback((): Transaction => {
    const row: Transaction = {
      id: crypto.randomUUID(),
      date: "",
      description: "",
      chqRefNo: "",
      debit: "",
      credit: "",
      balance: "",
    };
    columns.forEach((col) => {
      row[col.key] = "";
    });
    return row;
  }, [columns]);

  // Row operations
  const handleAddRow = useCallback(() => {
    if (isGhostMode) return;
    const newRow = createEmptyRow();
    const insertAt = selectedCell ? selectedCell.row + 1 : transactions.length;
    const updated = [...transactions];
    updated.splice(insertAt, 0, newRow);
    onTransactionsChange(updated);
  }, [isGhostMode, selectedCell, transactions, onTransactionsChange, createEmptyRow]);

  const handleDeleteRow = useCallback(() => {
    if (isGhostMode || !selectedCell) return;
    const originalIndex = transactions.findIndex(
      (t) => t.id === filteredData[selectedCell.row]?.id
    );
    if (originalIndex !== -1) {
      const updated = transactions.filter((_, i) => i !== originalIndex);
      onTransactionsChange(updated);
      if (selectedCell.row >= updated.length) {
        setSelectedCell(
          updated.length > 0 ? { row: updated.length - 1, col: selectedCell.col } : null
        );
      }
    }
  }, [isGhostMode, selectedCell, transactions, filteredData, onTransactionsChange]);

  const handleInsertRowAbove = useCallback(() => {
    if (isGhostMode) return;
    const newRow = createEmptyRow();
    const idx = contextMenu.row;
    const originalIndex = transactions.findIndex(
      (t) => t.id === filteredData[idx]?.id
    );
    const updated = [...transactions];
    updated.splice(originalIndex, 0, newRow);
    onTransactionsChange(updated);
  }, [isGhostMode, contextMenu.row, transactions, filteredData, onTransactionsChange, createEmptyRow]);

  const handleInsertRowBelow = useCallback(() => {
    if (isGhostMode) return;
    const newRow = createEmptyRow();
    const idx = contextMenu.row;
    const originalIndex = transactions.findIndex(
      (t) => t.id === filteredData[idx]?.id
    );
    const updated = [...transactions];
    updated.splice(originalIndex + 1, 0, newRow);
    onTransactionsChange(updated);
  }, [isGhostMode, contextMenu.row, transactions, filteredData, onTransactionsChange, createEmptyRow]);

  const handleClearCell = useCallback(() => {
    handleEdit(contextMenu.row, contextMenu.col, "");
  }, [contextMenu.row, contextMenu.col, handleEdit]);

  const handleCopyValue = useCallback(() => {
    const val = getCellValue(contextMenu.row, contextMenu.col);
    navigator.clipboard.writeText(val);
  }, [contextMenu.row, contextMenu.col, getCellValue]);

  // Select whole column
  const handleColumnClick = useCallback(
    (colIndex: number) => {
      setRangeStart({ row: 0, col: colIndex });
      setRangeEnd({ row: filteredData.length - 1, col: colIndex });
      setSelectedCell({ row: 0, col: colIndex });
    },
    [filteredData.length]
  );

  // Select whole row
  const handleRowClick = useCallback(
    (rowIndex: number) => {
      setRangeStart({ row: rowIndex, col: 0 });
      setRangeEnd({ row: rowIndex, col: columns.length - 1 });
      setSelectedCell({ row: rowIndex, col: 0 });
    },
    []
  );

  const currentCellRef = selectedCell
    ? getCellRef(selectedCell.row, selectedCell.col)
    : "";
  const currentCellValue = selectedCell
    ? getCellValue(selectedCell.row, selectedCell.col)
    : "";

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-sheet-border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <SpreadsheetToolbar
        cellRef={currentCellRef}
        cellValue={currentCellValue}
        bankDetected={bankDetected}
        transactionCount={filteredData.length}
        isGhostMode={isGhostMode}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Spreadsheet Grid */}
      <div
        ref={containerRef}
        className="spreadsheet-container flex-1"
        role="grid"
      >
        <table
          className="border-collapse w-full"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 42 }} /> {/* Row number col */}
            {columns.map((col, i) => (
              <col key={i} style={{ width: col.width }} />
            ))}
          </colgroup>

          {/* Column Headers */}
          <thead>
            <tr>
              {/* Corner cell */}
              <th className="sheet-cell sheet-cell--corner w-[42px]">
                <span className="sr-only">Row</span>
              </th>
              {columns.map((col, i) => (
                <th
                  key={col.letter}
                  className={cn(
                    "sheet-cell sheet-cell--header cursor-pointer",
                    "hover:bg-slate-200 transition-colors"
                  )}
                  onClick={() => handleColumnClick(i + 1)}
                >
                  {col.letter}
                </th>
              ))}
            </tr>
            {/* Data header row (Row 1 with column names) */}
            <tr>
              <td className="sheet-cell sheet-cell--row-number sheet-cell--corner bg-primary-50 font-semibold text-primary-600 text-xs">
                
              </td>
              {columns.map((col) => (
                <td
                  key={`header-${col.key}`}
                  className="sheet-cell bg-primary-50 text-primary-800 font-semibold text-xs border-b-2 border-b-primary-200"
                >
                  {col.label}
                </td>
              ))}
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn(
                  "group",
                  rowIndex % 2 === 1 && "bg-sheet-row-alt"
                )}
              >
                {/* Row number */}
                <td
                  className={cn(
                    "sheet-cell sheet-cell--row-number cursor-pointer",
                    "hover:bg-slate-200 transition-colors"
                  )}
                  onClick={() => handleRowClick(rowIndex)}
                >
                  {rowIndex + 1}
                </td>

                {/* Data cells */}
                {columns.map((col, colIndex) => {
                  const actualColIndex = colIndex + 1;
                  const value = (row[col.key as keyof Transaction] as string) || "";
                  const isSelected =
                    selectedCell?.row === rowIndex &&
                    selectedCell?.col === actualColIndex;
                  const isEditingThis =
                    editingCell?.row === rowIndex &&
                    editingCell?.col === actualColIndex;

                  return (
                    <SpreadsheetCell
                      key={`${row.id}-${actualColIndex}`}
                      value={value}
                      row={rowIndex}
                      col={actualColIndex}
                      isSelected={isSelected}
                      isEditing={isEditingThis}
                      isInRange={isInRange(rowIndex, actualColIndex)}
                      isDebit={false}
                      isCredit={false}
                      isGhost={isGhostMode}
                      onSelect={handleSelect}
                      onDoubleClick={handleDoubleClick}
                      onEdit={handleEdit}
                      onKeyNav={handleKeyNav}
                      onMouseDown={handleMouseDown}
                      onMouseEnter={handleMouseEnter}
                      onContextMenu={handleContextMenu}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <SpreadsheetStatusBar
        totalRows={filteredData.length}
        selectedCount={selectedCount}
        selectedSum={selectedSum}
        isEdited={isEdited}
        isGhostMode={isGhostMode}
      />

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
          onEditCell={() =>
            handleDoubleClick(contextMenu.row, contextMenu.col)
          }
          onInsertRowAbove={handleInsertRowAbove}
          onInsertRowBelow={handleInsertRowBelow}
          onDeleteRow={() => {
            setSelectedCell({ row: contextMenu.row, col: contextMenu.col });
            handleDeleteRow();
          }}
          onClearCell={handleClearCell}
          onCopyValue={handleCopyValue}
        />
      )}
    </div>
  );
}
