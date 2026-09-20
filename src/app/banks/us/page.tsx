import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ChevronDown, FileSpreadsheet, FileText, Upload, ScanLine, Download, BookOpen, Receipt, BriefcaseBusiness, ChartNoAxesCombined, Users, ArrowLeftRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { usBanks } from "@/lib/usBanks";
import { LIFETIME_PRICE_USD, PER_CONVERSION_PRICE_INR, PER_CONVERSION_PRICE_USD, formatUSD } from "@/lib/pricing";

const pageUrl = "https://www.bankstatementtoexcelconverter.com/banks/us";
const title = "US Bank Statement to Excel Converter | Excel & CSV";
const description = "Convert Chase, Bank of America, Wells Fargo and other US bank statement PDFs to Excel or CSV. Preview and edit transactions. First conversion free.";
const handlingGuide = "/blog/secure-bank-statement-pdf-converter";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: pageUrl, siteName: "StatementToExcel", locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const featuredBanks = ["chase-bank", "bank-of-america", "wells-fargo", "citibank", "us-bank", "truist-bank"];
const steps = [
  { title: "Upload a PDF bank statement", text: "Choose the statement saved from your bank, ideally with selectable text. Start with one account and one statement period so the results are easy to check. You do not need to connect your bank account or provide online banking credentials." },
  { title: "Review the extracted transactions", text: "The converter organizes the extracted data into an editable preview. Compare dates, descriptions, amounts, and balances with the PDF. Correct mistakes, remove repeated headers or summary rows, and check that transactions continue across page breaks." },
  { title: "Export the corrected spreadsheet", text: "Choose Excel for a workbook or CSV for a transaction table. Sign in when prompted to download. Open the saved file and check its first and last rows before sharing it or preparing an accounting import." },
];

const fields = [
  { title: "Dates and statement periods", text: "US statements often use MM/DD/YYYY. Confirm that May 6 was not interpreted as June 5, especially when a statement omits the year. The preview may show ISO-style dates instead. Check December-to-January statements carefully and distinguish posted dates from purchase dates." },
  { title: "ACH, card purchases, and checks", text: "Descriptions can contain ACH company names, payment references, card merchant locations, or check numbers. Keep these details when reviewing similar payments. A check-number column appears in the export when values were extracted; it is not guaranteed for every layout." },
  { title: "Deposits, withdrawals, and signs", text: "The output separates debit and credit amounts. For a checking account, review withdrawals as money out and deposits as money in. Refunds, reversals, overdrafts, and negative amounts need particular attention: a transaction label alone does not establish its direction." },
  { title: "Balances and account sections", text: "Running balances help you check transaction order, but some statements show only opening and closing balances. Do not treat an empty balance as zero. Personal and business checking layouts can be attempted; combined-account statements need separate account-by-account review." },
];

const useCases = [
  { title: "Monthly bookkeeping", text: "Sort the reviewed transactions by date and compare them with your ledger. Use descriptions and check numbers to investigate unmatched payments. Keep the original statement beside the workbook so an adjustment can be traced to its source." },
  { title: "Tax preparation", text: "Organize deposits and expenses for your tax preparer. Separate transfers, refunds, and other items requiring explanation; a bank description does not establish tax treatment. Keep receipts and supporting records alongside the spreadsheet rather than treating extraction as tax classification." },
  { title: "Expense reporting", text: "Filter a reviewed statement to find travel, supplies, or recurring charges, then match the entries to receipts. Mark personal purchases separately when an account contains mixed activity. A converted transaction helps locate an expense but does not replace its documentation." },
  { title: "Cash-flow analysis", text: "Use Excel to group incoming and outgoing transactions by week or month. Separate transfers between your own accounts before comparing spending. Reconcile the underlying table first so a missing page does not distort a trend or budget." },
  { title: "Preparing an accountant's file", text: "Send a reviewed workbook with the account period clearly identified and unresolved rows noted. Agree on the columns and date convention before sharing. Retain the bank-issued PDF because your accountant may need statement details that are absent from the table." },
  { title: "Accounting import preparation", text: "Export CSV data for accounting workflows, then match its columns to the destination's import requirements. Some tools expect one signed amount; others use separate money-in and money-out fields. Check the destination preview and duplicate handling before completing an import." },
];

