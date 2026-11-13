"use client";

import React, { useState } from "react";

interface VideoDemoProps {
  /** Override the section heading */
  title?: string;
  /** Override the subtitle paragraph */
  subtitle?: string;
  /** Language for the badge label */
  badgeText?: string;
}

/**
 * Responsive 16:9 YouTube embed section. The player loads only after activation.
 * Drop this between any two sections — it adapts to the surrounding layout.
 */
export default function VideoDemo({
  title = "Watch How It Works",
  subtitle = "See how to convert a bank statement PDF to Excel in under 30 seconds — no signup, no software to install.",
  badgeText = "See it in action",
}: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

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
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
          {isPlaying ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/uYCWc1KD5UU?si=aTSqIjpY6BDIJB5M&start=25"
              title="How to convert a bank statement PDF to Excel — StatementToExcel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              aria-label={`Play video: ${title}`}
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900 bg-cover bg-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-primary-600"
              style={{
                backgroundImage:
                  "url(https://i.ytimg.com/vi/uYCWc1KD5UU/hqdefault.jpg)",
              }}
            >
              <span
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
