import React from "react";

interface VideoDemoProps {
  /** Override the section heading */
  title?: string;
  /** Override the subtitle paragraph */
  subtitle?: string;
  /** Language for the badge label */
  badgeText?: string;
}

/**
 * Responsive 16:9 YouTube embed section.
 * Drop this between any two sections — it adapts to the surrounding layout.
 */
export default function VideoDemo({
  title = "Watch How It Works",
  subtitle = "See how to convert a bank statement PDF to Excel in under 30 seconds — no signup, no software to install.",
  badgeText = "See it in action",
}: VideoDemoProps) {
  return (
    <section className="py-16 px-4 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto text-center">
        <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
          {badgeText}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
          {title}
        </h2>
        <p className="text-slate-600 mb-8">{subtitle}</p>
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/uYCWc1KD5UU?si=aTSqIjpY6BDIJB5M&start=25"
            title="How to convert a bank statement PDF to Excel — StatementToExcel"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
