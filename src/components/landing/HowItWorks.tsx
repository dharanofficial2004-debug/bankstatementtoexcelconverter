import React from "react";
import { CloudUpload, Grid3X3, Download, LucideIcon } from "lucide-react";

export interface StepItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgLight: string;
}

const defaultSteps: StepItem[] = [
  {
    icon: CloudUpload,
    title: "Upload PDF",
    description: "Drop a PDF statement and let the parser identify the bank, dates, debits, credits, and balances automatically.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: Grid3X3,
    title: "Review & Edit",
    description: "Inspect the live spreadsheet preview, correct any OCR issues, and keep the data structured for Excel or CSV export.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: Download,
    title: "Export",
    description: "Download a clean workbook in one click and use it for taxes, bookkeeping, reconciliations, or QuickBooks import.",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
  steps?: StepItem[];
}

export default function HowItWorks({
  title = "How It Works",
  subtitle = "A faster way to turn PDF bank statements into structured accounting data",
  steps = defaultSteps,
}: HowItWorksProps) {
  return (
    <section id="how-it-works" className="bg-slate-50/70 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
            Faster than manual copying
          </p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="relative rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgLight}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                    <step.icon size={22} className="text-white" />
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                  {i + 1}
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
