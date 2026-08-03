import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "US Bank Statement to JSON — PDF to JSON API for Developers",
  description: "Convert US bank statement PDFs to structured JSON. Perfect for developers building fintech apps, expense trackers, or accounting integrations. Starts at $1.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/bank-statement-to-json-usa" },
};

const sampleJson = `[
  {
    "date": "2026-01-05",
    "description": "DIRECT DEPOSIT - EMPLOYER INC",
    "debit": "",
    "credit": "3200.00",
    "balance": "8000.00"
  },
  {
    "date": "2026-01-07",
    "description": "AMAZON MARKETPLACE PURCHASE",
    "debit": "89.99",
    "credit": "",
    "balance": "7910.01"
  },
  {
    "date": "2026-01-12",
    "description": "ZELLE TRANSFER - RENT PAYMENT",
    "debit": "1500.00",
    "credit": "",
    "balance": "6410.01"
  }
]`;

const devUseCases = [
  { title: "Fintech App Integration", body: "Import transaction data into your fintech app without building your own PDF parser. Works with all 20 major US banks." },
  { title: "Expense Categorization Engine", body: "Feed JSON transactions into an ML model or rules engine to auto-categorize spending — groceries, utilities, rent, etc." },
  { title: "Personal Finance Dashboard", body: "Build a custom budget dashboard that ingests bank statement JSON and visualizes spending trends over time." },
  { title: "Accounting Software Bridge", body: "Use JSON as an intermediate format to bridge between bank statement PDFs and your own accounting system schema." },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      {/* Dark developer hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-green-400 uppercase tracking-widest font-mono font-semibold block mb-4">{ "{ } JSON Output" }</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Convert US Bank Statement PDF to <span className="text-green-400">JSON</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Get structured transaction data from any US bank statement PDF. Perfect for developers building expense trackers, fintech integrations, or accounting automation.
          </p>
          <Link href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-xl shadow-lg transition-all">
            Export JSON Now <ArrowRight size={17} />
          </Link>
          <p className="text-slate-500 text-sm mt-3">Free preview · Export from $1 · No API key needed</p>
        </div>
      </section>

      {/* JSON sample */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-slate-500 text-xs font-mono">chase_statement_jan2026.json</span>
          </div>
          <pre className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-sm font-mono text-green-300 overflow-x-auto leading-relaxed">
            {sampleJson}
          </pre>
          <p className="text-slate-500 text-xs mt-3 text-center">Actual output from a Chase checking statement PDF</p>
        </div>
      </section>

      {/* Dev use cases */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Developer Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {devUseCases.map((uc) => (
              <div key={uc.title} className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{uc.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-12 px-4 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/banks/us/bank-statement-to-excel-usa", label: "Excel Export" },
              { href: "/banks/us/bank-statement-csv-usa", label: "CSV Export" },
              { href: "/banks/us", label: "All US Banks" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-400 hover:text-green-400 hover:border-green-700 transition-all">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
