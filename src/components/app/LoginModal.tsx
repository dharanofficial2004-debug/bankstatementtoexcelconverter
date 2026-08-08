"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, Shield, Loader2, UserPlus, UserRound } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  /* ── Create Account ──────────────────────────────────────── */
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!profession) {
      setError("Please select your profession.");
      return;
    }

    // Demo / no-Supabase mode
    if (!isSupabaseConfigured() || !supabase) {
      onLoginSuccess();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { profession } },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // If Supabase returns a session immediately (email confirm disabled), log in
      if (data.session) {
        // Store profession in user_usage (best-effort, RLS allows own row)
        try {
          await supabase.from("user_usage").upsert(
            { user_id: data.session.user.id, profession, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        } catch {
          // non-critical
        }
        onLoginSuccess();
        return;
      }

      // If email confirmation is enabled, try signing in anyway
      // (works when "Confirm email" is OFF in Supabase dashboard)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) {
        onLoginSuccess();
      } else {
        // Confirmation required – tell the user
        setError("Account created! Please check your email to confirm your account.");
      }
    } catch {
      setError("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary-50 flex items-center justify-center">
                <UserPlus size={24} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Create your account</h2>
              <p className="text-sm text-slate-500">
                Your first conversion is <span className="font-semibold text-emerald-600">free 🎉</span>
              </p>
            </div>

            {/* Create Account Form */}
            <form onSubmit={handleCreateAccount} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                  className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 6 characters)"
                  className="w-full pl-9 pr-10 py-3 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Profession */}
              <div className="relative">
                <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  id="signup-profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className={`w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    appearance-none bg-white ${
                      profession ? "text-slate-900" : "text-slate-400"
                    }`}
                >
                  <option value="" disabled>
                    Select your profession
                  </option>
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p} className="text-slate-900">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                id="signup-submit"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-1"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Create Account & Download Free"
                )}
              </button>
            </form>

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
