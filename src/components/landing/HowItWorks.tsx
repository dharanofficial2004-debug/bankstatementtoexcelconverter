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
    description: "Drop your bank statement PDF",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: Grid3X3,
    title: "Review & Edit",
    description: "See transactions in live editable spreadsheet. Fix any errors instantly.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: Download,
    title: "Export",
    description: "Download as Excel or CSV. Login required for export.",
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
  subtitle = "Three simple steps to convert any bank statement",
  steps = defaultSteps,
}: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-slate-50/50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[72px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />

          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Step number circle */}
              <div className="relative mx-auto mb-6">
                <div className={`w-[88px] h-[88px] mx-auto rounded-2xl ${step.bgLight} flex items-center justify-center relative`}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon size={26} className="text-white" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-bold text-slate-700 border border-slate-100">
                  {i + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
