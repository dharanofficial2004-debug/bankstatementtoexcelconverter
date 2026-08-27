import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import {
  CheckCircle2,
  Shield,
  Eye,
  Zap,
  FileText,
  Users,
  Lock,
  ScanLine,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import PseoLinks from "@/components/landing/PseoLinks";
import FaqSection from "@/components/landing/FaqSection";
import VideoDemo from "@/components/landing/VideoDemo";
import { CloudUpload, Download, PencilLine } from "lucide-react";

export const metadata: Metadata = {
  title:
    "Bank Statement to Excel Converter — Free, No Signup, 99%+ Accuracy",
  description:
    "Convert bank statement PDFs to Excel or CSV instantly. Live editable preview, 99%+ accuracy, works with 350+ banks. No signup required. Free forever.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com",
  },
  openGraph: {
    title:
      "Bank Statement to Excel Converter — Free, No Signup, 99%+ Accuracy",
    description:
      "Convert bank statement PDFs to Excel or CSV instantly. Live editable preview, 99%+ accuracy, works with 350+ banks. No signup required.",
    url: "https://bankstatementtoexcelconverter.com",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://bankstatementtoexcelconverter.com/icon-512.png",
        width: 512,
        height: 512,
        alt: "Bank Statement to Excel Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Bank Statement to Excel Converter — Free, No Signup, 99%+ Accuracy",
    description:
      "Convert bank statement PDFs to Excel or CSV instantly. Live editable preview, 99%+ accuracy, works with 350+ banks.",
  },
};

/* ─── FAQ data ─────────────────────────────────────────────────────────────── */
const homeFaqs = [
  {
    question: "How do I convert a bank statement to Excel?",
    answer:
      "Upload your bank statement PDF using the button above. Our AI extracts all transactions and displays them in a live editable spreadsheet. Review the data, correct anything if needed, then click Export to Excel or Export to CSV. The entire process takes less than 30 seconds.",
  },
  {
    question: "Can I convert scanned bank statements to Excel?",
    answer:
      "Yes. Our converter uses advanced OCR (Optical Character Recognition) to read scanned PDFs and image-based statements. For best results, ensure scans are at least 300 DPI and clearly legible. Processing time for scanned statements is 15–30 seconds.",
  },
  {
    question: "Is it safe to upload bank statements to an online converter?",
    answer:
      "Yes. All uploads use 256-bit SSL encryption. Files are automatically deleted within 1 hour of processing, never stored permanently, never shared with third parties, and never used to train AI models.",
  },
  {
    question: "Which banks are supported?",
    answer:
      "Our AI automatically detects and parses statements from 350+ banks across 50+ countries, including HDFC, SBI, ICICI, Chase, Wells Fargo, Bank of America, Barclays, HSBC, and many more. If your bank is not listed, upload your statement to test — it very likely works.",
  },
  {
    question: "How accurate is the conversion?",
    answer:
      "The converter achieves 99%+ accuracy on text-based PDFs and 95%+ on scanned statements at 300+ DPI. Balance verification automatically flags discrepancies for manual review. Always check the preview before exporting.",
  },
  {
    question: "What is the maximum file size?",
    answer:
      "Files up to 20 MB are supported, which typically covers 1–50 page statements. For larger files, split the PDF into smaller segments or contact support.",
  },
  {
    question: "Will the Excel file keep the correct column structure?",
    answer:
      "Yes. Output columns are Date, Description, Debit, Credit, and Balance — clean, properly formatted, with no merged cells. The file is ready for analysis or direct import into accounting software.",
  },
  {
    question: "Can I convert credit card statements to Excel?",
    answer:
      "Yes. The converter works with credit card statements from all major issuers including Chase, Citi, American Express, Capital One, HDFC, ICICI, and SBI. The process is identical to bank statement conversion.",
  },
  {
    question: "Does Adobe Acrobat convert bank statements to Excel well?",
    answer:
      "Adobe Acrobat can export PDFs to Excel, but it often produces merged cells, misaligned columns, and formatting issues — especially with multi-page bank statements. This converter is purpose-built for bank statement extraction and produces clean, analysis-ready spreadsheets.",
  },
  {
    question: "Can ChatGPT convert a bank statement to Excel?",
    answer:
      "ChatGPT can process small PDFs but has meaningful limitations: file-size restrictions, no image reading on free plans, silent truncation on long documents, and no balance verification. This converter is purpose-built for bank statements with higher accuracy and a 20 MB file-size limit.",
  },
  {
    question: "What is the difference between CSV and Excel formats?",
    answer:
      "Excel (.xlsx) preserves formatting, supports formulas and multiple sheets, and is best for analysis and reporting. CSV is plain text, universally compatible with accounting software like QuickBooks and Xero, and has smaller file sizes. Both formats contain identical transaction data — choose based on your use case.",
  },
  {
    question: "How do I import bank statements into QuickBooks?",
    answer:
      "Export your statement as CSV from this converter. In QuickBooks: go to Banking → Upload transactions → select your CSV file → map columns (Date, Description, Amount) → review and import. The CSV format is pre-optimized for QuickBooks with proper date and number formatting.",
  },
  {
    question: "Can I convert multiple months of statements at once?",
    answer:
      "Yes. Upload multiple PDF files (up to 20 MB total) and the converter will process them all. Export as a single consolidated Excel file with all months combined, or download separate files per month — useful for mortgage applications that require 2–6 months of statements.",
  },
  {
    question: "Why does my converted Excel file have merged cells?",
    answer:
      "Merged cells occur when a generic PDF converter is used instead of a bank-statement-specific tool. This converter never produces merged cells — all columns are properly separated and ready for formulas, pivot tables, and accounting software import.",
  },
  {
    question: "Do I need to create an account or sign up?",
    answer:
      "No. The converter is completely free to use with no signup required. No email address, no password, no credit card. Upload your statement and start converting immediately.",
  },
];

