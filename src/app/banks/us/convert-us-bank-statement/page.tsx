import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { ArrowRight, DollarSign, Zap, Lock, FileSpreadsheet } from "lucide-react";

export const metadata: Metadata = {
  title: "Convert US Bank Statement to Excel — #1 American Bank PDF Converter",
  description: "The best US bank statement to Excel converter. Supports Chase, Bank of America, Wells Fargo, Citibank, Capital One, and 15 more. Free preview. Starts at $1.",
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/banks/us/convert-us-bank-statement" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Which US banks are supported?", acceptedAnswer: { "@type": "Answer", text: "We support all 20 major US banks including Chase, Bank of America, Wells Fargo, Citibank, Capital One, U.S. Bank, Truist, PNC, TD Bank, Ally, Charles Schwab, Navy Federal, and more." } },
    { "@type": "Question", name: "How much does it cost?", acceptedAnswer: { "@type": "Answer", text: "The first conversion is always free with a live preview. After that, pricing starts at $1 for short statements and scales by page count. No subscription required." } },
    { "@type": "Question", name: "Can I use the output in QuickBooks?", acceptedAnswer: { "@type": "Answer", text: "Yes. Export as CSV and import into QuickBooks Online or Desktop using the Banking → Upload File option. The columns map directly." } },
  ],
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Full-width hero with big headline */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white font-medium mb-6">
            🇺🇸 The #1 US Bank Statement Converter
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Convert Any US Bank<br />Statement to Excel
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Upload a PDF. Get a spreadsheet. Works with all 20 major American banks. Free preview. Download from $1.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-white text-blue-800 font-bold text-lg rounded-xl shadow-2xl hover:bg-blue-50 transition-all">
              Start Free <ArrowRight size={20} />
            </Link>
            <Link href="/banks/us" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold text-base rounded-xl hover:bg-white/20 transition-all">
              Browse US Banks
            </Link>
          </div>
        </div>
      </section>

      {/* 4 pillars */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, color: "bg-yellow-50 text-yellow-600", title: "30 Second Conversion", desc: "AI processes your entire statement in seconds, not hours." },
              { icon: DollarSign, color: "bg-green-50 text-green-600", title: "Starts at $1", desc: "No subscription. Pay only per document, starting at $1." },
              { icon: Lock, color: "bg-blue-50 text-blue-600", title: "Bank-Level Privacy", desc: "Your PDF is deleted after processing. Zero data retention." },
              { icon: FileSpreadsheet, color: "bg-purple-50 text-purple-600", title: "Excel, CSV & JSON", desc: "Three export formats. QuickBooks, Xero, and tax-software ready." },
            ].map((p) => (
              <div key={p.title} className="text-center p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <p.icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All 20 US banks grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">All 20 US Banks Supported</h2>
          <p className="text-slate-500 text-center mb-10">Click any bank for a detailed guide</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              ["chase-bank", "Chase", "#117ACA"],
              ["bank-of-america", "Bank of America", "#E31837"],
              ["wells-fargo", "Wells Fargo", "#CD1409"],
              ["citibank", "Citibank", "#003B8E"],
              ["us-bank", "U.S. Bank", "#0A2B7D"],
              ["capital-one", "Capital One", "#D03027"],
              ["truist-bank", "Truist", "#5C068C"],
              ["pnc-bank", "PNC Bank", "#F15A22"],
              ["td-bank", "TD Bank", "#34B233"],
              ["ally-bank", "Ally Bank", "#7C2281"],
              ["charles-schwab", "Schwab", "#00A0DF"],
              ["navy-federal", "Navy Federal", "#003087"],
              ["citizens-bank", "Citizens", "#00517C"],
              ["fifth-third-bank", "Fifth Third", "#005A32"],
              ["regions-bank", "Regions", "#00703C"],
              ["huntington-bank", "Huntington", "#006F4E"],
              ["m-and-t-bank", "M&T Bank", "#00467F"],
              ["first-citizens-bank", "First Citizens", "#B22222"],
              ["keybank", "KeyBank", "#CC0000"],
              ["suntrust", "SunTrust", "#5C068C"],
            ].map(([slug, name, color]) => (
              <Link
                key={slug}
                href={`/banks/us/${slug}`}
                className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                  {name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 truncate">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Which US banks are supported?", a: "All 20 major US banks — Chase, Bank of America, Wells Fargo, Citibank, Capital One, U.S. Bank, Truist, PNC, TD Bank, Ally Bank, Charles Schwab, Navy Federal, Citizens Bank, Fifth Third, Regions, Huntington, M&T Bank, First Citizens, KeyBank, and SunTrust." },
              { q: "How much does it cost?", a: "The preview is always free. Downloading starts at $1 for short statements. Pricing scales by document size — longer statements with more pages cost slightly more. No subscription or recurring fees." },
              { q: "Can I use the output in QuickBooks?", a: "Yes. Export as CSV, then in QuickBooks Online go to Banking → Upload File and map the columns. Date, Description, Debit, Credit, and Balance map directly. Works with QuickBooks Desktop too." },
              { q: "Is this safe to use with real bank statements?", a: "Yes. Your PDF is processed on secure servers and deleted immediately after conversion. We never store, analyze, or share your financial data with any third party." },
              { q: "What if my bank isn't listed?", a: "Our AI works with virtually any bank PDF format, even if your bank isn't in our featured list. The AI adapts to the layout automatically." },
            ].map((faq, i) => (
              <details key={i} className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-900 text-sm list-none">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-lg">+</span>
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to convert your US bank statement?</h2>
          <p className="text-blue-100 mb-6">Free preview. Download from $1. No signup needed for the preview.</p>
          <Link href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg">
            Try Free Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
