"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FileSpreadsheet, Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode — redirect to verify page with email
      window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`;
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`;
      }
    } catch {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-800">
            <FileSpreadsheet size={28} className="text-primary-600" />
            <span className="font-bold text-xl">StatementToExcel</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-premium p-8 border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Mail size={28} className="text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Sign in to export
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              We&apos;ll send a magic link to your email.
              <br />
              No password needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  placeholder:text-slate-400 transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-error-600 bg-error-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-6">
            Free account. No credit card required.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
