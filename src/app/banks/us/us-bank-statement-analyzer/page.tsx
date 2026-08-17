import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import VideoDemo from "@/components/landing/VideoDemo";
import { ArrowRight, TrendingUp, TrendingDown, BarChart2, PieChart } from "lucide-react";

export const metadata: Metadata = {
  title: "US Bank Statement Analyzer — Understand Your Spending & Cash Flow",
  description: "Analyze your US bank statement transactions in a live spreadsheet. See total debits, credits, opening and closing balances. Works with all major US banks.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/us-bank-statement-analyzer" },
};

const insightCards = [
  { icon: TrendingDown, color: "text-red-500 bg-red-50", title: "Total Spending", desc: "Sum of all debit transactions across the statement period" },
  { icon: TrendingUp, color: "text-green-500 bg-green-50", title: "Total Income", desc: "Sum of all credit transactions — salary, transfers, refunds" },
  { icon: BarChart2, color: "text-blue-500 bg-blue-50", title: "Net Cash Flow", desc: "Income minus spending — instantly see if you're saving or spending down" },
  { icon: PieChart, color: "text-purple-500 bg-purple-50", title: "Balance Tracking", desc: "Opening balance, closing balance, and running balance per transaction" },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero — stats-focused */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 border border-purple-200 rounded-full text-sm text-purple-800 font-semibold mb-6">
            📊 Live Transaction Analytics
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5">
            Analyze Your US Bank Statement — Instantly
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Upload your Chase, Bank of America, or Wells Fargo statement and see your total spending, income, and net cash flow in seconds. No formulas needed — the numbers appear automatically.
          </p>

          {/* Mock stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
            {[
              { label: "Total Transactions", value: "47", color: "text-slate-800" },
              { label: "Total Spending", value: "$4,218", color: "text-red-600" },
              { label: "Total Income", value: "$6,400", color: "text-green-600" },
              { label: "Net Cash Flow", value: "+$2,182", color: "text-blue-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <Link href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all">
            Analyze My Statement <ArrowRight size={17} />
          </Link>
          <p className="text-slate-400 text-sm mt-3">Free preview · From $1 to download</p>
        </div>
      </section>

      <div className="bg-white px-4">
        <VideoDemo />
      </div>

      {/* Insight cards */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">What You'll See Instantly</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {insightCards.map((c) => (
              <div key={c.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
                <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mx-auto mb-4`}>
                  <c.icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{c.title}</h3>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Excel analysis tips */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Going Deeper in Excel</h2>
          <p className="text-slate-600 text-center mb-8">After downloading your Excel file, here's what to do next:</p>
          <div className="space-y-4">
            {[
              { formula: "=SUMIF(D:D,\">0\")", purpose: "Sum all debit transactions (total spending)" },
              { formula: "=SUMIF(E:E,\">0\")", purpose: "Sum all credit transactions (total income)" },
              { formula: "=COUNTIF(C:C,\"*AMAZON*\")", purpose: "Count all Amazon purchases" },
              { formula: "=AVERAGEIF(D:D,\">0\")", purpose: "Average transaction amount for debits" },
              { formula: "=MAX(D:D)", purpose: "Find your largest single expense" },
            ].map((f) => (
              <div key={f.formula} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <code className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg flex-shrink-0">{f.formula}</code>
                <p className="text-sm text-slate-600">{f.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
