"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Lock,
  Mail,
  Users,
  Cpu,
  DollarSign,
  RefreshCw,
  LogOut,
  Search,
  Calendar,
  Zap,
  Clock,
} from "lucide-react";

interface AdminUserStat {
  userId: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  conversionsUsed: number;
  plan: string;
  profession: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  totalRequests: number;
}

interface AdminSummary {
  totalUsers: number;
  totalConversions: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUserStat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const checkAuthAndFetch = useCallback(async (pass: string) => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_token", pass);
        setSummary(data.summary);
        setUsers(data.users || []);
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_token");
        setLoginError(data.error || "Invalid credentials");
      }
    } catch {
      setLoginError("Failed to connect to server");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("admin_token");
    if (savedToken) {
      checkAuthAndFetch(savedToken);
    }
  }, [checkAuthAndFetch]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const validEmails = ["dharan.official.2004@gmail.com"];

    if (!validEmails.includes(cleanEmail)) {
      setLoginError("Invalid admin email address.");
      return;
    }

    if (passwordInput !== "Dharan1424#$$") {
      setLoginError("Incorrect password.");
      return;
    }

    checkAuthAndFetch(passwordInput);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setEmailInput("");
    setPasswordInput("");
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) => u.email.toLowerCase().includes(term) || u.userId.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // LOGIN SCREEN (Customer App Light Theme)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
              <FileSpreadsheet size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Sign In</h1>
            <p className="text-sm text-slate-500 mt-1">
              Bank Statement to Excel Dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="dharan.official.2004@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN (Customer App Light Theme)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2 text-slate-800">
          <FileSpreadsheet size={22} className="text-primary-600" />
          <span className="font-bold text-base text-slate-900">StatementToExcel</span>
          <span className="ml-2 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200">
            Admin Panel
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const pass = sessionStorage.getItem("admin_token");
              if (pass) checkAuthAndFetch(pass);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-primary-600" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* Summary Stats Cards (Matching Customer App Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <Users size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary?.totalUsers ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-1">Registered Supabase accounts</p>
          </div>

          {/* Card 2: Total Conversions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Conversions</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Zap size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary?.totalConversions ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-1">Statements parsed</p>
          </div>

          {/* Card 3: Total AI Tokens */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tokens</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Cpu size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {(summary?.totalTokens ?? 0).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              In: {(summary?.totalInputTokens ?? 0).toLocaleString()} | Out: {(summary?.totalOutputTokens ?? 0).toLocaleString()}
            </p>
          </div>

          {/* Card 4: Est. Cost */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Est. OpenAI Cost</span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                <DollarSign size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 font-mono">
              ${(summary?.estimatedCostUsd ?? 0).toFixed(4)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">GPT-4.1 Mini cost estimate</p>
          </div>
        </div>

        {/* Search & Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900">User Activity & Token Usage</h2>
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-600 focus:bg-white"
            />
          </div>
        </div>

        {/* User Table (Clean Customer App Styling) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Email</th>
                  <th className="py-3.5 px-4">Signup Date</th>
                  <th className="py-3.5 px-4">Last Logged In</th>
                  <th className="py-3.5 px-4 text-center">Conversions Used</th>
                  <th className="py-3.5 px-4 text-center">Plan</th>
                  <th className="py-3.5 px-4">Profession</th>
                  <th className="py-3.5 px-4 text-right">Input Tokens</th>
                  <th className="py-3.5 px-4 text-right">Output Tokens</th>
                  <th className="py-3.5 px-4 text-right">Total Tokens</th>
                  <th className="py-3.5 px-4 text-right">Est. Cost ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 text-sm">
                      No registered user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const signupStr = new Date(u.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const lastSignInStr = u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never";

                    return (
                      <tr key={u.userId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{signupStr}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>{lastSignInStr}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              u.conversionsUsed === 0
                                ? "bg-slate-100 text-slate-600"
                                : u.conversionsUsed === 1
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-primary-50 text-primary-700 border border-primary-200"
                            }`}
                          >
                            {u.conversionsUsed}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              u.plan === "lifetime"
                                ? "bg-violet-50 text-violet-700 border border-violet-200"
                                : u.plan === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {u.plan || "free"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {u.profession || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {u.inputTokens.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {u.outputTokens.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {u.totalTokens.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                          ${u.estimatedCostUsd.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
