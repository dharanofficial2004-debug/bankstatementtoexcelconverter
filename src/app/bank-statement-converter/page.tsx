import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import VideoDemo from "@/components/landing/VideoDemo";
import {
  ArrowRight,
  Shield,
  FileCheck,
  Zap,
  HelpCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Generic Bank Statement Converter Online (PDF to Excel/CSV) | StatementToExcel",
  description:
    "Convert, preview, and clean PDF statements with our premium online bank statement converter. Safe, fast, and highly accurate table parsing.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/bank-statement-converter",
  },
};

export default function BankStatementConverterPage() {
  const faqs = [
    {
      q: "What types of financial statements can I convert?",
      a: "Our generic bank statement converter works with savings accounts, current accounts, business transactions, credit card statements, and loan statements from any global bank."
    },
    {
      q: "Does this statement converter store my sensitive PDF files?",
      a: "No. StatementToExcel handles all operations inside secure local sandbox contexts. Your bank statements and transaction listings are never stored, logged, or indexed on our systems."
    },
    {
      q: "Can I download the spreadsheet directly as CSV?",
      a: "Yes, you can download in either Microsoft Excel (XLSX) format or Comma-Separated Values (CSV) format. Both formats are clean and ready for direct import into systems like QuickBooks, Zoho, or Xero."
    },
    {
      q: "How does the tool handle columns that do not match default names?",
      a: "Our parser is layout-driven, not name-driven. It looks at the horizontal text coordinates to dynamically form column grids, mapping whatever headers appear in the document (like Instrument No or Value Date) directly to your sheet."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-950/50 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6">
            <Zap size={14} /> Brand-Agnostic Table Layout Parsing
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Online Bank Statement <span className="text-primary-400">Converter</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Convert any financial PDF ledger into editable sheets. Preview, verify and clean your transactions directly online before exporting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app" className="btn-primary px-8 py-4 text-base font-bold shadow-lg shadow-primary-500/20 w-full sm:w-auto">
              Open Converter <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link href="/pricing" className="btn-secondary px-8 py-4 text-base font-medium text-white border-slate-700 hover:bg-slate-800/50 w-full sm:w-auto">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <VideoDemo />

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        <article className="prose prose-slate max-w-none lg:prose-lg bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Streamline Audits with a Fast Bank Statement Converter</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Managing corporate accounts, executing freelance budgets, or preparing tax details usually requires exporting transactional histories to analysis tools. If your bank only provides statement records in PDF formats, importing them directly to financial ledgers becomes impossible without conversion.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Our **Bank Statement Converter** is designed to parse your statements accurately. By evaluating physical bounding coordinates rather than hardcoded keywords, it automatically maps the columns (like dates, descriptions, checks, withdrawals, deposits, and balances) and lets you edit the grid online before saving.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Shield className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Completely Secure</h3>
              <p className="text-sm text-slate-500">Your files are processed locally inside secure contexts. No ledger details are logged or kept on our servers.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Zap className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Position-Driven OCR</h3>
              <p className="text-sm text-slate-500">Extracts characters based on coordinate columns, maintaining formatting and tabular structures.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <FileCheck className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Interactive Sheets</h3>
              <p className="text-sm text-slate-500">Clean up unnecessary row lines, edit text contents, and sum selected ranges easily on the preview screen.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Instructions for Converting Statements</h2>
          <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-10">
            <li>
              <strong>Choose File:</strong> Drag your statement PDF to our converter page or select it from your device storage.
            </li>
            <li>
              <strong>Preview:</strong> {"The text blocks are immediately formatted into a grid matching the statement's structure."}
            </li>
            <li>
              <strong>Clean Data:</strong> Double-click cells to adjust values, correct typos, or delete non-transaction notes.
            </li>
            <li>
              <strong>Download Worksheets:</strong> {"Choose 'Excel (XLSX)' or 'CSV' and download the formatted tables."}
            </li>
          </ol>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Maintain Narrative Integrity</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            A common issue with standard conversion tools is when long narratives wrap across multiple rows in the PDF. This results in empty transaction rows, breaking reconciliation templates. Our coordinate parser looks ahead to group these wrapped blocks into a single description cell.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Supported Banks</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            The platform is brand-agnostic and processes layout grids dynamically. It converts statements from HSBC, Barclays, Chase, Bank of America, Wells Fargo, SBI, HDFC, ICICI, and Axis, without needing custom scripts for each institution.
          </p>

          <hr className="border-slate-200 my-12" />

          {/* FAQs */}
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <HelpCircle className="text-primary-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="pb-6 border-b border-slate-100 last:border-0">
                <h4 className="text-lg font-bold text-slate-800 mb-2">{faq.q}</h4>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 bg-gradient-to-br from-primary-900 to-primary-950 p-8 sm:p-10 rounded-2xl text-white text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">Start Converting Your Statements Now</h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Convert financial statements safely online. Instant previews, direct spreadsheet edits, and easy exports.
            </p>
            <Link href="/app" className="btn-primary bg-white text-primary-900 hover:bg-slate-100 px-8 py-3 text-sm font-bold shadow-lg">
              Launch Statement Converter
            </Link>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