/* ─── How-It-Works steps (4 steps) ─────────────────────────────────────────── */
const homeSteps = [
  {
    icon: CloudUpload,
    title: "Upload Your Bank Statement PDF",
    description:
      "Drag and drop or click to upload. Supports text-based PDFs, scanned PDFs, and image files (JPG, PNG). Maximum file size 20 MB. Works with 1–50 page statements from any bank.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: ScanLine,
    title: "AI Extracts Transactions Instantly",
    description:
      "Advanced OCR reads text and scanned documents. Identifies Date, Description, Debit, Credit, and Balance columns automatically. Handles 350+ bank formats. Processing takes 5–30 seconds.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: PencilLine,
    title: "Preview & Edit in Live Spreadsheet",
    description:
      "See extracted data in a real-time editable table. Fix any errors before exporting — add, delete, or modify transactions. No other converter offers this live editing step.",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    icon: Download,
    title: "Export to Excel or CSV",
    description:
      "Download as .xlsx or .csv. Clean columns, no merged cells, ready for QuickBooks, Xero, or manual analysis. Perfect for bookkeeping, tax filing, and loan applications.",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

/* ─── JSON-LD schema ────────────────────────────────────────────────────────── */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert a Bank Statement PDF to Excel",
  description:
    "Convert any bank statement PDF into a clean, editable Excel or CSV file in four steps using StatementToExcel.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload your bank statement PDF",
      text: "Drag and drop or click to upload your PDF — supports text-based, scanned, and image-based statements up to 20 MB.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "AI extracts transactions",
      text: "The AI and OCR engine identifies Date, Description, Debit, Credit, and Balance columns across 350+ bank formats in 5–30 seconds.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Preview and edit in a live spreadsheet",
      text: "Review extracted transactions in a real-time editable table and correct any errors before exporting.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Export to Excel or CSV",
      text: "Download a clean .xlsx or .csv file ready for QuickBooks, Xero, bookkeeping, tax filing, or loan applications.",
    },
  ],
};

