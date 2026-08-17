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
  title: "Convert Bank Statement to Excel Online (XLSX/CSV) | StatementToExcel",
  description:
    "Convert your bank statement to Excel format instantly and securely. Preview, clean, edit, and export your transactions to standard XLSX or CSV files online.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/bank-statement-to-excel",
  },
};

export default function BankStatementToExcelPage() {
  const faqs = [
    {
      q: "How do I convert a bank statement PDF to Excel?",
      a: "Simply upload your PDF bank statement file using our secure upload zone. Our system extracts the table coordinates, structures the columns, and displays the transactions in an interactive spreadsheet preview. From there, you can edit cell values and click 'Export Excel' to download your clean XLSX file."
    },
    {
      q: "Is it safe to upload my bank statements here?",
      a: "Yes, security and privacy are our top priorities. All parsing and extraction happen locally in-browser or via highly secure serverless endpoints. We do not store, view, or retain your financial files or transaction records. Your data remains entirely yours."
    },
    {
      q: "Does this support multi-line transaction descriptions?",
      a: "Yes, our custom coordinate-based parser automatically groups multi-line transaction narratives that wrap across rows. It merges them into a single coherent description cell instead of splitting them into multiple separate rows."
    },
    {
      q: "Can I edit the extracted spreadsheet before exporting?",
      a: "Absolutely! The spreadsheet preview works just like Excel or Google Sheets. You can double-click cells to modify text, navigate with arrow keys, select multiple ranges, and check calculated sums in the status bar before downloading the export."
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
            <Zap size={14} /> Direct PDF-to-Spreadsheet Conversion
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Convert Bank Statement to <span className="text-primary-400">Excel</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Convert PDF bank statements into editable Excel sheets instantly. No file storage, zero formatting loss, and immediate spreadsheet editing.
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
          
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Convert Bank Statements to Excel Files?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Managing financial records is critical for accountants, bookkeeping professionals, financial analysts, and small business owners. However, bank statements are traditionally delivered in secure PDF formats, making transaction aggregation, tax preparations, and budget plotting highly cumbersome. Copying data from a PDF page often breaks the alignment, merges adjacent columns, or corrupts number systems.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Our specialized **Bank Statement to Excel** converter bridges this gap. By utilizing a coordinate-based, local extraction pipeline, it detects columns such as dates, narratives, document numbers, debits, credits, and balances. It maintains the precise vertical and horizontal alignment of cell values and constructs a clean spreadsheet ready for analysis.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Shield className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">100% Secure & Private</h3>
              <p className="text-sm text-slate-500">Your statements are parsed in-browser or on serverless APIs. No documents are stored on static databases.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Zap className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Instant OCR & Parsing</h3>
              <p className="text-sm text-slate-500">No waiting in line. Files are parsed within seconds, rendering an interactive grid layout immediately.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <FileCheck className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Interactive Editing</h3>
              <p className="text-sm text-slate-500">Edit, add, or delete transactions right in the browser. Export exactly what you need.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Step-by-Step Guide to Convert Bank PDF to Excel</h2>
          <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-10">
            <li>
              <strong>Upload the Document:</strong> Drag and drop your bank statement PDF into the designated area or browse your folders to upload it.
            </li>
            <li>
              <strong>Preview the Grid:</strong> Review the extracted data. The preview grid maps the columns dynamically from the PDF.
            </li>
            <li>
              <strong>Clean the Details:</strong> Double-click cells to fix any OCR alignment gaps, adjust transaction text, or modify values.
            </li>
            <li>
              <strong>Export:</strong> {"Click the 'Export' button, select 'Excel (XLSX)' or 'CSV', and download the formatted data to your device."}
            </li>
          </ol>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Designed for Professionals & Accountants</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Whether you are matching invoices, completing corporate tax filing, auditing historical expenses, or performing forensic accounting, you cannot afford data errors. Manual entries can lead to typos, and simple copy-pasting splits values. Our engine respects row groupings, handles narrow column margins, and retains numbers exactly as written on the statement page.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Supported Banks & Dynamic Tables</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            The parser detects the layout automatically. It works with local bank formats (HDFC, SBI, ICICI, Axis, Kotak) as well as global banking platforms (Chase, Barclays, HSBC, Bank of America, Wells Fargo). It handles multiple columns and creates dynamic schemas based on the column coordinates.
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
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">Ready to Convert Your Statement?</h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Try our secure tool today. Upload your statement PDF, edit values instantly, and export cleanly.
            </p>
            <Link href="/app" className="btn-primary bg-white text-primary-900 hover:bg-slate-100 px-8 py-3 text-sm font-bold shadow-lg">
              Start Free Now
            </Link>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
