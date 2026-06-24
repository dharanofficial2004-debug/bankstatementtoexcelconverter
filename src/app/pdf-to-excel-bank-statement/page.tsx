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
  title: "Secure PDF to Excel Bank Statement Converter Online | StatementToExcel",
  description:
    "Convert PDF bank statements to Excel files accurately and securely. Review and clean transaction tables locally in your browser. Free exports included.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/pdf-to-excel-bank-statement",
  },
};

export default function PdfToExcelBankStatementPage() {
  const faqs = [
    {
      q: "Does this utility work on mobile devices?",
      a: "Yes, our web application is fully responsive. You can upload statements, preview extracted sheets, and export XLSX files from your iPhone, iPad, Android tablet, or desktop computer."
    },
    {
      q: "Can I convert large statement PDFs with hundreds of pages?",
      a: "Yes, our processing engine handles multi-page statements efficiently. It compiles tables from all pages, matching columns accurately to generate a single consolidated worksheet."
    },
    {
      q: "Is my personal banking data saved on Vercel or Supabase?",
      a: "No. All text parsing and layout reconstruction are done inside secure local contexts. We do not write your statement contents to our databases, keeping your balance records secure."
    },
    {
      q: "How can I contact support if an extraction fails?",
      a: "Our Pro members have access to direct priority support. You can reach out via email to support@bankstatementtoexcelconverter.com and our engineering team will inspect the parsing rules."
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
            <Zap size={14} /> Local In-Browser Processing & Dynamic Alignment
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            PDF to Excel Bank <span className="text-primary-400">Statement</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly turn your financial PDF files into active Excel sheets. Edit values on screen, audit numeric entries, and export in a single click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app" className="btn-primary px-8 py-4 text-base font-bold shadow-lg shadow-primary-500/20 w-full sm:w-auto">
              Start Converting <ArrowRight size={18} className="ml-2" />
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
          
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Convert PDF to Excel Bank Statements Effortlessly</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Bookkeeping operations, tax filing, and auditing demand absolute data accuracy. If you manually key in numbers from PDF pages, a single typo can throw off hours of work. Copying tables using typical PDF viewers breaks down the columns and combines adjacent values.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Our specialized **PDF to Excel Bank Statement** converter resolves these formatting issues. Utilizing coordinate-based heuristics, it analyzes the structure of each page to isolate column paths. It structures tables dynamically without altering currency indicators, number systems, or date configurations.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Shield className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Absolute Security</h3>
              <p className="text-sm text-slate-500">Your statement files remain private. Extraction is processed locally without permanent server storage.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Zap className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Dynamic Layouts</h3>
              <p className="text-sm text-slate-500">Maps custom headers and layout schemas dynamically based on horizontal character coordinates.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <FileCheck className="text-primary-600 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Editable Grid</h3>
              <p className="text-sm text-slate-500">Preview, edit cells, delete rows, or inspect selection sums inside a Sheets-style spreadsheet interface.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Step-by-Step Conversion Walkthrough</h2>
          <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-10">
            <li>
              <strong>Upload Your File:</strong> Drop your bank statement PDF onto our secure upload section.
            </li>
            <li>
              <strong>Validate Content:</strong> Review the extracted transaction grid on the screen, matching original rows.
            </li>
            <li>
              <strong>Modify Details:</strong> Double-click cells to clean any OCR gaps, or remove non-transaction header rows.
            </li>
            <li>
              <strong>Export:</strong> {"Choose 'Excel (XLSX)' or 'CSV' and download the cleaned worksheet."}
            </li>
          </ol>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">Accurate Multi-Line Row Grouping</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            A common issue with standard converters is when bank statements wrap transaction descriptions across multiple lines. Standard tools split these descriptions into multiple distinct, empty rows, throwing off bank reconciliation. Our parser automatically identifies these wrapped text lines and groups them back into a single transaction row.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Compatible With All Global Banks</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            The coordinate parser reads character positions dynamically. This allows it to work with statement formats from HDFC, SBI, ICICI, Axis, Kotak, Chase, Barclays, HSBC, Bank of America, and Wells Fargo, without requiring custom parser templates for each brand.
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
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">Start Your First Conversion Now</h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Convert statement PDFs to Excel safely. Upload your files, edit them instantly, and download clean data.
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
