import { Metadata } from "next";
import Link from "next/link";
import { usBanks } from "@/lib/usBanks";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Building2, DollarSign, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Convert US Bank Statements to Excel | All Major American Banks",
  description:
    "Convert Chase, Bank of America, Wells Fargo, Citibank, and 16 more US bank statement PDFs to Excel or CSV instantly. Free preview. Starts at $1.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/banks/us",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "US Bank Statement to Excel Converters",
  description: "Convert any US bank statement PDF to Excel or CSV",
  url: "https://bankstatementtoexcelconverter.com/banks/us",
  numberOfItems: 20,
};

const useCases = [
  {
    icon: "📊",
    title: "QuickBooks Import",
    desc: "Export clean CSV files and import them directly into QuickBooks Online or Desktop",
  },
  {
    icon: "🧾",
    title: "Tax Preparation",
    desc: "Organize transactions for Schedule C, CPA review, and TurboTax-ready summaries",
  },
  {
    icon: "📋",
    title: "Expense Reporting",
    desc: "Build monthly expense reports from checking or business account activity",
  },
  {
    icon: "🏦",
    title: "Loan Applications",
    desc: "Submit structured Excel statements for mortgage, SBA, or personal loan review",
  },
  {
    icon: "📈",
    title: "Financial Analysis",
    desc: "Analyze spending patterns, cash flow, and category breakdowns in Excel",
  },
  {
    icon: "🤝",
    title: "Bookkeeping",
    desc: "Hand structured spreadsheets to your accountant instead of raw PDFs",
  },
];

const usFaqs = [
  {
    question: "Does the tool support all US banks?",
    answer:
      "It covers the most common major US banks and many regional institutions, with support expanding as more statement formats are added.",
  },
  {
    question: "Can I convert business statements too?",
    answer:
      "Yes. The workflow is designed for personal checking statements, business accounts, and merchant statements alike.",
  },
  {
    question: "Is there a free preview?",
    answer:
      "Yes. You can preview the extracted spreadsheet before exporting, so you can confirm the output without paying upfront.",
  },
];

export default function USBanksIndexPage() {
  const bankSlugs = Object.keys(usBanks);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#f3f8ff_52%,_#eef5ff_100%)] px-4 pb-24 pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[620px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-100/80 via-blue-50/20 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
              <Building2 size={15} />
              All major US banks supported
            </div>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              Convert US bank statements to{" "}
              <span className="text-primary-600">Excel or CSV</span> without
              manual retyping
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              Upload Chase, Bank of America, Wells Fargo, Citibank, and other US
              bank PDFs. Review a structured spreadsheet preview and export a
              clean workbook in seconds.
            </p>
            <div className="mb-8 flex flex-wrap gap-3">
              {[
                "Free preview",
                "Starts at $1",
                "QuickBooks ready",
                "No data stored",
              ].map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-600 shadow-sm"
                >
                  <CheckCircle2 size={15} className="text-primary-500" />
                  {b}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700"
              >
                Try free now <ArrowRight size={18} />
              </Link>
              <Link
                href="#faq"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-700 transition-all hover:border-primary-300 hover:text-primary-700"
              >
                See FAQs
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.3)]">
            <div className="rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="mb-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">US bank statement detected</p>
                  <p className="text-slate-400">Chase • 84 transactions</p>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Ready to export
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ["05/06/2026", "Payroll deposit", "$8,450.00"],
                  ["06/06/2026", "Amazon purchase", "$129.99"],
                  ["07/06/2026", "Rent transfer", "$2,100.00"],
                ].map(([date, desc, amount]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{desc}</p>
                      <p className="text-slate-500">{date}</p>
                    </div>
                    <span className="font-semibold text-slate-100">
                      {amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
            Why Americans Use This Tool
          </h2>
          <p className="text-slate-500 text-center mb-12">
            From freelancers to CFOs — the most common US use cases
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="text-3xl mb-3">{uc.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{uc.title}</h3>
                <p className="text-sm text-slate-500">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banks Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
            Select Your Bank
          </h2>
          <p className="text-slate-500 text-center mb-12">
            Click your bank for a detailed guide and instant conversion
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bankSlugs.map((slug) => {
              const bank = usBanks[slug];
              return (
                <Link
                  key={slug}
                  href={`/banks/us/${slug}`}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {bank.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {bank.type}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="ml-auto text-slate-300 group-hover:text-primary-400 flex-shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <DollarSign size={40} className="text-blue-200 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">
            Pricing starts at just $1
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            First conversion is always free. After that, pay only per document —
            starting at $1 for short statements.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all"
          >
            View Pricing <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section
        id="faq"
        className="py-20 px-4 bg-white border-t border-slate-100"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">
            Common questions about US bank statement conversion
          </h2>
          <p className="text-center text-slate-600 mb-10">
            Everything you need to know if you are converting US statements for
            accounting, taxes, or reporting.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {usFaqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General pages internal links */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            More US Resources
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                href: "/banks/us/bank-statement-to-excel-usa",
                label: "Bank Statement to Excel USA",
              },
              {
                href: "/banks/us/quickbooks-bank-statement-import",
                label: "QuickBooks Import",
              },
              {
                href: "/banks/us/bank-statement-for-taxes",
                label: "Taxes & CPA Use",
              },
              {
                href: "/banks/us/bank-statement-csv-usa",
                label: "Bank Statement CSV USA",
              },
              {
                href: "/banks/us/convert-bank-statement-pdf-usa",
                label: "Convert PDF USA",
              },
              {
                href: "/banks/us/free-bank-statement-converter-usa",
                label: "Free Converter USA",
              },
              {
                href: "/banks/us/bank-statement-excel-template-usa",
                label: "Excel Template USA",
              },
              {
                href: "/banks/us/business-bank-statement-converter",
                label: "Business Converter",
              },
              {
                href: "/banks/us/bank-statement-to-json-usa",
                label: "Bank Statement to JSON",
              },
              {
                href: "/banks/us/us-bank-statement-analyzer",
                label: "Statement Analyzer",
              },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-600 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
