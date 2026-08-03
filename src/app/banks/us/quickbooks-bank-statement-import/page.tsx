import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "QuickBooks Bank Statement Import — Convert PDF to CSV for QuickBooks",
  description: "Convert your US bank statement PDF to a QuickBooks-compatible CSV file. Supports Chase, Bank of America, Wells Fargo and all major US banks. Starts at $1.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/quickbooks-bank-statement-import" },
};

const steps = [
  { step: "1", title: "Download your bank statement PDF", body: "Log into your bank's website or app and download the statement PDF for the period you want to import." },
  { step: "2", title: "Upload PDF to StatementToExcel", body: "Drag and drop your PDF into our converter. The AI reads your bank's specific format automatically." },
  { step: "3", title: "Review and export as CSV", body: "Check the preview. Correct any rows if needed. Then click Export CSV — the file is formatted for QuickBooks." },
  { step: "4", title: "Import into QuickBooks Online", body: "In QuickBooks: Banking → Upload File → Select your CSV → Map columns (Date, Description, Amount) → Finish." },
];

const qbTips = [
  { tip: "Use the 3-column format (Date, Description, Amount) for QuickBooks Online's basic import." },
  { tip: "For QuickBooks Desktop, use the IIF format or the 5-column CSV (Date, Description, Debit, Credit, Balance)." },
  { tip: "Always import in chronological order — oldest transactions first." },
  { tip: "Chase and Bank of America statements sometimes include pending transactions — review and remove them before importing." },
  { tip: "Set the date format to MM/DD/YYYY in the mapping step — this is what QuickBooks expects for US banks." },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Centered hero with steps below */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 border border-green-200 rounded-full text-sm text-green-800 font-semibold mb-6">
            🧾 QuickBooks Compatible Export
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5">
            Import US Bank Statements into QuickBooks
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            QuickBooks can't read bank PDFs directly. Convert your Chase, Bank of America, or Wells Fargo statement to a CSV file that imports into QuickBooks Online or Desktop in minutes.
          </p>
          <Link href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all">
            Convert to QuickBooks CSV <ArrowRight size={17} />
          </Link>
          <p className="mt-3 text-sm text-slate-400">Free preview · From $1 per statement</p>
        </div>
      </section>

      {/* Step by step */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Step-by-Step Guide</h2>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block" />
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.step} className="flex gap-6">
                  <div className="w-14 h-14 rounded-full bg-green-600 text-white font-bold text-xl flex items-center justify-center flex-shrink-0 relative z-10">
                    {s.step}
                  </div>
                  <div className="pt-3">
                    <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                    <p className="text-slate-600 text-sm">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pro tips */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <AlertCircle size={22} className="text-amber-500" />
            QuickBooks Import Tips for US Banks
          </h2>
          <div className="space-y-4">
            {qbTips.map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bank links */}
      <section className="py-14 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Works with these US banks</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              { slug: "chase-bank", name: "Chase" },
              { slug: "bank-of-america", name: "Bank of America" },
              { slug: "wells-fargo", name: "Wells Fargo" },
              { slug: "citibank", name: "Citibank" },
              { slug: "capital-one", name: "Capital One" },
              { slug: "us-bank", name: "U.S. Bank" },
              { slug: "pnc-bank", name: "PNC Bank" },
              { slug: "td-bank", name: "TD Bank" },
            ].map((b) => (
              <Link key={b.slug} href={`/banks/us/${b.slug}`} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 hover:border-green-300 hover:text-green-700 transition-all">
                {b.name}
              </Link>
            ))}
          </div>
          <Link href="/banks/us" className="text-green-600 hover:underline text-sm font-medium">View all 20 US banks →</Link>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
