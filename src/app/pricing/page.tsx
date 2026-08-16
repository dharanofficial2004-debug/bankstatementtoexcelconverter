"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LoginModal from "@/components/app/LoginModal";
import { useToast } from "@/components/ui/Toast";
import { Check, X, Sparkles, Zap, Clock, ShieldCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { startPlanCheckout } from "@/lib/checkout";
import {
  LIFETIME_OFFER_LIMIT,
} from "@/lib/pricing";

type Plan = "lifetime" | "per_conversion";

export default function PricingPage() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerSoldOut, setOfferSoldOut] = useState(false);
  const [offerRemaining, setOfferRemaining] = useState(LIFETIME_OFFER_LIMIT);
  const [userPlan, setUserPlan] = useState<string>("free");

  const isLifetime = userPlan === "lifetime";

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const loadUser = async (accessToken?: string) => {
      if (!accessToken) {
        setUserPlan("free");
        return;
      }
      try {
        const res = await fetch("/api/usage/get", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const d = await res.json();
        if (d && typeof d.plan === "string") setUserPlan(d.plan);
      } catch {
        // ignore
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) loadUser(session.access_token);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) loadUser(session.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payment/offer-status");
        const d = await res.json();
        if (d && typeof d.soldOut === "boolean") {
          setOfferSoldOut(d.soldOut);
          setOfferRemaining(d.remaining ?? 0);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const checkout = useCallback(
    async (plan: Plan) => {
      const result = await startPlanCheckout(plan, {
        onProcessing: setIsProcessing,
        onSuccess: () => {
          showToast(
            plan === "lifetime"
              ? "Lifetime access unlocked! 🎉"
              : "Credit added! You can now convert your files.",
            "success"
          );
        },
        onError: (msg) => showToast(msg, "error"),
      });
      if (result.needsAuth) {
        setPendingPlan(plan);
        setShowLoginModal(true);
      }
    },
    [showToast]
  );

  const handleBuy = async (plan: Plan) => {
    if (!isAuthenticated) {
      setPendingPlan(plan);
      setShowLoginModal(true);
      return;
    }
    await checkout(plan);
  };

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    setIsAuthenticated(true);
    if (pendingPlan) {
      const plan = pendingPlan;
      setPendingPlan(null);
      setTimeout(() => checkout(plan), 150);
    }
  }, [pendingPlan, checkout]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />

      <main className="pt-28 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Start with a free conversion. Pay only when you need to convert more statements.
            </p>
          </div>

          {/* Lifetime subscribed banner */}
          {isLifetime && (
            <div className="mb-10 rounded-2xl bg-success-50 border border-success-200 px-5 py-4 text-center">
              <p className="text-sm font-semibold text-success-700">
                <Sparkles size={15} className="inline mr-1.5 -mt-0.5" />
                You already have Lifetime Access — enjoy unlimited conversions forever.
              </p>
            </div>
          )}

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free Plan */}
            <div className="flex flex-col bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Free</h3>
                <p className="text-sm text-slate-500">Your first conversion is free</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-sm text-slate-500 ml-1">/ first file</span>
              </div>

              <Link href="/app" className="btn-secondary w-full text-sm mb-8">
                Convert Free
              </Link>

              <div className="space-y-3">
                <Feature included>1 free conversion</Feature>
                <Feature included>Edit before export</Feature>
                <Feature included>Export Excel / CSV / JSON</Feature>
                <Feature included>All banks supported</Feature>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div className="relative flex flex-col bg-white rounded-2xl border-2 border-primary-500 p-8 shadow-lg shadow-primary-100/50">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div
                  className={`flex items-center gap-1 px-3 py-1 text-white text-[10px] font-bold rounded-full shadow ${
                    isLifetime ? "bg-success-600" : "bg-rose-600"
                  }`}
                >
                  <Clock size={11} />
                  {isLifetime
                    ? "ACTIVE"
                    : offerSoldOut
                      ? "SOLD OUT"
                      : "LIMITED OFFER"}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Lifetime Access</h3>
                <p className="text-sm text-slate-500">Pay once, convert forever</p>
              </div>

              <div className="mb-2">
                <span className="text-4xl font-extrabold text-slate-900">$100</span>
                <span className="text-sm text-slate-500 ml-1">one-time</span>
              </div>
              <p className="text-xs text-slate-400 mb-8">
                No subscription. No recurring fees. Ever.
              </p>

              {isLifetime ? (
                <div className="w-full mb-8 rounded-xl bg-success-50 border border-success-200 px-4 py-3.5 text-center">
                  <p className="text-sm font-bold text-success-700">
                    ✓ Already subscribed for lifetime
                  </p>
                  <p className="text-xs text-success-600/80 mt-0.5">
                    You have unlimited conversions.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleBuy("lifetime")}
                  disabled={isProcessing || offerSoldOut}
                  className="btn-primary w-full text-sm mb-8 gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} />
                  {isProcessing ? "Processing..." : offerSoldOut ? "Sold Out" : "Get Lifetime Access"}
                </button>
              )}

              <div className="space-y-3">
                <Feature included>Unlimited conversions forever</Feature>
                <Feature included>Export Excel / CSV / JSON</Feature>
                <Feature included>All banks supported</Feature>
                <Feature included>No hidden fees</Feature>
              </div>

              <p className="mt-5 text-[11px] text-slate-400 text-center">
                {offerSoldOut
                  ? "This offer is no longer available."
                  : `Limited to ${LIFETIME_OFFER_LIMIT} users — only ${offerRemaining} spots left.`}
              </p>
            </div>

            {/* Pay Per Conversion Plan */}
            <div className="flex flex-col bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pay Per Conversion</h3>
                <p className="text-sm text-slate-500">Pay only when you need it</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$2</span>
                <span className="text-sm text-slate-500 ml-1">/ per file</span>
              </div>

              <button
                onClick={() => handleBuy("per_conversion")}
                disabled={isProcessing || isLifetime}
                className="btn-primary w-full text-sm mb-8 gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLifetime ? (
                  <>
                    <Check size={16} />
                    Included in Lifetime ✓
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    {isProcessing
                      ? "Processing..."
                      : `Pay $2 & Convert`}
                  </>
                )}
              </button>

              <div className="space-y-3">
                <Feature included>Pay only when you convert</Feature>
                <Feature included>No subscription needed</Feature>
                <Feature included>Export Excel / CSV / JSON</Feature>
                <Feature included>All banks supported</Feature>
              </div>
            </div>
          </div>

          {/* Trust note */}
          <div className="mt-12 flex flex-col items-center gap-2 text-sm text-slate-400">
            <ShieldCheck size={16} />
            <p>
              Secure payments via Razorpay. You'll need an account to complete your purchase — if
              you're not signed in, we'll ask you to log in first.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth Modal — required before any payment */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingPlan(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function Feature({
  children,
  included,
}: {
  children: React.ReactNode;
  included: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {included ? (
        <Check size={16} className="text-success-600 flex-shrink-0" />
      ) : (
        <X size={16} className="text-slate-300 flex-shrink-0" />
      )}
      <span
        className={`text-sm ${
          included ? "text-slate-700" : "text-slate-400"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
