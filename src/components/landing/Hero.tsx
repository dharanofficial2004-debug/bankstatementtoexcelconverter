import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

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
  badgeText = "Trusted by accountants, CFOs, and small business owners",
  headline = (
    <>
      Convert bank statements to{" "}
      <span className="gradient-text">editable Excel</span> in minutes
    </>
  ),
  subheadline = "Upload PDF statements from any major bank, review a live spreadsheet preview, and export clean Excel or CSV files without manual retyping.",
  ctaText = "Try the free converter",
  ctaSecondaryText = "See how it works",
  trustBadges = [
    "Free preview before download",
    "Works with 100+ banks",
    "Built for bookkeeping and taxes",
    "No subscription required",
  ],
  ctaLink = "/app",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7ff_45%,_#eef6ff_100%)] px-4 pb-24 pt-28 sm:pt-32 lg:pt-36">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[640px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-100/85 via-primary-50/30 to-transparent blur-3xl" />
        <div className="absolute right-8 top-20 h-60 w-60 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute left-4 top-56 h-64 w-64 rounded-full bg-blue-100/45 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
            <Sparkles size={15} className="text-primary-600" />
            {badgeText}
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            {subheadline}
          </p>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={ctaLink}
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
            >
              {ctaText}
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="btn-ghost inline-flex items-center justify-center px-8 py-3.5 text-base"
            >
              {ctaSecondaryText}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
              >
                <CheckCircle2 size={15} className="text-success-600" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2">Live extraction preview</span>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-100">
                    Statement detected
                  </p>
                  <p className="text-slate-400">HDFC Bank • 47 transactions</p>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Ready to export
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ["01/06/2026", "UPI payment", "2,500.00"],
                  ["02/06/2026", "Salary credit", "65,000.00"],
                  ["03/06/2026", "ATM withdrawal", "10,000.00"],
                ].map(([date, desc, amount]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{desc}</p>
                      <p className="text-slate-500">{date}</p>
                    </div>
                    <span className="font-semibold text-slate-100">
                      {amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mx-auto mt-10 flex max-w-5xl justify-center animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <a
          href="https://www.producthunt.com/products/statementtoexcel?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-statementtoexcel"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="StatementToExcel - AI-powered PDF Bank Statement to Excel Converter | Product Hunt"
            width={250}
            height={54}
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1183682&theme=light&t=1782800408880"
            priority
            unoptimized
          />
        </a>
      </div>
    </section>
  );
}
