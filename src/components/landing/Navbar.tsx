"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FileSpreadsheet, Menu, X } from "lucide-react";

// Dynamically import LoginModal — not needed until user clicks "Login".
// Keeps the modal bundle out of the initial page load entirely.
const LoginModal = dynamic(() => import("@/components/app/LoginModal"), {
  ssr: false,
});

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Lazily import Supabase inside useEffect so the SDK is never included
    // in the initial JS bundle for marketing pages. Auth check still runs
    // after the page is interactive — session, avatar, and auth state all
    // work exactly as before.
    import("@/lib/supabase").then(({ supabase, isSupabaseConfigured }) => {
      if (!isSupabaseConfigured() || !supabase) return;

      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        setUserEmail(session?.user.email ?? null);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        setUserEmail(session?.user.email ?? null);
      });

      // Cleanup listener on unmount
      return () => subscription.unsubscribe();
    });
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <FileSpreadsheet size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                StatementToExcel
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/blog"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                Pricing
              </Link>

              {isAuthenticated ? (
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {userEmail?.charAt(0).toUpperCase() || "U"}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors
                    px-4 py-2 border border-slate-200 rounded-xl hover:border-primary-300 transition-all"
                >
                  Login
                </button>
              )}

              <Link href="/app" className="btn-primary text-sm py-2 px-5">
                Try Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 animate-slide-down">
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/blog"
                  className="text-sm font-medium text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Pricing
                </Link>

                {isAuthenticated ? (
                  <div className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-slate-700">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xs">
                      {userEmail?.charAt(0).toUpperCase() || "U"}
                    </div>
                    {userEmail}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowLogin(true);
                    }}
                    className="text-sm font-medium text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-50 text-left"
                  >
                    Login
                  </button>
                )}

                <Link
                  href="/app"
                  className="btn-primary text-sm py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Try Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login modal — only rendered when showLogin is true, bundle loaded on demand */}
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => setShowLogin(false)}
        />
      )}
    </>
  );
}
