"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LoginModal from "./LoginModal";
import { ChevronLeft, Download, FileSpreadsheet, Loader2, Upload, UserRound } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Sheet, Transaction } from "@/lib/types";
import { calculateConversionSummary } from "@/lib/conversionSession";

const Spreadsheet = dynamic(() => import("./Spreadsheet"), { ssr: false });

type Format = "csv" | "xlsx" | "json" | "iif";

type JobStatus = "queued" | "processing" | "retrying" | "validating" | "ready" | "failed" | "uncertain";

interface JobPollResult {
  status: JobStatus;
  chunksDone: number;
  chunksTotal: number;
  filename: string | null;
  supportRef: string | null;
  errorCode: string | null;
  retryAfterSec: number;
  validationNotices: string[];
}

interface JobResult {
  bank_detected: string;
  currency_symbol: string;
  transactions: Transaction[];
}

interface AccountUsage {
  plan: "free" | "lifetime" | "payg";
  paid_credits: number;
}

const STATUS_LABELS: Record<JobStatus, string> = {
  queued: "In queue…",
  processing: "Processing…",
  retrying: "Retrying — we're working on it…",
  validating: "Validating…",
  ready: "Ready",
  failed: "Something went wrong",
  uncertain: "Checking progress…",
};

export default function PreviewWorkspace({ conversionId }: { conversionId: string }) {
  const { showToast } = useToast();

  // Job polling state
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [jobPoll, setJobPoll] = useState<JobPollResult | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Result state (populated once job is ready)
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState("");
  const [fileName, setFileName] = useState("");
  // Notices removed - not used
  const [summary, setSummary] = useState<ReturnType<typeof calculateConversionSummary> | null>(null);

  // UI state
  const [showLogin, setShowLogin] = useState(false);
  const [pendingExport, setPendingExport] = useState<Format | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountInitial, setAccountInitial] = useState("");
  const [accountUsage, setAccountUsage] = useState<AccountUsage | null>(null);

  const active = useMemo(() => sheets.find((s) => s.id === activeSheetId) ?? null, [sheets, activeSheetId]);
  const transactions = useMemo(() => active?.transactions ?? [], [active]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsSignedIn(false);
      setAccountUsage(null);
      return;
    }

    let mounted = true;
    const updateAccount = async (session: { access_token: string; user: { email?: string } } | null) => {
      if (!mounted) return;
      setIsSignedIn(Boolean(session));
      setAccountInitial(session?.user.email?.trim().charAt(0).toUpperCase() ?? "");
      if (!session) {
        setAccountUsage(null);
        return;
      }

      try {
        const response = await fetch("/api/usage/get", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) return;
        const usage = await response.json() as AccountUsage;
        if (mounted && ["free", "lifetime", "payg"].includes(usage.plan)) {
          setAccountUsage(usage);
        }
      } catch {
        if (mounted) setAccountUsage(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => updateAccount(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void updateAccount(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const planLabel = accountUsage?.plan === "lifetime"
    ? "Lifetime plan"
    : accountUsage?.plan === "payg" && accountUsage.paid_credits > 0
      ? `${accountUsage.paid_credits} ${accountUsage.paid_credits === 1 ? "conversion" : "conversions"} left`
      : "Free plan";

  // ── Load result from server when job is ready ────────────────────────────
  const loadResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${conversionId}/result`);
      if (!res.ok) return;
      const data = await res.json();
      const result = data.result as JobResult;
      if (!result?.transactions?.length) return;

      const sheetName = (data.filename as string | null)?.replace(/\.pdf$/i, "") || "Statement";
      const newSheet: Sheet = {
        id: crypto.randomUUID(),
        name: sheetName,
        transactions: result.transactions,
        bankDetected: result.bank_detected || null,
        currencySymbol: result.currency_symbol || "₹",
        headers: [],
      };
      setSheets([newSheet]);
      setActiveSheetId(newSheet.id);
      setFileName(sheetName);
      setSummary(calculateConversionSummary(result.transactions, result.bank_detected || null, result.currency_symbol || "₹"));
    } catch {
      // will show "expired" state
    }
  }, [conversionId]);

  // ── Poll job status ───────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${conversionId}`);
      if (!res.ok) {
        setJobStatus("failed");
        return;
      }
      const data = await res.json();
      const job = data.job as JobPollResult;
      setJobPoll(job);
      setJobStatus(job.status);

      if (job.status === "ready") {
        await loadResult();
        return; // stop polling
      }

      if (job.status === "failed") {
        return; // stop polling
      }

      // Schedule next poll
      const delayMs = job.status === "uncertain"
        ? 5000
        : job.retryAfterSec > 0
          ? job.retryAfterSec * 1000 + 500
          : job.status === "queued" ? 3000 : 2000;

      setRetryAfterMs(job.retryAfterSec > 0 ? Date.now() + job.retryAfterSec * 1000 : 0);
      pollRef.current = setTimeout(poll, delayMs);
    } catch {
      // retry on network error
      pollRef.current = setTimeout(poll, 5000);
    }
  }, [conversionId, loadResult]);

  useEffect(() => {
    poll();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [poll]);

  // ── Retry failed job ─────────────────────────────────────────────────────
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/jobs/${conversionId}/retry`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setJobStatus("queued");
        pollRef.current = setTimeout(poll, 1500);
      } else {
        showToast("We couldn't restart this conversion. Please try again.", "error");
      }
    } catch {
      showToast("Server busy. Please try again.", "error");
    } finally {
      setRetrying(false);
    }
  }, [conversionId, poll, showToast]);

  // ── Export ────────────────────────────────────────────────────────────────
  const exportFile = useCallback(async (format: Format) => {
    if (!active || !transactions.length) return;
    try {
      let accessToken: string | undefined;
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setPendingExport(format);
          setShowLogin(true);
          return;
        }
        accessToken = session.access_token;
      }
      const payload = format === "xlsx"
        ? { jobId: conversionId, sheets: sheets.map((s) => ({ name: s.name, transactions: s.transactions })), format }
        : { jobId: conversionId, transactions, format };
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const response = await fetch("/api/export", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setPendingExport(format);
          setShowLogin(true);
          return;
        }
        if (response.status === 404) {
          showToast("We couldn't find this conversion. Refresh the page and try again.", "error");
          return;
        }
        showToast("We couldn't export your file. Please try again.", "error");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bankstatement_${new Date().toISOString().slice(0, 10)}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Downloaded successfully ✓", "success");
    } catch {
      showToast("Couldn't connect to export your file. Check your connection and try again.", "error");
    }
  }, [active, transactions, sheets, conversionId, showToast]);

  const handleTransactionsChange = useCallback((updated: Transaction[]) => {
    setSheets((current) => current.map((s) => s.id === activeSheetId ? { ...s, transactions: updated } : s));
    setSummary(calculateConversionSummary(updated, active?.bankDetected ?? null, active?.currencySymbol ?? "₹"));
  }, [activeSheetId, active]);

  // ── Loading / processing states ───────────────────────────────────────────
  if (jobStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (jobStatus !== "ready" && sheets.length === 0) {
    const isTerminal = jobStatus === "failed";
    const progress = jobPoll && jobPoll.chunksTotal > 0
      ? Math.round((jobPoll.chunksDone / jobPoll.chunksTotal) * 100)
      : null;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm flex flex-col items-center gap-4">
          {!isTerminal && <Loader2 size={36} className="animate-spin text-primary-500" />}
          <h2 className="text-lg font-bold text-slate-800 text-center">
            {STATUS_LABELS[jobStatus] ?? "Processing…"}
          </h2>
          {progress !== null && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{jobPoll?.chunksDone ?? 0} / {jobPoll?.chunksTotal ?? 0} chunks</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {isTerminal && (
            <>
              <p className="text-sm text-slate-500 text-center">
                Couldn&apos;t finish this conversion.
                {jobPoll?.supportRef && (
                  <span className="block mt-1 text-xs text-slate-400">Ref: {jobPoll.supportRef}</span>
                )}
              </p>
              {jobStatus === "failed" && (
                <button
                  onClick={handleRetry}
                  disabled={retrying || (retryAfterMs > Date.now())}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {retrying ? "Retrying…" : "Retry conversion"}
                </button>
              )}
              <Link href="/app" className="text-sm text-slate-500 hover:underline">
                Start a new conversion
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Ready state ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <nav className="flex items-center h-14 px-4 bg-white border-b border-slate-200 gap-3">
        <Link href="/app" className="flex items-center gap-2 text-slate-800">
          <ChevronLeft size={18} />
          <FileSpreadsheet size={20} className="text-primary-600" />
          <span className="font-bold text-sm">StatementToExcel</span>
        </Link>
        <span className="truncate text-sm text-slate-500">{fileName}</span>
        <div className="flex-1" />
        <Link
          href="/app"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Upload size={13} />
          Upload another PDF
        </Link>
        <Link
          href="/pricing"
          title={planLabel}
          className="hidden sm:inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          {planLabel}
        </Link>
        {isSignedIn ? (
          <button
            type="button"
            aria-label="Signed-in account"
            title={accountInitial ? `Signed in as ${accountInitial}` : "Signed-in account"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
          >
            {accountInitial || <UserRound size={16} />}
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-sm text-slate-600 hover:underline">
            Sign in
          </button>
        )}
        <div className="flex gap-1">
          {(["xlsx", "csv", "iif", "json"] as Format[]).map((format) => (
            <button
              key={format}
              onClick={() => exportFile(format)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
            >
              <Download size={12} />
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 min-h-0 p-4 flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-shrink-0">
          {[
            ["Total Transactions", summary?.totalTransactions ?? transactions.length, "text-slate-800"],
            ["Bank Detected", summary?.bankName ?? active?.bankDetected ?? "Parsed with AI", "text-primary-700"],
            ["Total Debit (Out)", `${summary?.currencySymbol ?? active?.currencySymbol}${(summary?.totalDebit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-rose-600"],
            ["Total Credit (In)", `${summary?.currencySymbol ?? active?.currencySymbol}${(summary?.totalCredit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-emerald-600"],
            ["Opening Balance", `${summary?.currencySymbol ?? active?.currencySymbol}${(summary?.openingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-slate-700"],
            ["Closing Balance", `${summary?.currencySymbol ?? active?.currencySymbol}${(summary?.closingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-slate-800"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <h4 className={`text-base font-bold ${color}`}>{value}</h4>
            </div>
          ))}
        </div>

        {/* Spreadsheet */}
        <div className="flex-1 min-h-0">
          {active && (
            <Spreadsheet
              transactions={transactions}
              bankDetected={active.bankDetected}
              isGhostMode={false}
              onTransactionsChange={handleTransactionsChange}
              sheets={sheets}
              activeSheetId={activeSheetId}
              onSheetsChange={setSheets}
              onActiveSheetIdChange={setActiveSheetId}
            />
          )}
        </div>
      </main>

      {showLogin && (
        <LoginModal
          isOpen
          onClose={() => setShowLogin(false)}
          onLoginSuccess={async () => {
            setShowLogin(false);
            setIsSignedIn(true);
            const format = pendingExport;
            setPendingExport(null);
            if (format) await exportFile(format);
          }}
        />
      )}
    </div>
  );
}
