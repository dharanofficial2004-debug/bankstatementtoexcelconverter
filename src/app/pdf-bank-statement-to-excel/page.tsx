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
  title: "Convert PDF Bank Statement to Excel Spreadsheet Online | StatementToExcel",
  description:
    "Convert PDF bank statements to Excel online securely. Our advanced parser maps transaction rows, headers, and descriptions directly to XLSX format.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/pdf-bank-statement-to-excel",
  },
};

export default function PdfBankStatementToExcelPage() {
  const faqs = [
    {
      q: "Can I convert protected or password-locked PDF bank statements?",
      a: "Yes, our web application will prompt you for the password right in the browser. Decryption happens locally on your device, ensuring that your secret key is never sent over the network or shared."
    },
    {
      q: "How does the tool handle scanned bank statements?",
      a: "For scanned bank statements, our coordinate extraction system will try to read the character matrices. For best results, we recommend uploading high-contrast vector PDFs directly downloaded from your bank's portal."
    },
    {
      q: "What spreadsheet formats are supported for download?",
      a: "You can download your structured bank statement as Microsoft Excel (XLSX) or standard Comma-Separated Values (CSV). Both formats are compatible with software like QuickBooks, Microsoft Excel, Google Sheets, and Zoho Books."
    },
    {
      q: "Are there any volume limits on statement conversions?",
      a: "Our free tier allows you to convert and preview unlimited files with up to 3 complete exports per month. The Pro tier provides unlimited monthly exports and processes files with priority queues."
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
            <Zap size={14} /> Highly Accurate Row Merging & Coordinate Mapping
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            PDF Bank Statement to <span className="text-primary-400">Excel</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Convert complex PDF bank statements into editable Excel sheets securely in seconds. Maintain columns, adjust margins, and clean headers locally.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app" className="btn-primary px-8 py-4 text-base font-bold shadow-lg shadow-primary-500/20 w-full sm:w-auto">
              Start Free Conversion <ArrowRight size={18} className="ml-2" />
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
          
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Automating PDF Bank Statement Extraction</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Every business and freelance professional is familiar with the chore of downloading financial transactions from PDF statements. Standard PDF files are meant for rendering, not data parsing. They lack table metadata, meaning copy-pasting their values usually yields a long string of unorganized text where numbers and narratives get mismatched.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Our **PDF Bank Statement to Excel** utility uses advanced positioning heuristics to locate individual characters and text elements on the PDF canvas. It parses their vertical coordinates to group them into cohesive rows, and measures their horizontal coordinates to partition columns. It handles narrow margins and offsets to deliver a perfect, grid-aligned copy of your data.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Shield className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Sandbox</h3>
              <p className="text-sm text-slate-500">All data transformations happen inside secure environments. Your sensitive information is never leaked or stored.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Zap className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Accurate Mapping</h3>
              <p className="text-sm text-slate-500">Detects columns such as Date, Details, Ref No, Debits, and Credits automatically and formats them cleanly.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <FileCheck className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Interactive Spreadsheet</h3>
              <p className="text-sm text-slate-500">Double-click to edit rows, delete unnecessary header texts, or calculate cell selections before downloading.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Steps to Convert PDF Bank Statement to XLSX</h2>
          <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-10">
            <li>
              <strong>Choose Your File:</strong> Drag your bank statement PDF onto our upload page or select it from your file explorer.
            </li>
            <li>
              <strong>Review & Align:</strong> Check the table layout on the screen. The custom coordinate engine maps columns exactly as they are laid out.
            </li>
            <li>
              <strong>Edit Cells:</strong> Correct transaction details, delete extra rows, or modify balances directly within our editable sheet.
            </li>
            <li>
              <strong>Select Format & Save:</strong> {"Click the 'Export' button and download your file in either Excel (XLSX) or CSV."}
            </li>
          </ol>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Engineered for Accuracy</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Standard statement parsers often fail when transaction descriptions span across multiple rows. This breaks down a single transaction record into three or four separate rows, which throws off bank reconciliation templates. Our parser looks ahead and merges multi-line narratives back into the main transaction block.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Supported Financial Institutions</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            The platform supports global banks like HSBC, Barclays, Chase, Bank of America, and Wells Fargo, as well as Indian institutions like SBI, HDFC, ICICI, and Axis. The layout engine is bank-agnostic, meaning it extracts tables regardless of custom corporate branding or custom fonts.
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
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">Ready to Convert Your PDF?</h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Try StatementToExcel now. Instant preview, zero file storage, and secure local compilation.
            </p>
            <Link href="/app" className="btn-primary bg-white text-primary-900 hover:bg-slate-100 px-8 py-3 text-sm font-bold shadow-lg">
              Convert Statement Now
            </Link>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