const troubleshooting = [
  { title: "Scanned or rotated pages", text: "Image-only PDFs take an OCR path and may need more review. Use clear, upright pages with all edges visible. Correct sideways scans before uploading. A PDF mixing selectable text and scanned pages can omit image-only transactions, so check every page." },
  { title: "Password-protected PDFs", text: "The PDF reader can prompt for a document password. That is different from your online banking password. Protected scanned files may still fail during OCR; if authorized, create an unlocked local copy in a trusted PDF tool and try that copy." },
  { title: "Wrapped or multi-column descriptions", text: "A merchant name may continue onto another line or sit beside a separate check list. Look for descriptions attached to the wrong amount, split transactions, or repeated headers. Edit the preview against the source instead of accepting a plausible-looking row." },
  { title: "Missing balances or unusual dates", text: "Check the statement period and bank's date convention before correcting dates. If a balance is missing, consult the original; do not invent one. Negative balances and transactions whose debit or credit was inferred deserve a separate comparison with the PDF." },
  { title: "Several accounts or long statements", text: "Keep checking, savings, and other account sections separate. For very large statements, use shorter bank-issued periods or carefully split complete pages. The upload control lists a 20 MB limit, but complex scans may fail below it. Smaller files are easier to verify." },
];

// One source for both visible answers and FAQ structured data.
const faqs = [
  { question: "How do I convert a US bank statement PDF to Excel?", answer: "Upload the PDF, wait for the extracted table, and compare it with the statement. Edit any incorrect cells, then select the Excel export and sign in if prompted. Reopen the workbook to check the result. You do not need to connect an online banking account." },
  { question: "Which US banks can I try?", answer: "This directory links to guides for Chase, Bank of America, Wells Fargo, Citibank, U.S. Bank, and other listed institutions. The converter processes the document you supply rather than connecting to a bank. A listing is not a guarantee for every account type, historical layout, or scanned statement." },
  { question: "Can I convert Chase statements to Excel?", answer: "You can upload a Chase statement PDF and review the extracted transactions before exporting. For checking statements, compare separate deposit, withdrawal, and check sections with the preview. A check list and the transaction activity may describe the same payment, so verify that it has not been counted twice." },
  { question: "Can I convert Bank of America statements?", answer: "You can try a Bank of America checking statement using the same upload and review flow. Keep the statement period and account section clear. If your download combines several accounts, review each independently; do not assume a checking-account extract also captures investment positions or other non-transaction sections." },
  { question: "Can I convert Wells Fargo statements?", answer: "Upload the Wells Fargo PDF and compare the preview with its transaction history. Check long descriptions, fees, and page transitions, particularly when activity spans several pages. Confirm deposit and withdrawal totals before exporting. Statement summaries should not become extra transactions in the spreadsheet." },
  { question: "Can the converter process scanned bank statements?", answer: "There is an OCR path for image-only PDFs and supported images. Clear, upright scans usually provide a better starting point than cropped or blurred pages, but results still require inspection. Mixed text-and-image PDFs deserve extra attention because a readable text section does not prove every scanned page was extracted." },
  { question: "Can it process password-protected PDFs?", answer: "The browser PDF reader can ask for the document's password. Password-protected scans can encounter additional OCR limitations. If you are allowed to remove the protection, try an unlocked local copy. Never enter your bank login password; the converter only needs access to the statement document." },
  { question: "What columns are included in Excel and CSV exports?", answer: "The standard output includes a row number, Date, Description, Debit, Credit, and Balance. Check Number and Category are included when extracted values are present. XLSX can contain multiple preview sheets; CSV exports the active transaction table. Missing source information may remain blank and should not be guessed." },
  { question: "Can I use the CSV with QuickBooks or other accounting software?", answer: "Use the CSV as input for a reviewed mapping workflow, not as a guaranteed direct-import file. Match the destination's required columns, amount signs, and date format. Check a small sample and the import preview first, especially if some transactions already exist through a bank feed." },
  { question: "Is the preview free, and when do I pay?", answer: `The free plan includes one conversion with an editable preview and Excel or CSV export. Sign-in is required to download through the app. Additional conversion credits are displayed at ${formatUSD(PER_CONVERSION_PRICE_USD)} each. Review the pricing page and checkout currency before purchasing; there is no current $1 plan in this workflow.` },
  { question: "How are uploaded bank statements handled?", answer: "Text PDFs are read in the browser, then extracted text is sent for server-side AI processing. Scanned documents are submitted for OCR, and exports are generated on the server. This is not an offline workflow. Read the file-processing guide and clarify retention requirements before submitting sensitive or client documents." },
  { question: "Can I convert business statements, and what should I verify?", answer: "You can try business checking statements as well as personal checking PDFs. Verify each account's opening balance, deposits, withdrawals, closing balance, and page coverage. Review fees, reversals, and transfers separately. The spreadsheet is an editable working extract, not an official replacement for the bank-issued statement." },
];