/* ─── Supported banks data ──────────────────────────────────────────────────── */
const allBanks = [
  // Indian
  "HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Kotak Mahindra",
  "IDFC First", "IndusInd Bank", "Yes Bank", "Punjab National Bank",
  "Bank of Baroda", "Canara Bank", "Union Bank", "Bank of India",
  "Central Bank", "UCO Bank", "IDBI Bank", "Federal Bank", "RBL Bank",
  "South Indian Bank", "Karur Vysya", "Standard Chartered India",
  "Citibank India", "HSBC India", "DBS India", "Paytm Bank",
  // US
  "Chase", "Wells Fargo", "Bank of America", "Citibank", "US Bank",
  "PNC Bank", "Capital One", "TD Bank", "Truist", "Fifth Third",
  "Regions Bank", "Huntington", "KeyBank", "M&T Bank", "Citizens Bank",
  "Santander US", "BMO Harris", "Ally Bank", "Discover Bank",
  "American Express",
  // UK
  "Barclays", "HSBC UK", "Lloyds Bank", "NatWest", "Santander UK",
  "Royal Bank of Scotland", "Halifax", "Starling Bank", "Monzo",
  "Revolut", "Nationwide", "Metro Bank",
  // APAC / Other
  "DBS Singapore", "OCBC", "UOB", "Maybank", "CIMB", "BCA Indonesia",
  "BDO Philippines", "ANZ Australia", "Commonwealth Bank", "NAB",
  "Westpac", "RBC Canada", "TD Canada", "Scotiabank",
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Schema markup */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <Navbar />

      {/* ── Hero ── */}
      <Hero
        badgeText="Trusted by accountants, CFOs, and small business owners"
        headline={
          <>
            Convert Bank Statements to{" "}
            <span className="gradient-text">Editable Excel</span> — Preview,
            Edit &amp; Export Instantly
          </>
        }
        subheadline="Upload any bank PDF. See your transactions in a live editable spreadsheet. Export to Excel or CSV in one click."
        ctaText="Upload Bank Statement PDF"
        ctaSecondaryText="How it works"
        trustBadges={[
          "No signup required",
          "SSL encrypted",
          "Files deleted within 1 hour",
          "99%+ accuracy",
        ]}
        ctaLink="/app"
      />

      {/* ── Video Demo ── */}
      <VideoDemo />

      {/* ── How It Works (4 steps) ── */}
      <HowItWorks
        title="How It Works"
        subtitle="Four simple steps to turn any bank statement PDF into a clean, analysis-ready spreadsheet"
        steps={homeSteps}
      />

      {/* ── Why Choose section ── */}
      <section className="py-24 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              Built for professionals
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Accountants &amp; Business Owners Trust This Converter
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Most converters dump raw text and leave you to clean it up. This
              tool extracts, validates, and lets you edit — before you ever
              download a file.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                color: "bg-violet-50 text-violet-600",
                title: "Live Editable Preview",
                body: "The only converter that lets you preview and edit every transaction before exporting. Fix OCR errors instantly without re-uploading. Save hours of manual cleanup.",
              },
              {
                icon: CheckCircle2,
                color: "bg-emerald-50 text-emerald-600",
                title: "99%+ Accuracy with Balance Verification",
                body: "AI validates opening and closing balances and flags discrepancies for manual review. Handles 350+ bank formats automatically — including multi-column and wrapped descriptions.",
              },
              {
                icon: ScanLine,
                color: "bg-blue-50 text-blue-600",
                title: "Works with Scanned & Image PDFs",
                body: "Advanced OCR reads scanned statements and image-based PDFs. Handles low-quality scans (300+ DPI recommended). Supports JPG and PNG in addition to PDF.",
              },
              {
                icon: Zap,
                color: "bg-amber-50 text-amber-600",
                title: "No Signup Required",
                body: "Start converting immediately. No email, no credit card, no registration. The preview is completely free — pay only when you download.",
              },
              {
                icon: Lock,
                color: "bg-rose-50 text-rose-600",
                title: "Secure & Private",
                body: "256-bit SSL encryption on every upload. Files deleted from servers within 1 hour. Never used for training or shared with third parties.",
              },
              {
                icon: FileText,
                color: "bg-teal-50 text-teal-600",
                title: "Ready for Accounting Software",
                body: "Clean CSV for QuickBooks, Xero, and Tally imports. No merged cells, no formatting issues. Proper date and number formatting out of the box.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.color}`}
                >
                  <card.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-7">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases section ── */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
              Who uses it
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Perfect For
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From individual freelancers to accounting firms — one tool that fits
              every financial workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "🧾",
                title: "Tax Preparation",
                points: [
                  "Self-employed contractors (1099)",
                  "Small business owners",
                  "Freelancers tracking income and expenses",
                  "Year-end tax filing documentation",
                ],
              },
              {
                emoji: "🏠",
                title: "Mortgage & Loan Applications",
                points: [
                  "Lenders require 2–6 months of statements",
                  "Convert to Excel for affordability analysis",
                  "Clean format for underwriting teams",
                  "Faster approval process",
                ],
              },
              {
                emoji: "📒",
                title: "Bookkeeping & Reconciliation",
                points: [
                  "Monthly bank reconciliation",
                  "Match transactions to invoices",
                  "Direct import to QuickBooks or Xero",
                  "Save hours of manual data entry",
                ],
              },
              {
                emoji: "📊",
                title: "Financial Analysis",
                points: [
                  "Cash flow tracking",
                  "Expense categorization",
                  "Budget planning",
                  "Profit and loss analysis",
                ],
              },
              {
                emoji: "🔍",
                title: "Audit & Compliance",
                points: [
                  "Audit trail documentation",
                  "Regulatory compliance records",
                  "Legal dispute evidence",
                  "Immigration asset proof",
                ],
              },
              {
                emoji: "👥",
                title: "Accounting Professionals",
                points: [
                  "Serve multiple clients efficiently",
                  "Batch-process statements",
                  "Standardized output format",
                  "Reduce manual data entry errors",
                ],
              },
            ].map((uc) => (
              <div
                key={uc.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-3xl mb-3">{uc.emoji}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {uc.title}
                </h3>
                <ul className="space-y-1.5">
                  {uc.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-sm text-slate-600">
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported Banks (expanded) ── */}
      <BanksList
        title="Works with All Major Banks — 350+ Supported"
        subtitle="Our AI automatically detects and parses statements from 350+ banks across 50+ countries. If your bank isn't listed below, it still likely works — upload your statement to test."
        banks={allBanks}
        moreText="+ 300 more supported"
      />

      {/* ── CSV vs Excel guide ── */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Excel (.xlsx) vs CSV — Which Should You Choose?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Both formats contain identical transaction data. The difference is
              in formatting and compatibility, not accuracy.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left p-4 font-semibold rounded-tl-2xl">Feature</th>
                  <th className="text-left p-4 font-semibold">Excel (.xlsx)</th>
                  <th className="text-left p-4 font-semibold rounded-tr-2xl">CSV</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Best for", "Analysis, reporting, formatting", "QuickBooks / Xero import, simple data"],
                  ["Formatting", "Preserves colors, fonts, formulas", "Plain text only"],
                  ["File size", "Larger", "Smaller"],
                  ["Compatibility", "Excel, Google Sheets, LibreOffice", "All spreadsheet and accounting apps"],
                  ["Multiple sheets", "Yes", "No — single sheet only"],
                  ["Formulas", "Yes", "No"],
                  ["Import to QuickBooks", "Manual import required", "Direct import supported"],
                  ["Import to Xero", "Manual import required", "Direct import supported"],
                ].map(([feature, excel, csv], i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-4 font-medium text-slate-700 border-b border-slate-100">{feature}</td>
                    <td className="p-4 text-slate-600 border-b border-slate-100">{excel}</td>
                    <td className="p-4 text-slate-600 border-b border-slate-100">{csv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="font-bold text-slate-900 mb-2">Choose Excel if…</p>
              <p className="text-sm text-slate-600">
                You need to analyze data, create charts, apply formulas, or share
                formatted reports with stakeholders.
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
              <p className="font-bold text-slate-900 mb-2">Choose CSV if…</p>
              <p className="text-sm text-slate-600">
                You are importing to accounting software (QuickBooks, Xero,
                Tally), need the smallest file size, or want maximum
                compatibility with any tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & Privacy ── */}
      <section className="py-24 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
              Privacy first
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Your Data Is Safe With Us
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We take your financial data security seriously. Here is exactly
              how we protect your bank statements.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                color: "bg-rose-50 text-rose-600",
                title: "256-bit SSL Encryption",
                body: "All file uploads are encrypted in transit using industry-standard SSL/TLS encryption. Your data never travels over an unencrypted connection.",
              },
              {
                icon: Shield,
                color: "bg-emerald-50 text-emerald-600",
                title: "Automatic File Deletion",
                body: "All uploaded files are automatically deleted from our servers within 1 hour. No permanent storage, no backups, no archives. You can request immediate deletion via support if needed.",
              },
              {
                icon: Users,
                color: "bg-blue-50 text-blue-600",
                title: "Never Used for Training",
                body: "Your bank statements are never used to train AI models, never shared with third parties, and never subject to analytics or tracking on file contents.",
              },
              {
                icon: FileText,
                color: "bg-violet-50 text-violet-600",
                title: "GDPR Compliant",
                body: "We comply with EU General Data Protection Regulation. You have the right to access, correct, or delete your data at any time. Privacy policy available at /privacy.",
              },
              {
                icon: CheckCircle2,
                color: "bg-teal-50 text-teal-600",
                title: "Isolated Server Processing",
                body: "Files are processed on isolated, secure servers. No human has routine access to uploaded documents. Regular security audits are conducted.",
              },
              {
                icon: Zap,
                color: "bg-amber-50 text-amber-600",
                title: "No Account Required",
                body: "No email address needed, no password to remember, no risk of account breaches. Upload and convert without creating a profile.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.color}`}
                >
                  <card.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-7">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accuracy & Balance Verification ── */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How We Ensure 99%+ Accuracy
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              This converter does not just extract text — it validates your data
              to catch errors before you download.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Balance Verification",
                body: "The AI calculates a running balance from extracted transactions and compares it against the statement's reported balance. Discrepancies are flagged for manual review.",
              },
              {
                title: "Intelligent Column Detection",
                body: "Date, Description, Debit, Credit, and Balance columns are identified automatically across different bank layouts, including wrapped multi-line descriptions.",
              },
              {
                title: "Date Format Normalization",
                body: "All dates are converted to a standard format. Handles Jan 15 2026, 15/01/2026, and 01-15-2026 interchangeably and preserves the year in the output.",
              },
              {
                title: "Number Parsing",
                body: "Correctly handles negative numbers in brackets — (1,234.56) — CR credit markers, decimal places, currency symbols, and thousands separators.",
              },
              {
                title: "Multi-Page Handling",
                body: "Transactions from all pages are combined seamlessly in chronological order. No duplicate or missing entries, even in 50-page statements.",
              },
              {
                title: "Error Flagging",
                body: "Rows with potential OCR issues are highlighted in the preview. Review and correct them before exporting — no other free tool offers this step.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-7">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            Accuracy rate: 99%+ on text-based PDFs · 95%+ on scanned statements
            at 300+ DPI. Always compare the preview with your original statement
            before exporting.
          </p>
        </div>
      </section>

      {/* ── OCR Technology ── */}
      <section className="py-24 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Advanced OCR for Scanned Statements
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Unlike basic converters that only work with text-based PDFs, this
              tool uses Optical Character Recognition to handle scanned and
              image-based statements.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-slate-900 mb-4">
                When you need OCR
              </h3>
              <ul className="space-y-3">
                {[
                  "Bank statement is a scanned PDF (no selectable text)",
                  "You have a photo of a printed statement (JPG, PNG)",
                  "Statement is from an older bank system with image-only output",
                  "PDF was created by scanning paper documents",
                ].map((pt) => (
                  <li key={pt} className="flex gap-2 text-sm text-slate-600">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-500 flex-shrink-0 mt-0.5"
                    />
                    {pt}
                  </li>
                ))}
              </ul>

              <h3 className="font-bold text-slate-900 mt-8 mb-4">
                OCR accuracy tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Scan at 300+ DPI for best results</li>
                <li>Ensure good lighting and minimal shadows</li>
                <li>Keep the document flat and straight</li>
                <li>Use PDF format when possible — smaller file, faster processing</li>
                <li>Avoid photos of phone screens (moiré patterns reduce accuracy)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-4">
                Supported formats
              </h3>
              <div className="space-y-3">
                {[
                  { fmt: "PDF (text-based)", note: "5–10 seconds — most accurate" },
                  { fmt: "PDF (scanned / image)", note: "15–30 seconds — OCR applied" },
                  { fmt: "JPG / JPEG", note: "OCR applied automatically" },
                  { fmt: "PNG", note: "OCR applied automatically" },
                  { fmt: "Multi-page PDF", note: "30–60 seconds for large files" },
                ].map((f) => (
                  <div
                    key={f.fmt}
                    className="flex justify-between items-center bg-slate-50 rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <span className="font-medium text-slate-800 text-sm">
                      {f.fmt}
                    </span>
                    <span className="text-xs text-slate-500">{f.note}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Limitations</p>
                <p>
                  Handwritten statements are not supported. Very low-quality
                  scans (&lt;150 DPI) may have reduced accuracy. Non-Latin
                  scripts (Hindi, Arabic, Chinese) have limited support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── FAQ ── */}
      <FaqSection
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about converting bank statement PDFs to Excel or CSV."
        items={homeFaqs}
        variant="cards"
      />

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to Convert Your Bank Statement?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Upload your bank statement PDF now — no signup required. Join
            10,000+ accountants and business owners converting statements daily.
          </p>
          <Link
            href="/app"
            className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
          >
            Upload Bank Statement PDF
            <ArrowRight size={18} />
          </Link>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-500">
            {["Free", "Secure", "No Signup", "99%+ Accuracy"].map((badge) => (
              <span key={badge} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PseoLinks />
      <section className="border-t border-slate-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            Use StatementToExcel in your language
          </h2>
          <p className="mx-auto mb-7 max-w-2xl text-slate-600">
            Explore our bank statement converter pages in Spanish and Portuguese.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/es/bancos"
              className="rounded-full border border-slate-200 bg-slate-50 px-6 py-3 font-medium text-slate-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              Conversor de extractos bancarios en español
            </Link>
            <Link
              href="/pt-br/bancos"
              className="rounded-full border border-slate-200 bg-slate-50 px-6 py-3 font-medium text-slate-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              Conversor de extratos bancários em português
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
