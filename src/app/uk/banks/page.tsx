import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "UK Bank Statement to Excel — Convert Barclays, HSBC, Lloyds (2026)",
  description:
    "Convert UK bank statements to Excel free. Works with Barclays, HSBC, Lloyds, NatWest, Santander. 99%+ accuracy, no signup. Perfect for mortgage & visa applications. Download now →",
  alternates: {
    canonical: "https://www.bankstatementtoexcelconverter.com/uk/banks",
  },
  openGraph: {
    title: "UK Bank Statement to Excel — Convert Barclays, HSBC, Lloyds (2026)",
    description:
      "Convert UK bank statements to Excel free. Works with Barclays, HSBC, Lloyds, NatWest, Santander. 99%+ accuracy, no signup.",
    url: "https://www.bankstatementtoexcelconverter.com/uk/banks",
    siteName: "StatementToExcel",
    locale: "en_GB",
    type: "website",
  },
};

const ukBanks = [
  "Barclays",
  "HSBC UK",
  "Lloyds Bank",
  "NatWest",
  "Santander UK",
  "Halifax",
  "Royal Bank of Scotland",
  "Bank of Scotland",
  "TSB",
  "Virgin Money",
  "Starling Bank",
  "Monzo",
  "Revolut UK",
  "Nationwide",
];

const useCases = [
  {
    title: "Mortgage applications",
    desc: "Mortgage providers often request three to six months of bank statements. Export a clean spreadsheet from your PDF in seconds.",
  },
  {
    title: "Visa applications",
    desc: "Many visa categories require structured bank statements to show sufficient funds. Convert your PDF for easy review.",
  },
  {
    title: "Self-assessment tax returns",
    desc: "Prepare income and expense data for HMRC self-assessment. Export to Excel and organise by category.",
  },
  {
    title: "Bookkeeping and reconciliation",
    desc: "Match transactions against your accounting records without manual entry. Export to CSV for Xero, FreeAgent, or Sage.",
  },
  {
    title: "Rental applications",
    desc: "Landlords and letting agents often need recent bank statements. An organised spreadsheet makes your application clearer.",
  },
  {
    title: "Personal budgeting",
    desc: "Understand your spending patterns with an editable spreadsheet. Filter by category or date range in Excel.",
  },
];

const faqs = [
  {
    question: "Can I convert any UK bank statement PDF to Excel?",
    answer:
      "Most text-based PDFs from major UK banks work well. Upload your PDF, check the preview, and export if the transactions look correct. Always review before using the file for official purposes.",
  },
  {
    question: "Is Excel or CSV better for UK bank statements?",
    answer:
      "Excel suits analysis, filtering, and reports. CSV is better for importing into accounting software like Xero, FreeAgent, or QuickBooks.",
  },
  {
    question: "How do I know the conversion is correct?",
    answer:
      "Compare the opening and closing balances against your original PDF, and spot-check a few transactions before you export.",
  },
  {
    question: "Can I use this for mortgage or visa applications?",
    answer:
      "The exported file is useful for organising and presenting transaction data. Keep the original PDF as your official bank record — most lenders and visa authorities require the original document.",
  },
  {
    question: "What if some transactions are missing after conversion?",
    answer:
      "Check the preview and compare with your original PDF. If transactions are missing, try re-downloading a fresh PDF from your bank and uploading again.",
  },
  {
    question: "Does it work with challenger bank statements from Monzo or Starling?",
    answer:
      "Yes. Statements from challenger banks like Monzo, Starling, and Revolut are typically clean text-based PDFs that convert well. Check the preview to confirm before exporting.",
  },
];

export default function UKBanksHubPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.bankstatementtoexcelconverter.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "United Kingdom",
        item: "https://www.bankstatementtoexcelconverter.com/uk/banks",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "UK Banks",
        item: "https://www.bankstatementtoexcelconverter.com/uk/banks",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      {/* Hero */}
      <header className="pt-32 pb-16 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li>
                <Link href="/uk/banks" className="hover:text-primary-600 transition-colors">
                  United Kingdom
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li className="text-slate-700 font-medium">UK Banks</li>
            </ol>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
            UK Bank Statement to Excel
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
            Convert your UK bank statement PDF to Excel or CSV. Upload the file,
            review transactions in an editable table, and export a clean
            spreadsheet.
          </p>

          {/* Hero benefits */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              "Preview and edit before export",
              "Excel and CSV downloads",
              "Works with PDF bank statements",
              "Keep your original PDF for verification",
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm"
              >
                <CheckCircle2 size={14} className="text-success-600 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25 text-base"
            >
              Upload Bank Statement PDF <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold px-8 py-3.5 rounded-xl hover:border-primary-300 hover:text-primary-700 transition-colors text-base"
            >
              See how it works
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Supported banks */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Works with statements from major UK banks
            </h2>
            <p className="text-slate-600 mb-8">
              You can try this converter with PDF statements from:
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {ukBanks.map((bank) => (
                <span
                  key={bank}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all"
                >
                  {bank}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 italic">
              This list is informational and does not guarantee compatibility
              with every account type or statement version. Always review the
              preview before exporting.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              How to convert a UK bank statement to Excel
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title: "Download statement as PDF",
                  desc: "Log into your UK bank online banking or mobile app and download your statement as a PDF.",
                },
                {
                  step: 2,
                  title: "Upload the PDF",
                  desc: "Click the upload button and select your bank statement PDF. Processing takes a few seconds.",
                },
                {
                  step: 3,
                  title: "Review and edit transactions",
                  desc: "Check the editable preview table. Correct any values if needed before exporting.",
                },
                {
                  step: 4,
                  title: "Export to Excel or CSV",
                  desc: "Download a clean .xlsx or .csv file ready for mortgage applications, visa, self-assessment, or bookkeeping.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
              >
                Try it now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              Common uses for UK bank statements in Excel
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((uc) => (
                <div
                  key={uc.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {uc.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 border border-primary-600 text-primary-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors"
              >
                Try it now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900 mb-2 text-base">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12 px-4 border-t border-slate-100">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-600">
            <Link
              href="/blog"
              className="hover:text-primary-600 transition-colors"
            >
              Read our guide on converting bank statements
            </Link>
            <span className="hidden sm:inline text-slate-300">·</span>
            <Link
              href="/"
              className="hover:text-primary-600 transition-colors"
            >
              Bank Statement to Excel Converter
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
