import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import VideoDemo from "@/components/landing/VideoDemo";
import { ArrowRight, CheckCircle2, FileSpreadsheet, TrendingUp, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Bank Statement to Excel USA — Convert Any US Bank PDF Free",
  description: "Convert any US bank statement PDF to Excel online. Supports Chase, Bank of America, Wells Fargo, Citibank and more. Free preview. Starts at $1.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/bank-statement-to-excel-usa" },
};

const features = [
  { icon: FileSpreadsheet, title: "Native Excel Format", desc: "Downloads as .xlsx — opens in Microsoft Excel, Google Sheets, or LibreOffice without any conversion." },
  { icon: TrendingUp, title: "Balance Tracking", desc: "Running balance column preserved exactly as it appears in your bank statement. No manual calculation needed." },
  { icon: Clock, title: "Seconds, Not Hours", desc: "What used to take 2 hours of manual data entry now takes 30 seconds. Upload, review, download." },
  { icon: Shield, title: "Bank-Grade Privacy", desc: "Your PDF is processed and immediately discarded. We never store, share, or analyze your financial data." },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Split hero — left text, right tool preview */}
      <section className="pt-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-16 pb-16">
          <div className="flex-1 pt-6">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 block">🇺🇸 US Bank Statement Converter</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              Turn Any US Bank Statement PDF into a Clean Excel File
            </h1>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              American banks like Chase, Bank of America, and Wells Fargo generate PDFs that are impossible to use in spreadsheets. We fix that. Paste the PDF in — get Excel out.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Works with checking, savings, and business accounts",
                "Preserves Date, Description, Debit, Credit, Balance columns",
                "Multi-page statements handled automatically",
                "Ideal for QuickBooks, TurboTax, and CPA handoff",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-700 text-sm">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link href="/app" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md">
                Convert Free <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all">
                Pricing — from $1
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full">
            <VideoDemo />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">What Makes This Different</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <f.icon size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported banks strip */}
      <section className="py-14 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-6">Works with all major US banks</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Chase", "Bank of America", "Wells Fargo", "Citibank", "U.S. Bank", "Capital One", "Truist", "PNC Bank", "TD Bank", "Ally Bank", "Charles Schwab", "Navy Federal"].map((b) => (
              <span key={b} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700">{b}</span>
            ))}
            <span className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700">+ 8 more</span>
          </div>
          <Link href="/banks/us" className="mt-6 inline-block text-blue-600 hover:underline text-sm font-medium">
            View all 20 US banks →
          </Link>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
