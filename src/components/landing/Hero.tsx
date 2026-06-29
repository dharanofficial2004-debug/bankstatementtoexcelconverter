import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface HeroProps {
  badgeText?: string;
  headline?: ReactNode;
  subheadline?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  trustBadges?: string[];
  ctaLink?: string;
}

export default function Hero({
  badgeText = "Free to use — No credit card needed",
  headline = (
    <>
      Convert Bank Statements to{" "}
      <span className="gradient-text">Editable Excel</span> — Instantly
    </>
  ),
  subheadline = "Upload any bank PDF. See your transactions in a live editable spreadsheet. Export to Excel or CSV in one click.",
  ctaText = "Try Free — No Credit Card",
  ctaSecondaryText = "See How It Works",
  trustBadges = [
    "Free preview",
    "Edit before export",
    "Works with 100+ banks",
    "No data stored",
  ],
  ctaLink = "/app",
}: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary-50/80 via-primary-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-primary-100/30 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-60 left-20 w-60 h-60 bg-blue-100/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-sm text-primary-700 font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          {badgeText}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 animate-fade-in-up text-balance">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up text-balance" style={{ animationDelay: "0.1s" }}>
          {subheadline}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Link href={ctaLink} className="btn-primary text-base px-8 py-3.5 gap-2">
            {ctaText}
            <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="btn-ghost text-base px-8 py-3.5">
            {ctaSecondaryText}
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-success-600" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
