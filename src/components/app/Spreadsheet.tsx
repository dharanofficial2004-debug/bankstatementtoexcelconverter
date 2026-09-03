"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import SpreadsheetCell from "./SpreadsheetCell";
import SpreadsheetToolbar from "./SpreadsheetToolbar";
import SpreadsheetStatusBar from "./SpreadsheetStatusBar";
import ContextMenu from "./ContextMenu";
import {
  Transaction,
  Sheet,
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
  sheets?: Sheet[];
  activeSheetId?: string;
  onSheetsChange?: React.Dispatch<React.SetStateAction<Sheet[]>>;
  onActiveSheetIdChange?: (id: string) => void;
}

export default function Spreadsheet({
  transactions,
  bankDetected,
  isGhostMode,
  onTransactionsChange,
  sheets = [],
  activeSheetId = "",
  onSheetsChange,
  onActiveSheetIdChange,
}: SpreadsheetProps) {
  const data = isGhostMode ? (transactions.length > 0 ? transactions : GHOST_DATA) : transactions;

  const [colOrder, setColOrder] = useState<string[]>(["date", "description", "debit", "credit", "balance", "cheque_number", "category"]);

  const columns = useMemo(() => {
    return colOrder.map(key => COLUMNS.find(c => c.key === key)!).filter(Boolean);
  }, [colOrder]);

  const COL_KEYS = useMemo(() => {
    return columns.map((col) => col.key);
  }, [columns]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
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

  // Sorted and searched data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const aVal = String(a[key] || "").trim();
        const bVal = String(b[key] || "").trim();

        // Check if numerical
        const aNum = parseFloat(aVal.replace(/,/g, ""));
        const bNum = parseFloat(bVal.replace(/,/g, ""));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        // Check if date (YYYY-MM-DD or standard formats)
        const aDate = Date.parse(aVal);
        const bDate = Date.parse(bVal);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return direction === "asc" ? aDate - bDate : bDate - aDate;
        }

        // Text comparison
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        columns.some((col) => String(t[col.key] || "").toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, sortConfig, searchQuery, columns]);

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
            { transactionId: filteredData[row].id, colKey: key, oldValue, newValue: value },
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
    [filteredData.length, columns.length, handleSelect, handleEdit, editingCell, isGhostMode]
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
    
    const updated = [...transactions];
    let changed = false;

    if (action.batch && action.batch.length > 0) {
      action.batch.forEach((item) => {
        const idx = updated.findIndex((t) => t.id === item.transactionId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], [item.colKey]: item.oldValue };
          changed = true;
        }
      });
    } else if (action.transactionId && action.colKey) {
      const idx = updated.findIndex((t) => t.id === action.transactionId);
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], [action.colKey]: action.oldValue || "" };
        changed = true;
      }
    }

    if (changed) {
      onTransactionsChange(updated);
    }
    
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, action]);
  }, [undoStack, transactions, onTransactionsChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    
    const updated = [...transactions];
    let changed = false;

    if (action.batch && action.batch.length > 0) {
      action.batch.forEach((item) => {
        const idx = updated.findIndex((t) => t.id === item.transactionId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], [item.colKey]: item.newValue };
          changed = true;
        }
      });
    } else if (action.transactionId && action.colKey) {
      const idx = updated.findIndex((t) => t.id === action.transactionId);
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], [action.colKey]: action.newValue || "" };
        changed = true;
      }
    }

    if (changed) {
      onTransactionsChange(updated);
    }

    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, action]);
  }, [redoStack, transactions, onTransactionsChange]);

  // Dynamic column widths state
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    date: 120,
    description: 350,
    debit: 140,
    credit: 140,
    balance: 140,
  });

  // Cell formatting styles
  const [cellStyles, setCellStyles] = useState<Record<string, { bold?: boolean; italic?: boolean; underline?: boolean }>>({});

  // Resize handler
  const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colKey] || 100;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(60, startWidth + deltaX);
      setColWidths((prev) => ({
        ...prev,
        [colKey]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [colWidths]);

  // Reorder/move column handler
  const handleMoveColumn = useCallback((colKey: string, direction: "left" | "right") => {
    const index = colOrder.indexOf(colKey);
    if (index === -1) return;
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= colOrder.length) return;

    const newOrder = [...colOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[newIndex];
    newOrder[newIndex] = temp;
    setColOrder(newOrder);
    
    // Reset selection coordinates
    setSelectedCell(null);
    setRangeStart(null);
    setRangeEnd(null);
  }, [colOrder]);

  // Toggle bold, italic, underline
  const toggleStyle = useCallback((styleName: "bold" | "italic" | "underline") => {
    if (isGhostMode) return;
    
    const cellsToToggle: { rowId: string; colKey: string }[] = [];
    if (rangeStart && rangeEnd) {
      const minRow = Math.min(rangeStart.row, rangeEnd.row);
      const maxRow = Math.max(rangeStart.row, rangeEnd.row);
      const minCol = Math.min(rangeStart.col, rangeEnd.col);
      const maxCol = Math.max(rangeStart.col, rangeEnd.col);

      for (let r = minRow; r <= maxRow; r++) {
        const rowId = filteredData[r]?.id;
        if (rowId) {
          for (let c = minCol; c <= maxCol; c++) {
            if (c === 0) continue;
            const colKey = COL_KEYS[c - 1];
            cellsToToggle.push({ rowId, colKey });
          }
        }
      }
    } else if (selectedCell) {
      const rowId = filteredData[selectedCell.row]?.id;
      if (rowId && selectedCell.col > 0) {
        const colKey = COL_KEYS[selectedCell.col - 1];
        cellsToToggle.push({ rowId, colKey });
      }
    }

    if (cellsToToggle.length === 0) return;

    const firstCellKey = `${cellsToToggle[0].rowId}-${cellsToToggle[0].colKey}`;
    const shouldEnable = !cellStyles[firstCellKey]?.[styleName];

    setCellStyles((prev) => {
      const updated = { ...prev };
      cellsToToggle.forEach(({ rowId, colKey }) => {
        const key = `${rowId}-${colKey}`;
        updated[key] = {
          ...updated[key],
          [styleName]: shouldEnable,
        };
      });
      return updated;
    });
  }, [rangeStart, rangeEnd, selectedCell, filteredData, COL_KEYS, cellStyles, isGhostMode]);

  // Clear selected cells contents
  const clearSelectedRange = useCallback(() => {
    if (isGhostMode) return;
    const minRow = rangeStart && rangeEnd ? Math.min(rangeStart.row, rangeEnd.row) : (selectedCell ? selectedCell.row : -1);
    const maxRow = rangeStart && rangeEnd ? Math.max(rangeStart.row, rangeEnd.row) : (selectedCell ? selectedCell.row : -1);
    const minCol = rangeStart && rangeEnd ? Math.min(rangeStart.col, rangeEnd.col) : (selectedCell ? selectedCell.col : -1);
    const maxCol = rangeStart && rangeEnd ? Math.max(rangeStart.col, rangeEnd.col) : (selectedCell ? selectedCell.col : -1);

    if (minRow === -1 || minCol === -1) return;

    const updated = [...transactions];
    const newEdits: { transactionId: string; colKey: string; oldValue: string; newValue: string }[] = [];
    let changed = false;

    for (let r = minRow; r <= maxRow; r++) {
      const originalIndex = transactions.findIndex(
        (t) => t.id === filteredData[r]?.id
      );
      if (originalIndex !== -1) {
        for (let c = minCol; c <= maxCol; c++) {
          if (c === 0) continue;
          const key = COL_KEYS[c - 1];
          const oldValue = updated[originalIndex][key] || "";
          if (oldValue !== "") {
            updated[originalIndex] = { ...updated[originalIndex], [key]: "" };
            newEdits.push({
              transactionId: filteredData[r].id,
              colKey: key,
              oldValue,
              newValue: ""
            });
            changed = true;
          }
        }
      }
    }

    if (changed) {
      onTransactionsChange(updated);
      setUndoStack((prev) => [...prev, { batch: newEdits }]);
      setRedoStack([]);
      setIsEdited(true);
    }
  }, [rangeStart, rangeEnd, selectedCell, transactions, filteredData, COL_KEYS, onTransactionsChange, isGhostMode]);

  // Style status checks for toolbar
  const isBoldActive = useMemo(() => {
    if (!selectedCell || selectedCell.col === 0) return false;
    const rowId = filteredData[selectedCell.row]?.id;
    const colKey = COL_KEYS[selectedCell.col - 1];
    return !!cellStyles[`${rowId}-${colKey}`]?.bold;
  }, [selectedCell, filteredData, COL_KEYS, cellStyles]);

  const isItalicActive = useMemo(() => {
    if (!selectedCell || selectedCell.col === 0) return false;
    const rowId = filteredData[selectedCell.row]?.id;
    const colKey = COL_KEYS[selectedCell.col - 1];
    return !!cellStyles[`${rowId}-${colKey}`]?.italic;
  }, [selectedCell, filteredData, COL_KEYS, cellStyles]);

  const isUnderlineActive = useMemo(() => {
    if (!selectedCell || selectedCell.col === 0) return false;
    const rowId = filteredData[selectedCell.row]?.id;
    const colKey = COL_KEYS[selectedCell.col - 1];
    return !!cellStyles[`${rowId}-${colKey}`]?.underline;
  }, [selectedCell, filteredData, COL_KEYS, cellStyles]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (isGhostMode) return;
        e.preventDefault();
        navigator.clipboard.readText().then((clipText) => {
          if (!clipText) return;
          const rows = clipText.split(/\r?\n/).map(row => row.split("\t"));
          if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
            rows.pop();
          }
          if (rows.length === 0) return;

          const startRow = selectedCell ? selectedCell.row : (rangeStart ? Math.min(rangeStart.row, rangeEnd!.row) : 0);
          const startCol = selectedCell ? selectedCell.col : (rangeStart ? Math.min(rangeStart.col, rangeEnd!.col) : 1);
          if (startCol === 0) return;

          const updated = [...transactions];
          const newEdits: { transactionId: string; colKey: string; oldValue: string; newValue: string }[] = [];
          let changed = false;

          rows.forEach((rowVals, rOffset) => {
            const targetRow = startRow + rOffset;
            if (targetRow >= filteredData.length) return;

            const tx = filteredData[targetRow];
            const originalIndex = transactions.findIndex(t => t.id === tx.id);
            if (originalIndex === -1) return;

            rowVals.forEach((val, cOffset) => {
              const targetCol = startCol + cOffset;
              if (targetCol <= 0 || targetCol > columns.length) return;

              const colKey = COL_KEYS[targetCol - 1];
              const oldValue = updated[originalIndex][colKey] || "";
              const newValue = val.trim();

              if (oldValue !== newValue) {
                updated[originalIndex] = {
                  ...updated[originalIndex],
                  [colKey]: newValue
                };
                newEdits.push({
                  transactionId: tx.id,
                  colKey,
                  oldValue,
                  newValue
                });
                changed = true;
              }
            });
          });

          if (changed) {
            onTransactionsChange(updated);
            setUndoStack((prev) => [...prev, { batch: newEdits }]);
            setRedoStack([]);
            setIsEdited(true);
          }
        }).catch((err) => {
          console.error("Failed to read clipboard text: ", err);
        });
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!editingCell) {
          e.preventDefault();
          clearSelectedRange();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleUndo, handleRedo, selectedCell, rangeStart, rangeEnd, getCellValue, editingCell, clearSelectedRange]);

  // Helper to create a new row populated with all key fields
  const createEmptyRow = useCallback((): Transaction => {
    const row: Transaction = {
      id: crypto.randomUUID(),
      date: "",
      description: "",
      debit: "",
      credit: "",
      balance: "",
    };
    return row;
  }, []);

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
    [columns.length]
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
        isBoldActive={isBoldActive}
        isItalicActive={isItalicActive}
        isUnderlineActive={isUnderlineActive}
        onToggleBold={() => toggleStyle("bold")}
        onToggleItalic={() => toggleStyle("italic")}
        onToggleUnderline={() => toggleStyle("underline")}
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
        className="spreadsheet-container flex-1 select-none"
        role="grid"
      >
        <table
          className="border-collapse w-full"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 42 }} /> {/* Row number col */}
            {columns.map((col, i) => (
              <col key={i} style={{ width: colWidths[col.key] || col.width }} />
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
                    "sheet-cell sheet-cell--header cursor-pointer relative",
                    "hover:bg-slate-200 transition-colors"
                  )}
                  onClick={() => handleColumnClick(i + 1)}
                >
                  <span>{col.letter}</span>
                  {/* Resize Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary-300 active:bg-primary-500 z-20"
                    onMouseDown={(e) => handleResizeStart(e, col.key)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
            </tr>
            {/* Data header row (Row 1 with column names) */}
            <tr>
              <td className="sheet-cell sheet-cell--row-number sheet-cell--corner bg-primary-50 font-semibold text-primary-600 text-xs">
                
              </td>
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                const direction = sortConfig?.direction;
                return (
                  <td
                    key={`header-${col.key}`}
                    onClick={() => {
                      if (isGhostMode) return;
                      setSortConfig((prev) => {
                        if (!prev || prev.key !== col.key) {
                          return { key: col.key, direction: "asc" };
                        }
                        if (prev.direction === "asc") {
                          return { key: col.key, direction: "desc" };
                        }
                        return null;
                      });
                    }}
                    className="sheet-cell bg-primary-50 text-primary-800 font-semibold text-xs border-b-2 border-b-primary-200 cursor-pointer select-none hover:bg-primary-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {isSorted && (
                        <span className="text-primary-600 font-bold ml-1">
                          {direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
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
                  const cellStyle = cellStyles[`${row.id}-${col.key}`];

                  return (
                    <SpreadsheetCell
                      key={`${row.id}-${actualColIndex}`}
                      value={value}
                      row={rowIndex}
                      col={actualColIndex}
                      isSelected={isSelected}
                      isEditing={isEditingThis}
                      isInRange={isInRange(rowIndex, actualColIndex)}
                      isDebit={col.key === "debit"}
                      isCredit={col.key === "credit"}
                      isGhost={isGhostMode}
                      isBold={!!cellStyle?.bold}
                      isItalic={!!cellStyle?.italic}
                      isUnderline={!!cellStyle?.underline}
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
        sheets={sheets}
        activeSheetId={activeSheetId}
        onSheetsChange={onSheetsChange}
        onActiveSheetIdChange={onActiveSheetIdChange}
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
          onMoveColumnLeft={() => {
            if (contextMenu.col > 0) {
              const colKey = COL_KEYS[contextMenu.col - 1];
              handleMoveColumn(colKey, "left");
            }
          }}
          onMoveColumnRight={() => {
            if (contextMenu.col > 0) {
              const colKey = COL_KEYS[contextMenu.col - 1];
              handleMoveColumn(colKey, "right");
            }
          }}
        />
      )}
    </div>
  );
}
