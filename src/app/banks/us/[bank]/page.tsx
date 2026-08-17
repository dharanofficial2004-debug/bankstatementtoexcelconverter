import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { usBanks } from "@/lib/usBanks";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import VideoDemo from "@/components/landing/VideoDemo";
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Download,
  Upload,
  Table2,
} from "lucide-react";

interface Props {
  params: { bank: string };
}

export async function generateStaticParams() {
  return Object.keys(usBanks).map((bank) => ({ bank }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bank = usBanks[params.bank];
  if (!bank) return {};
  return {
    title: `${bank.name} Statement to Excel Converter — Starts at $1`,
    description: `Convert ${bank.name} bank statement PDF to Excel, CSV, or JSON online. Works with all ${bank.name} account types. Free preview. Perfect for QuickBooks, taxes, and bookkeeping.`,
    alternates: {
      canonical: `https://bankstatementtoexcelconverter.com/banks/us/${params.bank}`,
    },
  };
}

export default function USBankPage({ params }: Props) {
  const slug = params.bank;
  const bank = usBanks[slug];
  if (!bank) notFound();

  const allSlugs = Object.keys(usBanks);
  const related = allSlugs.filter((s) => s !== slug).slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${bank.name} Statement to Excel Converter`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "1.00", priceCurrency: "USD" },
    description: `Convert ${bank.name} bank statement PDF to Excel or CSV instantly`,
    url: `https://bankstatementtoexcelconverter.com/banks/us/${slug}`,
  };

  const faqs = [
    {
      q: `How do I convert my ${bank.name} statement to Excel?`,
      a: `Download your ${bank.name} PDF statement from online banking or the mobile app. Upload it here — our AI reads the ${bank.name} format automatically and produces a clean Excel spreadsheet in seconds.`,
    },
    {
      q: `Can I import ${bank.name} statements into QuickBooks?`,
      a: `Yes. Export as CSV from our tool, then use QuickBooks Online's bank transactions import feature. The columns (Date, Description, Debit, Credit, Balance) map directly.`,
    },
    {
      q: `Does it work with ${bank.name} business account statements?`,
      a: `Absolutely. ${bank.name} business checking and savings statements use the same PDF format — our tool handles them correctly, including multi-page statements.`,
    },
    {
      q: `How much does it cost to convert a ${bank.name} statement?`,
      a: `The first conversion is always free with a preview. After that, pricing starts at $1 for short statements and scales by page count — no subscription needed.`,
    },
    {
      q: `Is my ${bank.name} statement data secure?`,
      a: `Your PDF is processed server-side and deleted immediately after conversion. We never store your financial data or share it with third parties.`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold mb-5"
                style={{ backgroundColor: bank.color }}
              >
                {bank.name} · {bank.type}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                Convert <span style={{ color: bank.color }}>{bank.name}</span>{" "}
                Statement to Excel
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                Upload your {bank.name} PDF and get a clean, editable
                spreadsheet instantly. Works with all {bank.name} account types
                — checking, savings, business, and credit card.
              </p>
              <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                {[
                  "Free preview",
                  "Starts at $1",
                  "QuickBooks ready",
                  "CSV & Excel",
                ].map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1.5 text-sm text-slate-600"
                  >
                    <CheckCircle2 size={14} className="text-green-500" />
                    {b}
                  </span>
                ))}
              </div>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl transition-all shadow-lg"
                style={{ backgroundColor: bank.color }}
              >
                Upload {bank.name} PDF <ArrowRight size={17} />
              </Link>
            </div>
            {/* Right — stat cards */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full max-w-xs">
              {[
                { label: "Customers", value: bank.customers },
                { label: "Founded", value: bank.founded },
                { label: "HQ", value: bank.headquarters },
                { label: "From", value: "$1" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center"
                >
                  <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                  <p className="font-bold text-slate-800 text-sm">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Video demo ── */}
      <div className="px-4 -mt-4 mb-16">
        <VideoDemo />
      </div>

      {/* ── How to download ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
            How to Download Your {bank.name} Statement PDF
          </h2>
          <p className="text-slate-500 text-center mb-12">
            Step-by-step for every method
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {bank.downloadInstructions.map((method, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  {method.title}
                </h3>
                <ol className="space-y-3">
                  {method.steps.map((step, si) => (
                    <li
                      key={si}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: bank.color }}
                      >
                        {si + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works (3 steps) ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            3 Steps to Convert
          </h2>
          <p className="text-slate-500 mb-14">
            No signup needed for the free preview
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                label: "Upload PDF",
                desc: `Drop your ${bank.name} statement PDF — any account type, any date range`,
              },
              {
                icon: Table2,
                label: "Review Transactions",
                desc: "Our AI extracts every row into a live editable spreadsheet. Fix anything before downloading.",
              },
              {
                icon: Download,
                label: "Export from $1",
                desc: "Download as Excel (.xlsx), CSV for QuickBooks, or JSON for developers.",
              },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <s.icon size={28} className="text-blue-600" />
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.label}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported formats ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
            Supported {bank.name} Statement Formats
          </h2>
          <p className="text-slate-500 text-center mb-10">
            All account types and delivery methods covered
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              {bank.statementFormats.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2
                    size={18}
                    className="text-green-500 flex-shrink-0"
                  />
                  <span className="font-medium text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800">
            <strong>Popular for:</strong> {bank.popularFor.join(" · ")}
          </div>
        </div>
      </section>

      {/* ── US use cases ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Common US Use Cases for {bank.name} Exports
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "QuickBooks & Xero Integration",
                body: `Export your ${bank.name} CSV, then import into QuickBooks Online via Banking → Upload File. The Date, Description, Debit, Credit columns are pre-mapped.`,
              },
              {
                title: "CPA & Tax Filing",
                body: `CPAs and accountants request Excel statements for Schedule C, 1099, and self-employment tax prep. Convert your ${bank.name} PDF in minutes instead of manual entry.`,
              },
              {
                title: "Mortgage & SBA Loan Applications",
                body: `Lenders require 2–3 months of bank statements. ${bank.name} Excel exports look professional and make it easy to highlight income transactions.`,
              },
              {
                title: "Business Expense Tracking",
                body: `Business owners use ${bank.name} Excel exports to categorize monthly expenses, track cash flow, and prepare for quarterly reviews.`,
              },
            ].map((uc, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <h3 className="font-bold text-slate-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {uc.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing callout ── */}
      <section className="py-16 px-4" style={{ backgroundColor: bank.color }}>
        <div className="max-w-2xl mx-auto text-center">
          <DollarSign size={36} className="text-white/70 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Pricing starts at $1
          </h2>
          <p className="text-white/80 mb-6">
            First conversion free. Pay only per document — no subscription.
            Short {bank.name} statements start at $1.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white font-semibold rounded-xl transition-all hover:bg-slate-50"
            style={{ color: bank.color }}
          >
            Try Free Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related banks ── */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Also works with:
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {related.map((s) => (
              <Link
                key={s}
                href={`/banks/us/${s}`}
                className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 font-medium hover:border-blue-300 hover:text-blue-700 transition-all"
              >
                {usBanks[s].name}
              </Link>
            ))}
          </div>
          <Link
            href="/banks/us"
            className="text-blue-600 hover:underline font-medium"
          >
            View all 20 US banks →
          </Link>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
