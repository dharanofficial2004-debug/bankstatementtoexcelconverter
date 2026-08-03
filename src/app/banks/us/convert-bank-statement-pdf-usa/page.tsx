import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import ProductPreview from "@/components/landing/ProductPreview";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Convert Bank Statement PDF USA — Any US Bank to Excel or CSV",
  description: "Convert any US bank statement PDF to Excel or CSV online. AI-powered extraction supports Chase, Wells Fargo, Citibank, and all major American banks. Starts at $1.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/convert-bank-statement-pdf-usa" },
};

const whyAI = [
  { title: "Understands US bank formats", body: "Each US bank uses a slightly different PDF layout. Chase uses 'Posting Date', Wells Fargo uses 'Date', Bank of America uses columns differently. Our AI knows them all." },
  { title: "Handles multi-page statements", body: "12-month or multi-year statements with 100+ pages are processed completely — not just the first page." },
  { title: "Preserves running balance", body: "The balance column is extracted and validated against transaction math — so you can spot discrepancies immediately." },
  { title: "Editable before you download", body: "The live spreadsheet preview lets you fix any OCR errors, delete header rows, or add custom columns before exporting." },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero — centered with product preview below */}
      <section className="pt-32 pb-10 px-4 bg-gradient-to-br from-blue-900 to-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs text-blue-300 uppercase tracking-widest font-semibold block mb-4">AI-Powered · US Bank PDF Converter</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Convert Any US Bank Statement PDF to Excel
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Stop copying rows by hand. Our AI reads your Chase, Wells Fargo, Citibank, or any American bank PDF and extracts every transaction into a clean spreadsheet automatically.
          </p>
          <Link href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all">
            Upload PDF Now <ArrowRight size={17} />
          </Link>
          <p className="text-blue-400 text-sm mt-3">Free preview · Export from $1</p>
        </div>
      </section>

      <div className="bg-white px-4 pb-10">
        <ProductPreview />
      </div>

      {/* Why AI section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Why AI Beats Manual Data Entry</h2>
          <p className="text-slate-500 text-center mb-12">Traditional PDF-to-Excel tools use rigid templates. Our AI adapts to each bank's format.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {whyAI.map((w) => (
              <div key={w.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <CheckCircle2 size={20} className="text-blue-500 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">{w.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bank links */}
      <section className="py-14 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Select Your US Bank</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {[
              ["chase-bank", "Chase"],
              ["bank-of-america", "Bank of America"],
              ["wells-fargo", "Wells Fargo"],
              ["citibank", "Citibank"],
              ["capital-one", "Capital One"],
              ["us-bank", "U.S. Bank"],
              ["truist-bank", "Truist"],
              ["ally-bank", "Ally Bank"],
            ].map(([slug, name]) => (
              <Link key={slug} href={`/banks/us/${slug}`} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-all">
                {name}
              </Link>
            ))}
          </div>
          <Link href="/banks/us" className="text-blue-600 hover:underline text-sm font-medium">View all 20 US banks →</Link>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
