"use client";

import React, { useState } from "react";
import { X, Mail, Shield, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !isSupabaseConfigured() || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        onLoginSuccess();
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen, onLoginSuccess]);

  if (!isOpen) return null;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      onLoginSuccess();
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setIsSent(true);
      }
    } catch {
      setError("Failed to send magic link. Please try again.");
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
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>

          {!isSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Mail size={28} className="text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Sign in to continue
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Create a free account to unlock your conversion.
                  <br />
                  We&apos;ll send a magic link — no password needed.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      placeholder:text-slate-400"
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
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>

              {/* Reassurance */}
              <div className="mt-6 space-y-2">
                <p className="text-xs text-center text-slate-400">
                  Takes 10 seconds. No password. No credit card.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Shield size={12} />
                  <span>Your data stays private</span>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success-50 flex items-center justify-center">
                <Mail size={28} className="text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-slate-500 mb-1">
                We sent a magic link to
              </p>
              <p className="text-sm font-semibold text-slate-800 mb-4">
                {email}
              </p>
              <p className="text-sm text-slate-500">
                Click the link in your email to sign in.
                <br />
                Payment will open automatically after login.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
