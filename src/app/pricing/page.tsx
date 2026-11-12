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
  LIFETIME_PRICE_USD,
  LIFETIME_OFFER_LIMIT,
  MONTHLY_PRICE_USD,
} from "@/lib/pricing";

type Plan = "lifetime" | "monthly";

export default function PricingPage() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerSoldOut, setOfferSoldOut] = useState(false);
  const [offerRemaining, setOfferRemaining] = useState(LIFETIME_OFFER_LIMIT);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionCancelAtCycleEnd, setSubscriptionCancelAtCycleEnd] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isLifetime = userPlan === "lifetime";
  const isMonthly = userPlan === "monthly";
  const isMonthlyPending = userPlan === "monthly_pending";

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const loadUser = async (accessToken?: string) => {
      if (!accessToken) {
        setUserPlan("free");
        setSubscriptionStatus(null);
        setSubscriptionCancelAtCycleEnd(false);
        return;
      }
      try {
        const res = await fetch("/api/usage/get", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const d = await res.json();
        if (d && typeof d.plan === "string") setUserPlan(d.plan);
        setSubscriptionStatus(typeof d?.subscription_status === "string" ? d.subscription_status : null);
        setSubscriptionCancelAtCycleEnd(d?.subscription_cancel_at_cycle_end === true);
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
      if (session) {
        loadUser(session.access_token);
      } else {
        setUserPlan("free");
        setSubscriptionStatus(null);
        setSubscriptionCancelAtCycleEnd(false);
      }
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
        onSubscriptionCreated: () => {
          setUserPlan("monthly_pending");
          setSubscriptionStatus("created");
        },
        onSuccess: (details) => {
            if (plan === "monthly") {
              setUserPlan(details?.subscriptionActive ? "monthly" : "monthly_pending");
              setSubscriptionStatus(details?.subscriptionStatus ?? "authenticated");
              showToast(
                details?.subscriptionActive
                  ? "Your monthly unlimited plan is active."
                  : "Your payment is being confirmed. Monthly access will activate shortly.",
                "success"
              );
              return;
            }
            showToast("Lifetime access unlocked! 🎉", "success");
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

  const handleCancelSubscription = async () => {
    if (!supabase) {
      showToast("Please sign in again to manage your subscription.", "error");
      return;
    }

    setIsCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Please sign in again to manage your subscription.", "error");
        return;
      }

      const response = await fetch("/api/payment/cancel-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not cancel your subscription.");
      }

      if (result.cancelAtCycleEnd) {
        setSubscriptionCancelAtCycleEnd(true);
        showToast(
          "Your monthly plan will remain active until the end of the current billing period.",
          "success"
        );
      } else {
        setUserPlan("free");
        setSubscriptionCancelAtCycleEnd(false);
        showToast("Your monthly subscription has been cancelled.", "success");
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not cancel your subscription.",
        "error"
      );
    } finally {
      setIsCancelling(false);
    }
  };

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
              Start with a free conversion, then choose monthly unlimited or lifetime access.
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

          <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 px-5 py-4 text-center text-base font-semibold text-slate-800 sm:text-lg">
            Questions or issues with a payment? Email our support team at{" "}
            <a
              href="mailto:support@bankstatementtoexcelconverter.com"
              className="font-bold text-primary-700 underline underline-offset-2"
            >
              support@bankstatementtoexcelconverter.com
            </a>
            .
          </div>

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
                <span className="text-4xl font-extrabold text-slate-900">${LIFETIME_PRICE_USD}</span>
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
                  disabled={isProcessing || offerSoldOut || isMonthly || isMonthlyPending}
                  className="btn-primary w-full text-sm mb-8 gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} />
                  {isProcessing
                    ? "Processing..."
                    : offerSoldOut
                      ? "Sold Out"
                      : isMonthly || isMonthlyPending
                        ? "Monthly Plan Must End First"
                        : "Get Lifetime Access"}
                </button>
              )}

              <div className="space-y-3">
                <Feature included>Unlimited conversions forever</Feature>
                <Feature included>Desktop app access — coming soon</Feature>
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

            {/* Monthly Unlimited Plan */}
            <div className="flex flex-col bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Monthly Unlimited</h3>
                <p className="text-sm text-slate-500">Unlimited conversions while subscribed</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">${MONTHLY_PRICE_USD}</span>
                <span className="text-sm text-slate-500 ml-1">/ month</span>
              </div>

              {isLifetime ? (
                <div className="w-full mb-8 rounded-xl bg-success-50 border border-success-200 px-4 py-3.5 text-center">
                  <p className="text-sm font-bold text-success-700">
                    <Check size={16} className="inline mr-1" />
                    Included in Lifetime Access
                  </p>
                </div>
              ) : isMonthly || isMonthlyPending ? (
                <div className="w-full mb-8 rounded-xl bg-primary-50 border border-primary-200 px-4 py-3.5 text-center">
                  <p className="text-sm font-bold text-primary-700">
                    {isMonthly
                      ? "Monthly plan active"
                      : subscriptionStatus === "created"
                        ? "Monthly checkout not completed"
                        : subscriptionStatus === "authenticated"
                          ? "Payment confirmation pending"
                        : "Monthly subscription needs attention"}
                  </p>
                  {isMonthly && subscriptionCancelAtCycleEnd ? (
                    <p className="text-xs text-primary-700/80 mt-1">
                      Your plan will end after the current billing period.
                    </p>
                  ) : (
                    <div className="mt-1 flex justify-center gap-4">
                      {isMonthlyPending &&
                        (subscriptionStatus === "created" || subscriptionStatus === "pending") && (
                        <button
                          onClick={() => handleBuy("monthly")}
                          disabled={isProcessing}
                          className="text-xs font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 disabled:opacity-60"
                        >
                          Resume checkout
                        </button>
                      )}
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-800 disabled:opacity-60"
                      >
                        {isCancelling
                          ? "Cancelling..."
                          : isMonthly
                            ? "Cancel subscription"
                            : "Cancel pending subscription"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleBuy("monthly")}
                  disabled={isProcessing}
                  className="btn-primary w-full text-sm mb-8 gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Zap size={16} />
                  {isProcessing ? "Processing..." : "Get Monthly Unlimited"}
                </button>
              )}

              <div className="space-y-3">
                <Feature included>Unlimited conversions every month</Feature>
                <Feature included>Automatic monthly billing</Feature>
                <Feature included>Cancel anytime</Feature>
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
