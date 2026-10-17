"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, Shield, Loader2, UserPlus, LogIn, UserRound } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { trackSignupCompleted, trackLoginCompleted } from "@/lib/analytics";
import { trackAffiliateSignup } from "@/lib/affitor-client";

export const PROFESSIONS = [
  "Accountant",
  "Bookkeeper",
  "CA / Chartered Accountant",
  "Business Owner",
  "Student",
  "Bank / Finance Professional",
  "Other",
] as const;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

type Tab = "signup" | "signin";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState<string>("");
  const [customProfession, setCustomProfession] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setProfession("");
    setCustomProfession("");
    setError(null);
    setShowPassword(false);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    resetForm();
  };

  // If "Other" is chosen, use the typed value; otherwise use the dropdown value
  const resolvedProfession = profession === "Other"
    ? (customProfession.trim() || "Other")
    : profession;

  /* ── Sign Up ──────────────────────────────────────────── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!profession) { setError("Please select your profession."); return; }
    if (profession === "Other" && !customProfession.trim()) { setError("Please describe your role."); return; }

    if (!isSupabaseConfigured() || !supabase) { onLoginSuccess(); return; }

    setIsLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { profession: resolvedProfession } },
      });

      if (authError) {
        if (/already registered|already exists/i.test(authError.message)) {
          switchTab("signin");
          setError("This email is already registered. Please sign in.");
          return;
        }
        setError(authError.message);
        return;
      }

      if (data.user?.email && data.user.identities?.length) {
        void trackAffiliateSignup(data.user.id, data.user.email, data.session?.access_token);
      }

      if (data.session) {
        try {
          await supabase.from("user_usage").upsert(
            { user_id: data.session.user.id, profession: resolvedProfession, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        } catch { /* non-critical */ }
        trackSignupCompleted({ method: "email" });
        onLoginSuccess();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) {
        trackSignupCompleted({ method: "email" });
        onLoginSuccess();
      } else {
        setError("Account created! Check your email to confirm, then sign in.");
        setTab("signin");
      }
    } catch {
      setError("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Sign In ──────────────────────────────────────────── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    if (!isSupabaseConfigured() || !supabase) { onLoginSuccess(); return; }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message.toLowerCase().includes("invalid") ? "Incorrect email or password." : authError.message);
        return;
      }
      trackLoginCompleted({ method: "email" });
      onLoginSuccess();
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 z-10"
          >
            <X size={20} />
          </button>

          {/* Tab Bar */}
          <div className="flex border-b border-slate-100">
            {(["signup", "signin"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/40"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "signup" ? <UserPlus size={15} /> : <LogIn size={15} />}
                {t === "signup" ? "Sign Up" : "Sign In"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary-50 flex items-center justify-center">
                {tab === "signup" ? <UserPlus size={24} className="text-primary-600" /> : <LogIn size={24} className="text-primary-600" />}
              </div>
              {tab === "signup" ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Create your account</h2>
                  <p className="text-sm text-slate-500">Your first conversion is <span className="font-semibold text-emerald-600">free 🎉</span></p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
                  <p className="text-sm text-slate-500">Sign in to download your Excel file</p>
                </>
              )}
            </div>

            {/* ── Sign Up Form ── */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min. 6 characters)"
                    className="w-full pl-9 pr-10 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Profession dropdown */}
                <div className="relative">
                  <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={profession}
                    onChange={(e) => { setProfession(e.target.value); setCustomProfession(""); }}
                    className={`w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white ${profession ? "text-slate-900" : "text-slate-400"}`}
                  >
                    <option value="" disabled>Select your profession</option>
                    {PROFESSIONS.map((p) => (
                      <option key={p} value={p} className="text-slate-900">{p}</option>
                    ))}
                  </select>
                </div>

                {/* "Other" manual entry */}
                {profession === "Other" && (
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      placeholder="Describe your role…"
                      autoFocus
                      maxLength={80}
                      className="w-full pl-9 pr-4 py-3 text-sm border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                )}

                {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                <button type="submit" disabled={isLoading} className="btn-primary w-full mt-1">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Create Account & Download Free"}
                </button>

                <p className="text-xs text-center text-slate-400 mt-2">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchTab("signin")} className="text-primary-600 hover:underline font-medium">Sign in</button>
                </p>
              </form>
            )}

            {/* ── Sign In Form ── */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-9 pr-10 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                <button type="submit" disabled={isLoading} className="btn-primary w-full mt-1">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign In & Download"}
                </button>

                <p className="text-xs text-center text-slate-400 mt-2">
                  New here?{" "}
                  <button type="button" onClick={() => switchTab("signup")} className="text-primary-600 hover:underline font-medium">Create a free account</button>
                </p>
              </form>
            )}

            {/* Trust badges */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Shield size={12} />
              <span>Your data stays private. No credit card required.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
