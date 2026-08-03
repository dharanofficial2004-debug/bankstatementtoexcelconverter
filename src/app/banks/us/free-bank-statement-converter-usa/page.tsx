import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free US Bank Statement Converter — PDF to Excel No Signup",
  description: "Free US bank statement PDF to Excel converter. No signup needed for the preview. Works with Chase, Bank of America, Wells Fargo, and all major US banks.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/free-bank-statement-converter-usa" },
};

const comparisons = [
  { feature: "Free preview of all transactions", us: true, others: false },
  { feature: "AI-powered — works with any bank format", us: true, others: false },
  { feature: "No signup for preview", us: true, others: false },
  { feature: "Edit before downloading", us: true, others: false },
  { feature: "Export to Excel, CSV, and JSON", us: true, others: false },
  { feature: "Works with US bank PDFs (Chase, BofA, WF)", us: true, others: false },
  { feature: "Monthly subscription required", us: false, others: true },
  { feature: "Pay-per-document from $1", us: true, others: false },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 border border-emerald-200 rounded-full text-sm text-emerald-800 font-semibold mb-6">
            ✅ Free Preview — No Credit Card
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5">
            Free US Bank Statement Converter
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Upload your Chase, Bank of America, or Wells Fargo PDF and preview every transaction for free. No account needed. Pay only when you're ready to download — starting at $1.
          </p>
          <Link href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all">
            Try Free Now <ArrowRight size={17} />
          </Link>
          <p className="text-slate-400 text-sm mt-3">Free preview · Download from $1 · No subscription</p>
        </div>
      </section>

      {/* What's free vs paid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">What's Free vs Paid</h2>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-semibold px-6 py-3">
              <div>Feature</div>
              <div className="text-center text-emerald-400">Our Tool</div>
              <div className="text-center text-slate-400">Others</div>
            </div>
            {comparisons.map((c, i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-3.5 border-b border-slate-200 text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                <div className="text-slate-700">{c.feature}</div>
                <div className="flex justify-center">
                  {c.us ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-400" />}
                </div>
                <div className="flex justify-center">
                  {c.others ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Why Trust Us With Your Bank Data?</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { emoji: "🔒", title: "No data stored", body: "Your PDF is deleted immediately after processing. We never retain or analyze your financial data." },
              { emoji: "🚫", title: "No third parties", body: "We don't share your data with advertisers, data brokers, or any third-party services." },
              { emoji: "🇺🇸", title: "US-focused tool", body: "Built specifically for American bank statement formats — not a generic international tool." },
            ].map((t) => (
              <div key={t.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl mb-3">{t.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{t.title}</h3>
                <p className="text-sm text-slate-500">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
