"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import UploadZone from "@/components/app/UploadZone";
import ProcessingSteps from "@/components/app/ProcessingSteps";
import Spreadsheet from "@/components/app/Spreadsheet";
import ExportModal from "@/components/app/ExportModal";
import { useToast } from "@/components/ui/Toast";
import { Transaction, ConvertResponse } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  FileSpreadsheet,
  Download,
  FileDown,
  User,
  LogOut,
} from "lucide-react";

type AppState = "upload" | "processing" | "spreadsheet";

export default function AppPage() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankDetected, setBankDetected] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { showToast } = useToast();

  // Check auth state
  React.useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setAppState("processing");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        const data: ConvertResponse = await response.json();

        if (data.success && data.transactions.length > 0) {
          setTransactions(data.transactions);
          setBankDetected(data.bank_detected);
          setHeaders(data.headers || []);
        } else {
          showToast(data.error || "No transactions found in this PDF.", "error");
          setAppState("upload");
        }
      } catch {
        showToast("Failed to process PDF. Please try again.", "error");
        setAppState("upload");
      }
    },
    [showToast]
  );

  const handleProcessingComplete = useCallback(() => {
    setAppState("spreadsheet");
  }, []);

  const handleExport = useCallback(
    async (format: "csv" | "xlsx") => {
      // Check if authenticated (or if Supabase not configured, allow export)
      if (!isAuthenticated && isSupabaseConfigured()) {
        setExportFormat(format);
        setExportModalOpen(true);
        return;
      }

      await performExport(format);
    },
    [isAuthenticated, transactions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const performExport = async (format: "csv" | "xlsx") => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, format, headers }),
      });

      if (!response.ok) {
        showToast("Export failed. Please try again.", "error");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `bankstatement_${date}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Downloaded successfully ✓`, "success");
      setExportModalOpen(false);
    } catch {
      showToast("Export failed. Please try again.", "error");
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      showToast("Signed out successfully", "info");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="flex items-center h-14 px-4 bg-white border-b border-slate-200 gap-3 flex-shrink-0">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-800 hover:text-primary-600 transition-colors mr-4"
        >
          <FileSpreadsheet size={22} className="text-primary-600" />
          <span className="font-bold text-sm hidden sm:inline">StatementToExcel</span>
        </Link>

        {/* Filename */}
        {fileName && appState !== "upload" && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-sm text-slate-600 max-w-[200px]">
            <span className="truncate">{fileName}</span>
          </div>
        )}

        {/* Upload another */}
        {appState === "spreadsheet" && (
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={true} />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export Buttons */}
        {appState === "spreadsheet" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                text-slate-600 bg-white border border-slate-200 rounded-lg
                hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                text-white bg-primary-600 rounded-lg
                hover:bg-primary-700 transition-all shadow-sm"
            >
              <FileDown size={15} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>
        )}

        {/* User */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600
              hover:text-primary-600 transition-colors ml-2"
          >
            <User size={16} />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {appState === "upload" && (
          <UploadZone onFileSelect={handleFileSelect} isCollapsed={false} />
        )}

        {appState === "processing" && (
          <ProcessingSteps
            fileName={fileName}
            onComplete={handleProcessingComplete}
          />
        )}

        {appState === "spreadsheet" && (
          <div className="h-full p-3">
            <Spreadsheet
              transactions={transactions}
              bankDetected={bankDetected}
              isGhostMode={false}
              onTransactionsChange={setTransactions}
              headers={headers}
            />
          </div>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExportDirect={() => performExport(exportFormat)}
        format={exportFormat}
      />
    </div>
  );
}
