import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import VideoDemo from "@/components/landing/VideoDemo";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Bank Statement Converter USA — PDF to Excel for Businesses",
  description:
    "Convert US business bank statement PDFs to Excel or CSV. Perfect for bookkeeping, QuickBooks, CPA review, and SBA loan applications. Starts at $1.",
  alternates: {
    canonical:
      "https://bankstatementtoexcelconverter.com/banks/us/business-bank-statement-converter",
  },
};

const bizUseCases = [
  {
    title: "Monthly Bookkeeping",
    body: "Convert each month's business statement to Excel, add a Category column, and hand it to your bookkeeper. Eliminates manual entry completely.",
  },
  {
    title: "SBA Loan Applications",
    body: "SBA lenders require 2 years of business bank statements. Excel format is preferred over PDFs — easier to review, sort, and annotate.",
  },
  {
    title: "Cash Flow Analysis",
    body: "Use Excel formulas to build rolling 90-day cash flow projections from your business account data — directly from the converted spreadsheet.",
  },
  {
    title: "Payroll Reconciliation",
    body: "Cross-reference payroll transactions against your bank statement in Excel. Much faster than searching through PDFs.",
  },
  {
    title: "Expense Categorization",
    body: "Add a Category column to your Excel output and use Excel's filter feature to sum expenses by vendor, type, or department.",
  },
  {
    title: "Franchise & Multi-Location",
    body: "Convert multiple business account statements and combine them in Excel to get a consolidated view across locations.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero — left-heavy layout */}
      <section className="pt-32 pb-16 px-4 bg-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold uppercase tracking-widest mb-5">
              🏢 US Business Banking
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
              Convert Business Bank Statements to Excel
            </h1>
            <p className="text-lg text-slate-300 mb-7 leading-relaxed">
              Built for US business owners, accountants, and CFOs. Convert Chase
              Business, Bank of America Business, or Wells Fargo Business
              statement PDFs to Excel or CSV — ready for QuickBooks, your CPA,
              or SBA loan submissions.
            </p>
            <div className="flex flex-wrap gap-2 mb-7 justify-center lg:justify-start">
              {[
                "QuickBooks import",
                "CPA-ready",
                "SBA loan format",
                "From $1",
              ].map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-full text-xs text-slate-300"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg"
            >
              Convert Business Statement <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 w-full lg:max-w-md">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-4 font-semibold">
                Supported Business Accounts
              </p>
              {[
                { bank: "Chase Business Complete Banking", logo: "#117ACA" },
                { bank: "BofA Business Advantage Checking", logo: "#E31837" },
                { bank: "Wells Fargo Business Checking", logo: "#CD1409" },
                { bank: "Citibank Business Checking", logo: "#003B8E" },
                { bank: "U.S. Bank Business Checking", logo: "#0A2B7D" },
                { bank: "PNC Business Checking", logo: "#F15A22" },
              ].map((b) => (
                <div key={b.bank} className="flex items-center gap-3 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.logo }}
                  />
                  <span className="text-slate-300 text-sm">{b.bank}</span>
                </div>
              ))}
              <p className="text-slate-500 text-xs mt-3">+ 14 more US banks</p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white px-4">
        <VideoDemo />
      </div>

      {/* Business use cases */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
            US Business Use Cases
          </h2>
          <p className="text-slate-500 text-center mb-12">
            How American businesses use bank statement exports every day
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bizUseCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 mb-2 text-sm">
                  {uc.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {uc.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