const resources = [
  { href: "/blog/bank-statement-to-quickbooks-csv", label: "Prepare a CSV for QuickBooks", text: "Review column mapping, amount signs, and duplicate checks." },
  { href: "/blog/convert-bank-statement-pdf-to-csv", label: "Choose and check a CSV export", text: "Understand the flat-file output before moving data between tools." },
  { href: "/blog/bank-statement-reconciliation-in-excel", label: "Reconcile a statement in Excel", text: "Compare transaction totals and investigate unexplained differences." },
  { href: "/blog/convert-bank-statement-pdf-to-excel", label: "Read the PDF-to-Excel workflow guide", text: "Work through document preparation, extraction, and final review." },
];

const linkClass = "font-medium text-primary-700 underline underline-offset-4 hover:text-primary-800";
const headingClass = "mx-auto max-w-3xl text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl";
const stepIcons = [Upload, ScanLine, Download];
const workflowIcons = [BookOpen, Receipt, BriefcaseBusiness, ChartNoAxesCombined, Users, ArrowLeftRight];

function UploadCta() {
  return <Link href="/app" prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600">Upload a bank statement <ArrowRight size={18} aria-hidden="true" /></Link>;
}

function BankCard({ slug }: { slug: string }) {
  const bank = usBanks[slug];
  return <Link href={`/banks/us/${slug}`} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600">
    <span aria-hidden="true" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: bank.color }}>{bank.name.charAt(0)}</span>
    <span className="min-w-0 text-sm font-semibold text-slate-800 group-hover:text-primary-700">{bank.name}{slug === "suntrust" && <span className="block text-xs font-normal text-slate-500">Now part of Truist</span>}</span>
    <ArrowRight size={14} aria-hidden="true" className="ml-auto flex-shrink-0 text-slate-400" />
  </Link>;
}

