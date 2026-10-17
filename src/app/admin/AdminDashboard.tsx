"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet, Users, Cpu, DollarSign, RefreshCw, LogOut,
  Search, Calendar, Zap, Clock, ShieldCheck, Loader2, Activity,
  BarChart2, CreditCard, Download, Filter, Home, Globe,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUserStat {
  sno: number;
  userId: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  conversionsUsed: number;
  plan: string;
  profession: string | null;
  paidCredits: number;
  trialConsumed: boolean;
  hasPaid: boolean;
  totalPaidAmount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  aiCalls: number;
}

interface AiUsageLog {
  jobId: string;
  ownerType: string;
  email: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
  model: string;
  startedAt: string;
  status: string;
}

interface RecentJob {
  id: string;
  email: string;
  status: string;
  filename: string | null;
  extractionKind: string | null;
  createdAt: string;
}

interface AdminSummary {
  totalUsers: number;
  totalConversions: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  paidUsers: number;
  freeUsers: number;
}

interface AnalyticsData {
  funnel: { page_view: number; extract: number; convert: number; export: number; signup: number };
  topCountries: { country: string; count: number }[];
  eventsPerDay: { date: string; count: number }[];
}

type Tab = "overview" | "users" | "ai" | "conversions" | "analytics";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const fmtTime = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function exportCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(","), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? "")).join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUserStat[]>([]);
  const [aiLogs, setAiLogs] = useState<AiUsageLog[]>([]);
  const [jobs, setJobs] = useState<RecentJob[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "paid" | "free" | "lifetime" | "payg">("all");
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.status === 401 || res.status === 403) { router.refresh(); return; }
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError((d as {error?:string}).error || `Error ${res.status}`); return; }
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setUsers(data.users || []);
        setAiLogs(data.aiUsageLogs || []);
        setJobs(data.recentJobs || []);
        setAnalytics(data.analytics || null);
      }
    } catch { setError("Failed to load stats."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void fetchStats(); }, [fetchStats]);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    router.refresh();
  };

  const filteredUsers = useMemo(() => {
    let list = users;
    if (search) { const t = search.toLowerCase(); list = list.filter(u => u.email.toLowerCase().includes(t)); }
    if (planFilter === "paid") list = list.filter(u => u.hasPaid);
    if (planFilter === "free") list = list.filter(u => !u.hasPaid);
    if (planFilter === "lifetime") list = list.filter(u => u.plan === "lifetime");
    if (planFilter === "payg") list = list.filter(u => u.plan === "payg" || u.plan === "per_conversion");
    return list;
  }, [users, search, planFilter]);

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Home size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "ai", label: "AI Usage", icon: <Cpu size={16} /> },
    { id: "conversions", label: "Conversions", icon: <Activity size={16} /> },
    { id: "analytics", label: "Analytics", icon: <Globe size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary-600" />
            <span className="font-bold text-sm text-slate-900">StatementToExcel</span>
          </Link>
          <span className="mt-1 inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-semibold rounded border border-primary-200">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${tab === n.id ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2 py-1 mb-2">
            <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
            <span className="text-[10px] text-slate-500 truncate">{adminEmail}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 rounded-lg hover:bg-rose-50 transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-56">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="font-bold text-slate-900 text-sm capitalize">{tab}</h1>
          <button onClick={() => void fetchStats()} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin text-primary-600" : ""} /> Refresh
          </button>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto">
          {loading && !summary && <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-500" /></div>}
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
          {tab === "overview" && summary && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: summary.totalUsers, sub: `${summary.paidUsers} paid · ${summary.freeUsers} free`, icon: <Users size={18} />, color: "bg-primary-50 text-primary-600" },
                  { label: "Conversions", value: summary.totalConversions, sub: "Successful (ready)", icon: <Zap size={18} />, color: "bg-emerald-50 text-emerald-600" },
                  { label: "Total AI Tokens", value: summary.totalTokens.toLocaleString(), sub: `In: ${summary.totalInputTokens.toLocaleString()} · Out: ${summary.totalOutputTokens.toLocaleString()}`, icon: <Cpu size={18} />, color: "bg-indigo-50 text-indigo-600" },
                  { label: "Est. AI Cost", value: `$${summary.estimatedCostUsd.toFixed(4)}`, sub: "Gemini · internal estimate", icon: <DollarSign size={18} />, color: "bg-violet-50 text-violet-600", vClass: "text-emerald-600" },
                ].map(({ label, value, sub, icon, color, vClass }) => (
                  <div key={label} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
                    </div>
                    <h3 className={`text-2xl font-bold font-mono ${vClass ?? "text-slate-900"}`}>{value}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Plan breakdown */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-primary-500" /> Plan Breakdown</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Lifetime", count: users.filter(u => u.plan === "lifetime").length, color: "bg-violet-50 text-violet-700 border-violet-200" },
                    { label: "PAYG", count: users.filter(u => u.plan === "payg" || u.plan === "per_conversion").length, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Free Trial", count: users.filter(u => u.plan === "free" && !u.trialConsumed).length, color: "bg-amber-50 text-amber-700 border-amber-200" },
                    { label: "Trial Used", count: users.filter(u => u.plan === "free" && u.trialConsumed).length, color: "bg-slate-100 text-slate-600 border-slate-200" },
                  ].map(({ label, count, color }) => (
                    <div key={label} className={`p-4 rounded-xl border text-center ${color}`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs font-medium mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent conversions */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Activity size={15} className="text-primary-500" />
                  <h2 className="font-bold text-slate-900 text-sm">Recent Conversions</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="py-3 px-4 text-left">S.No</th><th className="py-3 px-4 text-left">Email</th><th className="py-3 px-4 text-left">File</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-left">Date</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {jobs.slice(0, 10).map((j, i) => (
                        <tr key={j.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">{j.email}</td>
                          <td className="py-2.5 px-4 text-slate-500 truncate max-w-[180px]">{j.filename || "—"}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${j.status === "ready" ? "bg-emerald-50 text-emerald-700" : j.status === "failed" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{j.status}</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">{fmt(j.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ─────────────────────────────────────────────────────── */}
          {tab === "users" && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email…"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Filter size={13} className="text-slate-400" />
                  {(["all", "paid", "free", "lifetime", "payg"] as const).map(f => (
                    <button key={f} onClick={() => setPlanFilter(f)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${planFilter === f ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{f}</button>
                  ))}
                </div>
                <button onClick={() => exportCsv(filteredUsers.map(u => ({ sno: u.sno, email: u.email, plan: u.plan, conversions: u.conversionsUsed, paid_credits: u.paidCredits, ai_tokens: u.totalTokens, ai_cost_usd: u.estimatedCostUsd.toFixed(4), signup: fmt(u.createdAt) })), "users_export.csv")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-all">
                  <Download size={13} /> Export CSV
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wide">
                      <th className="py-3 px-3 text-left">S.No</th>
                      <th className="py-3 px-3 text-left">Email</th>
                      <th className="py-3 px-3 text-left">Signup</th>
                      <th className="py-3 px-3 text-left">Last Login</th>
                      <th className="py-3 px-3 text-center">Plan</th>
                      <th className="py-3 px-3 text-center">Paid</th>
                      <th className="py-3 px-3 text-center">Conversions</th>
                      <th className="py-3 px-3 text-center">Credits</th>
                      <th className="py-3 px-3 text-left">Profession</th>
                      <th className="py-3 px-3 text-right">AI Tokens</th>
                      <th className="py-3 px-3 text-right">AI Cost ($)</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.length === 0
                        ? <tr><td colSpan={11} className="py-10 text-center text-slate-400">No users match filters.</td></tr>
                        : filteredUsers.map(u => {
                          const planColor = u.plan === "lifetime" ? "bg-violet-50 text-violet-700 border-violet-200" : (u.plan === "payg" || u.plan === "per_conversion") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200";
                          const planLabel = u.plan === "lifetime" ? "Lifetime" : (u.plan === "payg" || u.plan === "per_conversion") ? "PAYG" : "Free";
                          return (
                            <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-3 text-slate-400">{u.sno}</td>
                              <td className="py-3 px-3 font-semibold text-slate-900">{u.email}</td>
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap"><div className="flex items-center gap-1"><Calendar size={11} className="text-slate-300" />{fmt(u.createdAt)}</div></td>
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap"><div className="flex items-center gap-1"><Clock size={11} className="text-slate-300" />{u.lastSignInAt ? fmt(u.lastSignInAt) : "Never"}</div></td>
                              <td className="py-3 px-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${planColor}`}>{planLabel}</span></td>
                              <td className="py-3 px-3 text-center">
                                {u.hasPaid
                                  ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Paid ${u.totalPaidAmount.toFixed(0)}</span>
                                  : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="py-3 px-3 text-center font-mono">{u.conversionsUsed}</td>
                              <td className="py-3 px-3 text-center font-mono">{u.paidCredits}</td>
                              <td className="py-3 px-3 text-slate-500">{u.profession || <span className="text-slate-300">—</span>}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{u.totalTokens.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600">${u.estimatedCostUsd.toFixed(4)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── AI USAGE ──────────────────────────────────────────────────── */}
          {tab === "ai" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Last 100 Gemini API calls from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">gemini_attempts</code> table.</p>
                <button onClick={() => exportCsv(aiLogs.map((a, i) => ({ sno: i + 1, email: a.email, job_id: a.jobId, model: a.model, input_tokens: a.inputTokens, output_tokens: a.outputTokens, total_tokens: a.totalTokens, cost_usd: a.estimatedCostUsd.toFixed(6), duration_ms: a.durationMs, started_at: a.startedAt, status: a.status })), "ai_usage.csv")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wide">
                      <th className="py-3 px-3">S.No</th>
                      <th className="py-3 px-3 text-left">User / Guest</th>
                      <th className="py-3 px-3 text-left">Model</th>
                      <th className="py-3 px-3 text-right">Input</th>
                      <th className="py-3 px-3 text-right">Output</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-3 text-right">Cost ($)</th>
                      <th className="py-3 px-3 text-right">Duration</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-left">Started</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {aiLogs.length === 0
                        ? <tr><td colSpan={10} className="py-10 text-center text-slate-400">No AI calls recorded yet. Make a conversion to see data here.</td></tr>
                        : aiLogs.map((a, i) => (
                          <tr key={`${a.jobId}-${i}`} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-slate-400 text-center">{i + 1}</td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">{a.email}</td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{a.model}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">{a.inputTokens.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">{a.outputTokens.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{a.totalTokens.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600">${a.estimatedCostUsd.toFixed(6)}</td>
                            <td className="py-2.5 px-3 text-right text-slate-500">{a.durationMs ? `${(a.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                            <td className="py-2.5 px-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === "succeeded" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{a.status}</span></td>
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{fmtTime(a.startedAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── CONVERSIONS ───────────────────────────────────────────────── */}
          {tab === "conversions" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Last 50 conversion jobs from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">conversion_jobs</code> table.</p>
                <button onClick={() => exportCsv(jobs.map((j, i) => ({ sno: i + 1, email: j.email, status: j.status, filename: j.filename || "", kind: j.extractionKind || "", created_at: fmt(j.createdAt) })), "conversions.csv")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wide">
                      <th className="py-3 px-4">S.No</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">File</th>
                      <th className="py-3 px-4 text-center">Kind</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-left">Date</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {jobs.length === 0
                        ? <tr><td colSpan={6} className="py-10 text-center text-slate-400">No conversions yet.</td></tr>
                        : jobs.map((j, i) => (
                          <tr key={j.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{j.email}</td>
                            <td className="py-3 px-4 text-slate-500 truncate max-w-[200px]">{j.filename || "—"}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">{j.extractionKind || "text"}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${j.status === "ready" ? "bg-emerald-50 text-emerald-700" : j.status === "failed" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{j.status}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap"><div className="flex items-center gap-1"><Calendar size={11} className="text-slate-300" />{fmt(j.createdAt)}</div></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Paid users tab shortcut */}
          {tab === "overview" && summary && (
            <div className="flex gap-3">
              <button onClick={() => { setTab("users"); setPlanFilter("paid"); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-all">
                <CreditCard size={13} className="text-emerald-500" /> View Paid Users ({summary.paidUsers})
              </button>
              <button onClick={() => setTab("ai")} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-all">
                <Cpu size={13} className="text-indigo-500" /> View AI Usage Logs
              </button>
              <button onClick={() => setTab("analytics")} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-all">
                <Globe size={13} className="text-primary-500" /> View Analytics
              </button>
            </div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────────────────── */}
          {tab === "analytics" && (
            <>
              <p className="text-sm text-slate-500">Last 7 days of events from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">analytics_events</code> table.</p>

              {/* Funnel */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-primary-500" /> Conversion Funnel (7 days)</h2>
                {analytics ? (
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Page Views", value: analytics.funnel.page_view, color: "bg-slate-100 text-slate-700" },
                      { label: "Extracts", value: analytics.funnel.extract, color: "bg-blue-50 text-blue-700 border border-blue-200" },
                      { label: "Converts", value: analytics.funnel.convert, color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
                      { label: "Exports", value: analytics.funnel.export, color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                      { label: "Signups", value: analytics.funnel.signup, color: "bg-violet-50 text-violet-700 border border-violet-200" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`px-5 py-4 rounded-xl text-center min-w-[100px] ${color}`}>
                        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                        <p className="text-xs font-medium mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No analytics data yet. Events will appear after users interact with the app.</p>
                )}
              </div>

              {/* Events per day */}
              {analytics && analytics.eventsPerDay.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity size={16} className="text-primary-500" /> Events Per Day</h2>
                  <div className="flex items-end gap-2 h-24">
                    {analytics.eventsPerDay.map(({ date, count }) => {
                      const max = Math.max(...analytics.eventsPerDay.map(e => e.count));
                      const pct = max > 0 ? (count / max) * 100 : 0;
                      return (
                        <div key={date} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-[9px] text-slate-400">{count}</span>
                          <div className="w-full bg-primary-100 rounded-sm" style={{ height: `${Math.max(pct, 4)}%`, minHeight: "4px" }} title={`${date}: ${count}`} />
                          <span className="text-[9px] text-slate-400">{date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top countries */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2"><Globe size={15} className="text-primary-500" /> Top Countries (7 days)</h2>
                  {analytics && (
                    <button onClick={() => exportCsv(analytics.topCountries.map((c, i) => ({ sno: i+1, country: c.country, events: c.count })), "top_countries.csv")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                      <Download size={12} /> Export
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="py-3 px-4 text-left">S.No</th>
                      <th className="py-3 px-4 text-left">Country</th>
                      <th className="py-3 px-4 text-right">Events</th>
                      <th className="py-3 px-4 text-right">Share</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {!analytics || analytics.topCountries.length === 0
                        ? <tr><td colSpan={4} className="py-8 text-center text-slate-400">No geo data yet. Countries appear after users visit the app.</td></tr>
                        : analytics.topCountries.map(({ country, count }, i) => {
                          const total = analytics.topCountries.reduce((s, c) => s + c.count, 0);
                          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                          return (
                            <tr key={country} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                <span className="mr-2">{country}</span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{count.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-slate-500 w-8 text-right">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
