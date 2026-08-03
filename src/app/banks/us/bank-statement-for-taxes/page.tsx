import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import ProductPreview from "@/components/landing/ProductPreview";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Bank Statement for Taxes USA — Convert PDF for CPA & Tax Filing",
  description: "Convert your US bank statement PDF to Excel for tax preparation. Perfect for Schedule C, self-employment, and CPA review. Starts at $1.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/bank-statement-for-taxes" },
};

const taxUseCases = [
  { title: "Schedule C (Sole Proprietors)", body: "Freelancers and self-employed Americans need to categorize every business transaction. Export your bank statement to Excel and add a Category column for fast Schedule C prep." },
  { title: "CPA & Accountant Review", body: "Your CPA charges by the hour. Hand them a clean Excel spreadsheet instead of a PDF — it cuts their review time in half and reduces your bill." },
  { title: "TurboTax & H&R Block Upload", body: "Some tax software accepts CSV imports for business income/expense reporting. Our CSV output is formatted to map cleanly to tax categories." },
  { title: "1099 Reconciliation", body: "Cross-reference your 1099 income against your bank deposits using Excel VLOOKUP. Much easier than scanning PDFs line by line." },
  { title: "Audit Preparation", body: "IRS audits require transaction-level documentation. An Excel spreadsheet is far more auditor-friendly than a stack of PDFs." },
  { title: "State Tax Filings", body: "Many states require business income documentation. A sorted, filtered Excel file is the standard format accepted by state revenue departments." },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero — right-aligned accent */}
      <section className="pt-32 pb-0 px-4 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-14 items-center pb-16">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              🇺🇸 Tax Season Ready
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
              Bank Statements for US Tax Filing — In Excel Format
            </h1>
            <p className="text-lg text-slate-600 mb-7 leading-relaxed">
              CPAs, accountants, and tax software all work better with spreadsheets than PDFs. Convert your Chase, Bank of America, or Wells Fargo statement to Excel in seconds — ready for Schedule C, 1099 reconciliation, or your accountant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/app" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all">
                Convert for Tax Prep <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium">
                Pricing — from $1
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Tax Use Cases for US Bank Statements</h2>
          <p className="text-slate-500 text-center mb-12">How American taxpayers and accountants use our tool every tax season</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {taxUseCases.map((uc) => (
              <div key={uc.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{uc.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{uc.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Tax Prep Checklist</h2>
          <div className="text-left space-y-3">
            {[
              "Download statements for all 12 months (Jan–Dec)",
              "Convert each month to Excel with our tool",
              "Add a Category column: Income / Business Expense / Personal",
              "Use Excel pivot tables to sum by category",
              "Share the spreadsheet with your CPA",
              "Keep the PDFs as backup documentation",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <CheckCircle2 size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/app" className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all">
            Start Converting <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
