import React from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />

      <main className="pt-28 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Start free. Upgrade when you need unlimited exports.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Free</h3>
                <p className="text-sm text-slate-500">For individuals</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-sm text-slate-500 ml-1">/ forever</span>
              </div>

              <Link
                href="/app"
                className="btn-secondary w-full text-sm mb-8"
              >
                Get Started Free
              </Link>

              <div className="space-y-3">
                <Feature included>Unlimited PDF uploads</Feature>
                <Feature included>Unlimited preview & editing</Feature>
                <Feature included>3 exports per month</Feature>
                <Feature included>All banks supported</Feature>
                <Feature included={false}>Bulk PDF upload</Feature>
                <Feature included={false}>Priority processing</Feature>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-white rounded-2xl border-2 border-primary-500 p-8 shadow-lg shadow-primary-100/50">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full shadow-lg">
                  <Sparkles size={12} />
                  Most Popular
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pro</h3>
                <p className="text-sm text-slate-500">For professionals</p>
              </div>

              <div className="mb-2">
                <span className="text-4xl font-extrabold text-slate-900">$4.99</span>
                <span className="text-sm text-slate-500 ml-1">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-8">
                or $39/year (save 35%)
              </p>

              <Link
                href="/app"
                className="btn-primary w-full text-sm mb-8 gap-1"
              >
                Start Free Trial
                <ArrowRight size={16} />
              </Link>

              <div className="space-y-3">
                <Feature included>Everything in Free</Feature>
                <Feature included>Unlimited exports</Feature>
                <Feature included>Bulk PDF upload</Feature>
                <Feature included>Priority processing</Feature>
                <Feature included>Email support</Feature>
                <Feature included>Coming: Auto-categorization</Feature>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
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
