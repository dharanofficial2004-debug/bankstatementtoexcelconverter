import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Bank Statement Converter USA to Excel",
  description:
    "Convert US bank and credit card statement PDFs to Excel or CSV online. Review transactions, organize financial data, and download your spreadsheet free.",
  alternates: {
    canonical:
      "https://bankstatementtoexcelconverter.com/banks/us/free-bank-statement-converter-usa",
  },
};

const comparisons = [
  { feature: "Free preview of all transactions", us: true, others: false },
  { feature: "AI-powered — works with any bank format", us: true, others: false },
  { feature: "No signup for preview", us: true, others: false },
  { feature: "Edit before downloading", us: true, others: false },
  { feature: "Export to Excel, CSV, and JSON", us: true, others: false },
  { feature: "Works with US bank PDFs (Chase, BofA, WF)", us: true, others: false },
  { feature: "Monthly subscription required", us: false, others: true },
  { feature: "Pay-per-document from $1", us: true, others: false },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 border border-emerald-200 rounded-full text-sm text-emerald-800 font-semibold mb-6">
            ✅ Free Preview — No Credit Card
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5">
            Free Bank Statement Converter USA
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Upload your Chase, Bank of America, or Wells Fargo PDF and preview every transaction for free. No account needed. Pay only when you&apos;re ready to download — starting at $1.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            Try Free Now <ArrowRight size={17} />
          </Link>
          <p className="text-slate-400 text-sm mt-3">
            Free preview · Download from $1 · No subscription
          </p>
        </div>
      </section>

      {/* What's free vs paid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            What&apos;s Free vs Paid
          </h2>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-semibold px-6 py-3">
              <div>Feature</div>
              <div className="text-center text-emerald-400">Our Tool</div>
              <div className="text-center text-slate-400">Others</div>
            </div>
            {comparisons.map((c, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-6 py-3.5 border-b border-slate-200 text-sm ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50"
                }`}
              >
                <div className="text-slate-700">{c.feature}</div>
                <div className="flex justify-center">
                  {c.us ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                </div>
                <div className="flex justify-center">
                  {c.others ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-8">
            Why Trust Us With Your Bank Data?
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                emoji: "🔒",
                title: "No data stored",
                body: "Your PDF is deleted immediately after processing. We never retain or analyze your financial data.",
              },
              {
                emoji: "🚫",
                title: "No third parties",
                body: "We don't share your data with advertisers, data brokers, or any third-party services.",
              },
              {
                emoji: "🇺🇸",
                title: "US-focused tool",
                body: "Built specifically for American bank statement formats — not a generic international tool.",
              },
            ].map((t) => (
              <div
                key={t.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="text-3xl mb-3">{t.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{t.title}</h3>
                <p className="text-sm text-slate-500">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convert Bank Statements to Excel or CSV */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Convert Bank Statements to Excel or CSV
          </h2>
          <p className="text-slate-600 text-lg mb-6">
            Managing financial records from PDF files can be slow, especially when you need to review hundreds of transactions, categorize expenses, or prepare data for accounting software. This free bank statement converter turns an unstructured PDF into an organized spreadsheet you can sort, filter, and analyze immediately.
          </p>
          <p className="text-slate-600 mb-6">
            The tool works for both bank statements and credit card statements. Whether your document comes from a US bank, credit union, or major card issuer, converting it to a spreadsheet eliminates manual data entry and reduces repetitive work.
          </p>
          <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
            Before using any converted file for tax, legal, lending, or regulatory purposes, review the output carefully against the original statement. PDF layouts vary between institutions, and financial data should always be verified before being imported into another system.
          </p>
        </div>
      </section>

      {/* Why convert */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Why Convert a Bank Statement to Excel?
          </h2>
          <p className="text-slate-600 mb-8">
            A PDF is convenient for viewing and printing, but it is not built for analysis. A spreadsheet gives you structured rows and columns that can be sorted, filtered, labeled, and calculated.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Easier transaction analysis",
                body: "Sort by date, amount, or merchant. Filter for specific vendors or expense types. Create pivot tables to summarize spending by category or month.",
              },
              {
                title: "Faster bookkeeping and reconciliation",
                body: "Match transactions against your accounting ledger without retyping every row. Flag discrepancies and track running balances in the same worksheet.",
              },
              {
                title: "Better financial recordkeeping",
                body: "Add category, client, or tax-deductible columns. Archive converted statements alongside your accounting records for easy retrieval.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600">
            Common reasons to extract transactions from a PDF include reviewing deposits, withdrawals, transfers, and fees; comparing activity across multiple months; preparing information for an accountant; and creating cash-flow reports.
          </p>
        </div>
      </section>

      {/* How to convert PDF bank statement */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            How to Convert a PDF Bank Statement to Excel
          </h2>
          <p className="text-slate-600 mb-8">
            For best results, download the original statement directly from your bank&apos;s online portal rather than using a screenshot. A digitally generated PDF contains clearer text and table data than a low-resolution image.
          </p>
          <ol className="space-y-4">
            {[
              {
                n: "1",
                title: "Download the statement PDF",
                body: "Sign in to your bank's online portal and download the monthly or billing-period statement you need.",
              },
              {
                n: "2",
                title: "Upload to the converter",
                body: "Use the upload form on this page. The tool processes the transaction table automatically.",
              },
              {
                n: "3",
                title: "Preview your transactions",
                body: "Review extracted rows in the editable preview. Check that dates, descriptions, debits, credits, and balances look correct.",
              },
              {
                n: "4",
                title: "Choose your output format",
                body: "Select Excel (XLSX) for analysis and manual review, or CSV for importing into accounting software.",
              },
              {
                n: "5",
                title: "Download and verify",
                body: "Save the file. Compare opening balance, closing balance, deposits, and withdrawals with the original PDF before using the data.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="flex gap-4 bg-slate-50 rounded-2xl border border-slate-100 p-5"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                  {step.n}
                </span>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{step.title}</p>
                  <p className="text-slate-600 text-sm">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-slate-600 mt-6 text-sm">
            If the PDF is scanned or image-based, the converter uses optical character recognition (OCR) to identify dates, descriptions, and amounts. Pay particular attention to decimal points, minus signs, and multi-line descriptions when checking the output.
          </p>
        </div>
      </section>

      {/* Credit card statement */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            How to Convert a Credit Card Statement to Excel
          </h2>
          <p className="text-slate-600 mb-6">
            A credit card statement shares many fields with a bank statement but may also include purchases, payments, refunds, credits, annual fees, interest charges, cash advances, and reward activity. The general process is the same:
          </p>
          <ol className="space-y-3 mb-6">
            {[
              "Sign in to your card issuer's website and download the billing statement as a PDF.",
              "Upload the PDF using the form on this page.",
              "Select Excel or CSV as the output format.",
              "Download the file and open it in Excel or Google Sheets.",
              "Verify purchases, payments, credits, fees, and the statement balance against the original.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-600 text-sm">{step}</p>
              </li>
            ))}
          </ol>
          <p className="text-slate-600 text-sm bg-white border border-slate-100 rounded-xl p-4">
            Some issuers display credits as negative numbers; others use separate debit and credit columns. You may need to standardize merchant names or separate transaction categories before importing the file into your bookkeeping system. This approach may work for statements from Chase, American Express, Citi, Capital One, Discover, and other US issuers, although layouts vary between institutions.
          </p>
        </div>
      </section>

      {/* PDF to CSV */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Convert PDF Bank Statements to CSV
          </h2>
          <p className="text-slate-600 mb-6">
            CSV (Comma-Separated Values) is a practical format when you need to move transaction data between different applications. Unlike an Excel workbook, a CSV file contains a single plain-text table that most accounting and budgeting tools can read directly.
          </p>
          <p className="text-slate-600 mb-6">You may prefer CSV when you need to:</p>
          <ul className="space-y-2 mb-6">
            {[
              "Import transactions into accounting or budgeting software.",
              "Upload data to a database or custom application.",
              "Process statements with scripts or automation tools.",
              "Combine records from multiple months or accounts.",
              "Avoid spreadsheet-specific formatting.",
            ].map((item) => (
              <li key={item} className="flex gap-2 items-start text-slate-600 text-sm">
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-600 text-sm">
            A typical converted CSV may include transaction date, posting date, description or merchant, reference number, debit, credit, amount, and running balance. Always inspect the first several rows before importing to confirm that commas inside merchant names have not shifted columns and that currency values and dates are formatted correctly.
          </p>
        </div>
      </section>

      {/* Bank vs credit card comparison */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Bank Statements vs. Credit Card Statements
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left p-4 rounded-tl-xl font-semibold">Area</th>
                  <th className="text-left p-4 font-semibold">Bank Statement</th>
                  <th className="text-left p-4 rounded-tr-xl font-semibold">Credit Card Statement</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Main activity", "Deposits, withdrawals, checks, transfers, fees", "Purchases, payments, refunds, interest, card fees"],
                  ["Balance meaning", "Available or ledger balance shown by the bank", "Amount owed for the billing period"],
                  ["Common use", "Reconciliation, cash flow, income tracking", "Expense analysis, card reconciliation, payment tracking"],
                  ["Frequent fields", "Date, description, debit, credit, balance", "Transaction date, merchant, amount, payment, credits"],
                  ["Review priority", "Opening balance, deposits, withdrawals, closing balance", "Purchases, credits, payments, interest, statement balance"],
                ].map(([area, bank, card], i) => (
                  <tr key={area} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-4 font-medium text-slate-700 border-b border-slate-100">{area}</td>
                    <td className="p-4 text-slate-600 border-b border-slate-100">{bank}</td>
                    <td className="p-4 text-slate-600 border-b border-slate-100">{card}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Both document types contain sensitive personal and financial information. Use the original PDF as the source of truth and verify the exported spreadsheet before relying on it for financial decisions.
          </p>
        </div>
      </section>

      {/* Free vs paid */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Free vs. Paid Bank Statement Converters
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Free converter</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Suitable for occasional conversions</li>
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Works for personal budgeting and one-off bookkeeping</li>
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> No signup or subscription needed for preview</li>
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Pay-per-document from $1 when ready to download</li>
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">When paid plans add value</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Processing statements regularly or for multiple clients</li>
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Batch conversion of high-volume PDFs</li>
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Advanced OCR for scanned documents</li>
                <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> Higher page limits and larger file sizes</li>
              </ul>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            When comparing tools, evaluate supported PDF types, OCR capability, export formats (Excel, CSV, QBO, QFX, OFX), page limits, batch processing, data deletion practices, and pricing terms. Do not choose a converter based only on accuracy claims — financial documents should always be reviewed after extraction.
          </p>
        </div>
      </section>

      {/* Supported formats */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Supported File Formats</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { format: "PDF (digital)", desc: "Statements downloaded directly from your bank's online portal. Clean text-based PDFs produce the most accurate extraction results." },
              { format: "PDF (scanned)", desc: "Image-based or photographed statements processed with OCR. Review dates, amounts, decimal points, and merchant names carefully in the output." },
              { format: "XLSX (Excel)", desc: "Full workbook output with formatted columns. Best for manual review, formulas, filtering, pivot tables, and sharing with an accountant." },
              { format: "CSV", desc: "Plain-text output for importing into accounting systems, databases, and automation workflows. Compatible with QuickBooks, Xero, Google Sheets, and most finance tools." },
            ].map((item) => (
              <div key={item.format} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <p className="text-lg font-bold text-emerald-700 mb-2">{item.format}</p>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security and privacy */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Security and Privacy</h2>
          <p className="text-slate-600 mb-6">
            Bank statements contain private information including account numbers, transaction descriptions, addresses, and balances. Here is how this tool handles your data:
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Files are uploaded over an encrypted connection.",
              "Uploaded PDFs and converted files are deleted after processing — they are not retained on our servers.",
              "Your documents are not used to train models or improve services.",
              "No employee or third party has routine access to your uploaded files.",
            ].map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-600 text-sm">{item}</p>
              </li>
            ))}
          </ul>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
            Review the converter&apos;s privacy policy before uploading financial documents. After downloading the converted file, store it securely and delete temporary copies from shared devices.
          </div>
        </div>
      </section>

      {/* Step-by-step tutorial */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Step-by-Step Tutorial</h2>
          <ol className="space-y-4">
            {[
              { title: "Find the correct statement", body: "Download the billing period or monthly statement you need from your bank or card issuer's online portal." },
              { title: "Check the PDF", body: "Confirm it includes the complete transaction period and all pages. Multi-page statements are supported." },
              { title: "Upload the document", body: "Use the upload form on this page. No signup is required to preview your transactions." },
              { title: "Choose the output", body: "Select Excel when you need a workbook for analysis, or CSV when importing into accounting software." },
              { title: "Download the result", body: "Save the converted file with a clear name, such as Chase_Checking_January_2026.xlsx." },
              { title: "Verify the totals", body: "Compare opening balance, closing balance, deposits, withdrawals, payments, and credits with the PDF." },
              { title: "Clean the worksheet", body: "Standardize dates, format currency values, remove blank rows, and add categories if needed." },
              { title: "Protect the file", body: "Store it in a secure location. Avoid sending unencrypted financial data by email." },
            ].map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-900 mb-1">{step.title}</p>
                  <p className="text-slate-600 text-sm">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Common use cases */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Common Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Accountants",
                body: "Convert client statements into structured data for reconciliation, transaction review, cash-flow analysis, and supporting schedules. Keep the converted spreadsheet linked to the original PDF so unusual entries can be investigated.",
              },
              {
                title: "Bookkeepers",
                body: "Process recurring monthly statements without manual entry. Excel and CSV output reduces typing and makes it easier to categorize transactions before importing into a bookkeeping workflow.",
              },
              {
                title: "Small businesses",
                body: "Review operating expenses, vendor payments, deposits, recurring charges, and cash movement. Create separate worksheets for each account or month to keep records organized.",
              },
              {
                title: "Freelancers and contractors",
                body: "Track client payments, software subscriptions, travel costs, equipment purchases, and estimated tax expenses. Keep personal and business transactions in separate files.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "How do I convert a credit card statement to Excel?",
                a: "Download the statement PDF from your card issuer, upload it to the converter, select Excel output, download the file, and verify transactions, payments, credits, fees, and balances against the original.",
              },
              {
                q: "Can I convert a bank statement to Excel?",
                a: "Yes. A PDF bank statement can be converted into a spreadsheet when the document contains readable transaction data. Check the exported rows and totals before using the file.",
              },
              {
                q: "Can I convert a 500-page PDF to Excel online?",
                a: "Possibly, but results depend on the converter's file-size and page limits. Large statements may need to be split into smaller files or processed in batches. Review every output segment rather than assuming a long document was extracted perfectly.",
              },
              {
                q: "Can I convert a PDF bank statement to CSV?",
                a: "Yes. CSV is available as an output option and is useful for importing transactions into accounting systems, databases, budgeting tools, and custom applications.",
              },
              {
                q: "What is a bank statement converter?",
                a: "A bank statement converter is a tool that extracts transaction information from a bank statement PDF and turns it into a structured format such as Excel or CSV.",
              },
              {
                q: "Is a free bank statement converter safe?",
                a: "Safety depends on the converter's privacy, security, storage, and deletion practices. Review the privacy policy and avoid uploading documents when data-handling terms are unclear.",
              },
              {
                q: "Can I convert a scanned bank statement?",
                a: "A scanned statement may require OCR. Results should be reviewed carefully because image quality can affect dates, amounts, symbols, and merchant descriptions.",
              },
              {
                q: "Can I convert a password-protected PDF?",
                a: "Some converters support password-protected files, while others require you to unlock the PDF first. Never share a PDF password with an untrusted service.",
              },
              {
                q: "Is Excel better than CSV for bank transactions?",
                a: "Excel is better for formulas, formatting, multiple worksheets, and manual review. CSV is often better for imports, automation, and database processing.",
              },
              {
                q: "Do I need Microsoft Excel to open the converted file?",
                a: "No. You can open XLSX files with Google Sheets, LibreOffice Calc, or Apple Numbers. CSV files are compatible with almost any spreadsheet or data tool.",
              },
              {
                q: "Should I verify the converted statement?",
                a: "Yes. Always compare transaction counts, balances, deposits, withdrawals, payments, credits, and totals with the original PDF before using the spreadsheet for financial decisions.",
              },
              {
                q: "Can I convert statements from Chase or American Express?",
                a: "Many US issuer statements can be processed, but results depend on the exact PDF layout and whether the file is text-based or scanned. Always verify the output against the original.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Related Financial Tools</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "US bank statement converter", href: "/banks/us", desc: "Overview of all US bank statement conversion tools." },
              { title: "Bank statement PDF to CSV", href: "/bank-statement-to-csv", desc: "Export your bank statement directly to CSV format." },
              { title: "PDF to Excel converter", href: "/bank-statement-pdf-to-excel-converter", desc: "General-purpose PDF bank statement to Excel tool." },
              { title: "Bank statement to Excel", href: "/bank-statement-to-excel", desc: "Convert any bank statement PDF into an Excel workbook." },
            ].map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="block bg-slate-50 rounded-2xl border border-slate-100 p-5 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 group"
              >
                <p className="font-bold text-slate-900 group-hover:text-emerald-700 mb-1">
                  {link.title}
                </p>
                <p className="text-slate-600 text-sm">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Convert Your Statement Now</h2>
          <p className="text-slate-600 mb-8">
            Need a spreadsheet instead of a PDF? Upload your US bank statement or credit card statement, choose Excel or CSV, and download the converted file. Review the output against the original before using it for accounting, tax, or financial reporting.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            Try Free Now <ArrowRight size={17} />
          </Link>
          <p className="text-slate-400 text-sm mt-3">
            Free preview · Download from $1 · No subscription
          </p>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
