import React from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title: string;
  subtitle: string;
  items: FaqItem[];
  variant?: "default" | "cards";
}

export default function FaqSection({
  title,
  subtitle,
  items,
  variant = "default",
}: FaqSectionProps) {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 mb-4">
            Frequently asked questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div
          className={
            variant === "cards" ? "grid gap-6 lg:grid-cols-2" : "space-y-4"
          }
        >
          {items.map((item, index) => (
            <div
              key={`${item.question}-${index}`}
              className={`rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm ${variant === "cards" ? "h-full" : ""}`}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.question}
              </h3>
              <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
