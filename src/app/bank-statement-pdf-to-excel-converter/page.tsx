import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  ArrowRight,
  Shield,
  FileCheck,
  Zap,
  HelpCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best Bank Statement PDF to Excel Converter Online | StatementToExcel",
  description:
    "Extract tables from PDF statements with our premium online bank statement PDF to Excel converter. Preview in grid, edit details, and export cleanly.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/bank-statement-pdf-to-excel-converter",
  },
};

export default function BankStatementPdfToExcelConverterPage() {
  const faqs = [
    {
      q: "Does this bank statement PDF to Excel converter support scanned documents?",
      a: "Yes, our engine extracts characters from the PDF matrices directly. For scanned statements, we recommend ensuring the text is readable and lines are not overlapping for the highest extraction accuracy."
    },
    {
      q: "Can I export data from multiple statements at once?",
      a: "The Free plan allows you to upload and preview statements sequentially. Our Pro plan supports bulk PDF processing, letting you parse multiple files and compile them into a unified table layout."
    },
    {
      q: "Is there any software installation required?",
      a: "No installation is required. StatementToExcel is a fully web-based SaaS platform. You can access it from any browser on Windows, macOS, Linux, iOS, or Android."
    },
    {
      q: "Does the converter parse credit card statements?",
      a: "Absolutely! The coordinate-based table parser is brand-agnostic and will extract tables from credit card statements, savings accounts, checking accounts, and business ledgers alike."
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
            <Zap size={14} /> {"The Accountant's Choice for Financial Data Extraction"}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Bank Statement PDF to <span className="text-primary-400">Excel</span> Converter
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Convert any financial PDF ledger to clean spreadsheet structures instantly. Verify details on screen and export formatted XLSX files safely.
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

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        <article className="prose prose-slate max-w-none lg:prose-lg bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Extract Tables with the Best PDF Bank Statement Converter</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            When tax season arrives, sorting through monthly PDF statements becomes a manual nightmare. The traditional path involves spending hours copying and pasting rows into Excel, only to discover that numeric alignments are broken, decimal columns are merged, or dates are completely misplaced.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Our premium **Bank Statement PDF to Excel Converter** is engineered to save finance teams and bookkeepers hundreds of operational hours. By evaluating the physical layout of character bounding boxes, the parser reconstructs the grid schema from the raw canvas. It maps data cells to structural coordinates, allowing you to edit values dynamically before exporting to XLSX.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Shield className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Data Logging</h3>
              <p className="text-sm text-slate-500">Your privacy is guaranteed. All file processing is performed safely inside local contexts without retention.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Zap className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Grid Auto-Grouping</h3>
              <p className="text-sm text-slate-500">Intelligent bounding box analysis isolates columns and joins wrapped sentences accurately.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <FileCheck className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Dynamic Selection</h3>
              <p className="text-sm text-slate-500">Select cell ranges to check cumulative sums instantly in the status bar, exactly like premium sheets.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Step-by-Step Conversion Flow</h2>
          <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-10">
            <li>
              <strong>Upload Your Statement:</strong> Drop your bank or credit card PDF statement into our secure tool.
            </li>
            <li>
              <strong>Examine Layout:</strong> Watch the parser structure the tables instantly in our editable preview.
            </li>
            <li>
              <strong>Edit Cells:</strong> Update amounts, delete subtotal rows, or format descriptions to fit your ledger rules.
            </li>
            <li>
              <strong>Download Spreadsheet:</strong> Export the clean data directly as an XLSX sheet or a standard CSV.
            </li>
          </ol>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Reconciliation Made Simple</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            In business accounting, matching bank statements with internal ledgers is critical. Manually keying in entries invites errors that delay reconciliation. Using our converter, you get clean, raw data rows. You can import these directly into popular business systems like Sage, NetSuite, Xero, or QuickBooks without any extra steps.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Support for Custom Column Types</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            {"Our tool does not make assumptions about headers or force layout formatting. If your bank includes custom columns such as \"Value Date\", \"Chq/Ref. No.\", or \"Transaction Fee\", our system extracts them exactly as-is, mapping them directly to column columns in the sheet."}
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
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">Start Extracting Financial Tables Now</h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Try our converter today. Free uploads, instant previews, and direct spreadsheet exports.
            </p>
            <Link href="/app" className="btn-primary bg-white text-primary-900 hover:bg-slate-100 px-8 py-3 text-sm font-bold shadow-lg">
              Launch PDF Converter
            </Link>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