export default function USBanksIndexPage() {
  const moreBanks = Object.keys(usBanks).filter((slug) => !featuredBanks.includes(slug));
  const structuredData = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bankstatementtoexcelconverter.com/" },
      { "@type": "ListItem", position: 2, name: "US banks", item: pageUrl },
    ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main id="us-bank-converter">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#f3f8ff_52%,_#eef5ff_100%)] px-4 pb-12 pt-24 sm:pb-16 sm:pt-28">
          <div className="mx-auto max-w-6xl text-center">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-600"><ol className="flex justify-center gap-2"><li><Link href="/" className="hover:text-primary-700">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page">US banks</li></ol></nav>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-sm font-medium text-primary-700"><Building2 size={15} aria-hidden="true" />PDF to spreadsheet</div>
            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">Convert US Bank Statements to Excel or CSV</h1>
            <p className="mx-auto mb-5 mt-4 max-w-2xl text-lg leading-7 text-slate-600">Upload a bank statement PDF, review the extracted dates, descriptions, debits, credits, and balances, then export a clean spreadsheet.</p>
            <UploadCta />
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600">Your first conversion includes preview, editing, and export for free. Sign in to download. Additional conversions are displayed at {formatUSD(PER_CONVERSION_PRICE_USD)} each.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600">
              {["Excel (.xlsx) and CSV", "Review before export"].map((text) => <span key={text} className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} aria-hidden="true" className="text-primary-600" />{text}</span>)}
              <Link href={handlingGuide} className={linkClass}>See how your files are processed</Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="example-heading" className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 id="example-heading" className={headingClass}>See the spreadsheet you are working toward</h2>
            <p className="mx-auto mb-8 mt-4 max-w-3xl text-center leading-7 text-slate-600">These fabricated transactions illustrate the column layout, not a result from a real bank statement. Starting from $1,000.00, the deposit and two payments below leave $1,925.00. Use the same kind of balance check on your own extracted data.</p>
            <div role="region" aria-label="Fabricated spreadsheet example; scroll horizontally on small screens" tabIndex={0} className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600">
              <table className="w-full min-w-[700px] text-left text-sm">
                <caption className="bg-slate-950 px-5 py-4 text-left font-medium text-white">Illustrative output — fictional data, amounts in USD</caption>
                <thead className="bg-slate-50 text-slate-600"><tr>{["Date", "Description", "Check number", "Debit", "Credit", "Balance"].map((label) => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
                <tbody className="text-slate-700">{[
                  ["May 6, 2026", "ACH example deposit", "—", "—", "1,200.00", "2,200.00"],
                  ["May 7, 2026", "Example office supplies", "—", "75.00", "—", "2,125.00"],
                  ["May 8, 2026", "Example check payment", "1042", "200.00", "—", "1,925.00"],
                ].map((row) => <tr key={row[0]} className="border-t border-slate-200">{row.map((cell, index) => <td key={index} className={`px-4 py-4 ${index > 2 ? "tabular-nums" : ""}`}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <p className="mx-auto mb-6 mt-5 max-w-3xl text-center text-sm leading-6 text-slate-600">Actual exports include a row number. Check numbers and categories appear when populated; date formatting can differ from this illustration. Missing fields need review, and the file remains an editable extract rather than a bank-certified statement.</p>
            <div className="text-center"><UploadCta /></div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>How conversion works</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map((step, index) => { const Icon = stepIcons[index]; return <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-6 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><Icon size={24} aria-hidden="true" /></span><span aria-hidden="true" className="text-4xl font-bold text-slate-200">0{index + 1}</span></div><h3 className="mb-3 text-lg font-semibold text-slate-900">{step.title}</h3><p className="leading-7 text-slate-600">{step.text}</p></div>; })}</div></div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>What to look for in a US statement extract</h2><p className="mx-auto mt-4 max-w-3xl text-center leading-7 text-slate-600">A useful bank statement converter preserves the meaning of the activity, not just the printed numbers. The parser targets transaction dates, descriptions, debits, credits, and balances, with optional check numbers and categories. The source layout determines what can be extracted.</p><div className="mt-7 grid gap-6 md:grid-cols-2">{fields.map((field) => <div key={field.title} className="rounded-2xl border border-slate-200 p-6"><h3 className="mb-2 text-lg font-semibold text-slate-900">{field.title}</h3><p className="leading-7 text-slate-600">{field.text}</p></div>)}</div><p className="mx-auto mt-7 max-w-3xl rounded-xl border-l-4 border-primary-200 bg-primary-50/50 p-5 leading-7 text-slate-600">On a multi-page statement, match the last transaction on each page with the next page's first entry. Repeated headings and carried-forward balances are useful context, but they should not be counted as new deposits or withdrawals.</p></div>
        </section>

        <section id="banks" className="bg-slate-50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>Find your US bank statement guide</h2><p className="mx-auto mt-4 max-w-3xl text-center leading-7 text-slate-600">Start with your institution's guide, then try your PDF in the converter. These are navigation links, not a certification that every statement format has been tested. Account type, statement age, and scan quality can change the result even within the same bank.</p><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredBanks.map((slug) => <BankCard key={slug} slug={slug} />)}</div><h3 className="mb-5 mt-10 text-center text-lg font-semibold text-slate-900">More bank and credit union guides</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{moreBanks.map((slug) => <BankCard key={slug} slug={slug} />)}</div><p className="mx-auto mb-6 mt-6 max-w-3xl text-center text-sm leading-6 text-slate-600">The SunTrust guide remains available for older statements; SunTrust is now part of Truist. For Charles Schwab, distinguish checking transactions from brokerage holdings and trade summaries. Use the original document to confirm which account activity you are converting.</p><div className="text-center"><UploadCta /></div></div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>Common uses for converted bank statements</h2><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{useCases.map((item, index) => { const Icon = workflowIcons[index]; return <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6"><Icon size={24} aria-hidden="true" className="mb-5 text-primary-600" /><h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3><p className="leading-7 text-slate-600">{item.text}</p></div>; })}</div><p className="mx-auto mt-7 max-w-3xl rounded-xl border-l-4 border-primary-200 bg-primary-50/50 p-5 leading-7 text-slate-600">If a lender, government agency, or other recipient requests official evidence, keep the original bank-issued PDFs. An editable spreadsheet may help you organize information, but acceptance depends on the recipient's requirements.</p></div>
        </section>

        <section className="bg-slate-50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>Choose Excel or CSV for your next step</h2><div className="mt-7 grid gap-6 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-6"><FileSpreadsheet size={32} aria-hidden="true" className="mb-5 text-emerald-600" /><h3 className="mb-3 text-lg font-semibold text-slate-900">Excel: a workbook for review</h3><p className="leading-7 text-slate-600">The XLSX export contains transaction columns in worksheets, with column widths set for readability. If your preview has multiple sheets, they can be included in the workbook. Open it in Excel to sort, filter, add review notes, or create your own summaries. Dates should be checked before date-based sorting.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><FileText size={32} aria-hidden="true" className="mb-5 text-primary-600" /><h3 className="mb-3 text-lg font-semibold text-slate-900">CSV: one table for data transfer</h3><p className="leading-7 text-slate-600">CSV exports the active table as text with column headers. It does not retain workbook tabs or formatting. Check how your spreadsheet or accounting tool interprets dates, decimal values, and check numbers with leading zeros. Your accountant may prefer CSV when they have an established import template.</p></div></div><p className="mx-auto mt-7 max-w-3xl rounded-xl border-l-4 border-primary-200 bg-primary-50/50 p-5 leading-7 text-slate-600">Correct extraction mistakes in the preview before downloading. Categories, when present, are suggestions to review rather than approved accounting decisions. For a destination that requires different columns, prepare a separate mapped copy and retain the reviewed original export.</p></div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>Accuracy checks and troubleshooting</h2><p className="mx-auto mt-4 max-w-3xl text-center leading-7 text-slate-600">Before relying on the spreadsheet, compare opening balance plus deposits minus withdrawals with closing balance. Also compare deposit and withdrawal totals separately: two omitted transactions can cancel out. Check the first and last entries, row coverage, and any apparent duplicates against the PDF.</p><div className="mt-7 grid gap-5 md:grid-cols-2">{troubleshooting.map((item) => <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3><p className="leading-7 text-slate-600">{item.text}</p></div>)}</div></div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><ShieldCheck size={32} aria-hidden="true" className="mx-auto mb-5 text-primary-600" /><h2 className={headingClass}>Privacy and file handling</h2><div className="mx-auto mt-7 max-w-3xl space-y-4 leading-7 text-slate-600"><p>This is an online processing workflow. Text-based PDFs are read in the browser and extracted text is sent to the server for AI parsing. Scanned files are sent for OCR. The current processing implementation uses Google's Vertex AI service, and export files are generated on the server.</p><p>Only submit documents you are authorized to process. Preview data may be saved in your browser for reopening, so consider shared-device access as well as downloaded files. For client records or specific retention requirements, obtain clarification before uploading.</p><p><Link href={handlingGuide} className={linkClass}>See how your files are processed</Link> in the existing data-handling guide. It explains the workflow and questions to ask; it does not establish an automatic deletion deadline or a compliance certification.</p></div></div>
        </section>

        <section id="pricing" className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6 shadow-sm sm:p-12"><h2 className={headingClass}>One free conversion, then choose a plan</h2><div className="mx-auto mt-7 max-w-3xl space-y-4 leading-7 text-slate-600"><p>The free plan includes one statement conversion, an editable preview, and Excel or CSV export. You can begin without signing in, but the app asks you to sign in to download. Additional documents require an available conversion credit or an eligible paid plan.</p><p>The current pay-per-conversion option is displayed at {formatUSD(PER_CONVERSION_PRICE_USD)} per credit. A lifetime option is displayed at {formatUSD(LIFETIME_PRICE_USD)}, subject to availability. These are plan prices, not page-count tiers: the current order flow charges a fixed amount for the selected plan.</p><p>Checkout charges are in Indian rupees; a conversion credit is currently ₹{PER_CONVERSION_PRICE_INR}. The displayed dollar amount is a reference, and your card issuer's exchange rate or fees may differ. Check the checkout total and <Link href="/pricing" className={linkClass}>current plan details</Link> before paying.</p></div><div className="mt-7 text-center"><UploadCta /></div></div>
        </section>

        <section id="faq" className="bg-slate-50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className={headingClass}>Frequently asked questions</h2>
            <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary-600 sm:px-7 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{faq.question}</h3>
                    <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-primary-600 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <p className="px-5 pb-6 leading-7 text-slate-600 sm:px-7">{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 text-center"><UploadCta /></div>
          </div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl"><h2 className={headingClass}>Resources for the next step</h2><div className="mt-7 grid gap-4 sm:grid-cols-2">{resources.map((resource) => <div key={resource.href} className="rounded-xl border border-slate-200 p-5"><Link href={resource.href} className={linkClass}>{resource.label}</Link><p className="mt-2 text-sm leading-6 text-slate-600">{resource.text}</p></div>)}</div></div>
        </section>
      </main>
      <Footer />
      {structuredData.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
    </div>
  );
}
