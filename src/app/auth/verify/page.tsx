"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileSpreadsheet, Mail, RefreshCw } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams ? (searchParams.get("email") || "") : "";
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for auth state change and redirect
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        window.location.href = "/app";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResend = async () => {
    if (!canResend || !email || !supabase) return;

    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setCanResend(false);
      setCountdown(60);
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-800">
            <FileSpreadsheet size={28} className="text-primary-600" />
            <span className="font-bold text-xl">StatementToExcel</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-premium p-8 border border-slate-100">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-50 flex items-center justify-center">
            <Mail size={32} className="text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Check your email
          </h1>

          <p className="text-sm text-slate-500 mb-1">
            We sent a magic link to
          </p>
          <p className="text-sm font-semibold text-slate-800 mb-6">{email}</p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600">
              Click the link in your email to continue.
              <br />
              You&apos;ll be redirected automatically.
            </p>
          </div>

          {/* Resend */}
          <div>
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <RefreshCw size={14} />
                Resend magic link
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                Resend available in {countdown}s
              </p>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            Use a different email
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
