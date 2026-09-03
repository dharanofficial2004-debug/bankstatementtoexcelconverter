import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title:
    "How to Convert a Bank Statement PDF to Excel (Step-by-Step)",
  description:
    "Learn how to convert a bank statement PDF to Excel accurately. Compare copy‑paste, Excel Power Query, and dedicated converters, and validate your file before using it for accounting.",
  alternates: {
    canonical:
      "https://www.bankstatementtoexcelconverter.com/blog/convert-bank-statement-pdf-to-excel",
  },
  openGraph: {
    title: "How to Convert a Bank Statement PDF to Excel (Step-by-Step)",
    description:
      "Compare copy‑paste, Excel Power Query, and dedicated converters. Learn when to use each method and how to validate your output.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/convert-bank-statement-pdf-to-excel",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "article",
  },
};

const faqs = [
  {
    question: "Can I convert any bank statement PDF to Excel?",
    answer:
      "Most text-based PDFs work well. Scanned or image-based statements can work with OCR, but need more careful review.",
  },
  {
    question: "Is Excel or CSV better for bank statements?",
    answer:
      "Excel is better for analysis, filters, and reports. CSV is better for simple data processing or import into systems that accept CSV.",
  },
  {
    question: "How do I know the conversion is correct?",
    answer:
      "Compare the opening and closing balances with the original PDF, and spot-check several transactions, especially large ones.",
  },
  {
    question: "Can I use this for accounting or tax purposes?",
    answer:
      "The converted file is for organization and analysis. For official purposes, keep the original bank statement PDF and follow your accountant or authority's requirements.",
  },
  {
    question: "What if some rows look wrong after conversion?",
    answer:
      "Compare them with the original PDF, correct them in your table, and if many rows are affected, try re-downloading the statement or using a different conversion method.",
  },
];

export default function BlogPostPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Convert a Bank Statement PDF to Excel (Step-by-Step)",
    description:
      "Learn how to convert a bank statement PDF to Excel accurately. Compare copy‑paste, Excel Power Query, and dedicated converters.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/convert-bank-statement-pdf-to-excel",
    publisher: {
      "@type": "Organization",
      name: "StatementToExcel",
      url: "https://bankstatementtoexcelconverter.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":
        "https://www.bankstatementtoexcelconverter.com/blog/convert-bank-statement-pdf-to-excel",
    },
  };

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
        name: "Blog",
        item: "https://www.bankstatementtoexcelconverter.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How to Convert a Bank Statement PDF to Excel (Step-by-Step)",
        item: "https://www.bankstatementtoexcelconverter.com/blog/convert-bank-statement-pdf-to-excel",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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
      <header className="pt-32 pb-10 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
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
                <Link href="/blog" className="hover:text-primary-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-none">
                How to Convert a Bank Statement PDF to Excel
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            How to Convert a Bank Statement PDF to Excel (Step-by-Step)
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
            A bank statement in PDF is fine for reading, but hard to analyze.
            This guide compares three ways to get the data into Excel — and
            shows how to avoid broken columns, missing rows, and date issues.
          </p>

          {/* Primary CTA */}
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-slate-600 text-sm">
                Upload a PDF, review transactions in an editable table, and
                export Excel or CSV.
              </p>
            </div>
            <Link
              href="/app"
              className="btn-primary text-sm py-2.5 px-5 flex-shrink-0 inline-flex items-center gap-2"
            >
              Convert your statement <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 py-14">
        {/* Section 1 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            When you actually need Excel (and when CSV is enough)
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Excel is the right choice when you need to analyze data: apply
            filters, write formulas, build pivot tables, or produce formatted
            reports. If you want to spot-check categories, build a monthly
            summary, or share a clean dashboard with your accountant, Excel
            gives you that flexibility.
          </p>
          <p className="text-slate-700 leading-relaxed">
            CSV is better for simple data processing — or when you need to
            import transactions into another system. Many accounting platforms
            (QuickBooks, Xero, Wave) accept CSV imports directly, and some
            require a specific column layout that you can set up once and reuse.
            If your end goal is an import rather than analysis, CSV keeps things
            lightweight.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Method 1 — Copy and paste from PDF to Excel
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            The simplest approach: open the PDF, select the transaction table,
            copy, and paste into Excel. It costs nothing and works immediately
            — but the results vary a lot depending on how the PDF was created.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4 font-medium">
            Common failure modes:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              "Columns collapse into a single cell — all fields land in column A as a mixed string",
              "Dates reformat or lose their separators (20241203 instead of 03/12/2024)",
              "Long descriptions split across two rows, offsetting the amount columns",
              "Running balance disappears or misaligns after the paste",
              "Multi-page statements break at page boundaries, inserting repeated headers as data rows",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5 text-sm text-slate-700">
            <p className="font-semibold mb-1 text-slate-800">When this can work:</p>
            Short statements (under 2 pages) with simple, text-based layouts —
            especially when you're comfortable with Excel formulas to clean up
            the result afterwards.
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Method 2 — Excel Power Query (Get Data from PDF)
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Excel 365 and Excel 2019+ include a built-in importer: go to{" "}
            <strong>Data → Get Data → From File → From PDF</strong>. Excel
            attempts to detect tables inside the document and lets you choose
            which ones to load.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            This works well with clean, text-based PDFs that have clear table
            borders. It struggles with scanned or image-based statements, which
            look like a picture to Excel rather than structured data. Even on
            text PDFs, you typically need to clean up the output: remove extra
            header rows that loaded as data, fix column data types, split
            description columns, and verify that multi-page tables loaded
            completely.
          </p>
          <p className="text-slate-700 font-medium mb-3">After loading, check:</p>
          <ul className="space-y-2">
            {[
              "All pages loaded — compare the row count with the original PDF",
              "Date formats are consistent across the whole column",
              "Debits and credits are in the correct separate columns",
              "Opening and closing balances match the original PDF exactly",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base">
                <CheckCircle2 size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Method 3 — Dedicated bank statement converters
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Tools built specifically for bank statements are designed around the
            typical layout: date, description, debit, credit, running balance.
            They handle multi-page PDFs as a single unit, recognize repeated
            page headers and skip them, and present the result in a preview
            table before you export — so you can catch problems before the file
            lands in your spreadsheet.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            The main advantages over manual methods:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              "Less manual cleanup — columns and data types are already mapped correctly",
              "Multi-page handling without row breaks or duplicated headers",
              "Preview before export so you can review and edit transactions in-browser",
              "Both Excel (XLSX) and CSV export formats available",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base">
                <CheckCircle2 size={16} className="text-success-600 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            Different tools support different banks and formats. Always review
            the preview and validate against the original statement before
            exporting. If you want to{" "}
            <Link
              href="/app"
              className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
            >
              try a dedicated converter
            </Link>
            , upload your PDF and check the preview first.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Scanned or image-based statements
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If your bank statement is a scanned document or a photo, the PDF
            contains an image rather than selectable text. To extract data from
            it, you need OCR (Optical Character Recognition) — software that
            reads the image and converts it to machine-readable text.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            OCR quality depends heavily on the scan itself: resolution (300 DPI
            or higher works best), lighting, rotation, and whether the print is
            clean and high-contrast. A blurry or skewed scan will produce more
            errors.
          </p>
          <div className="rounded-xl bg-warning-50 border border-warning-500/30 p-4 sm:p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-800 mb-1">Always verify scanned output:</p>
            Review the extracted table carefully and validate totals and a
            representative sample of transactions against the original document.
            OCR is helpful but not infallible.
          </div>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            How to validate your converted file
          </h2>
          <p className="text-slate-700 leading-relaxed mb-5">
            Regardless of the method you used, a quick validation before using
            the data for accounting saves time later. Work through this
            checklist:
          </p>
          <ul className="space-y-3">
            {[
              "Compare opening balance and closing balance with the PDF",
              "Spot-check a few transactions — especially larger amounts",
              "Ensure dates are in the expected format throughout the column",
              "Confirm debits and credits are in the correct separate columns",
              "Look for repeated header rows that became data rows",
              "Check for missing pages or cut-off transactions at the end",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700 text-sm sm:text-base">
                <CheckCircle2 size={17} className="text-primary-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 7 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            What to do after conversion
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Once the data is clean and validated, the most common next steps are:
          </p>
          <ul className="space-y-2 mb-5">
            {[
              "Bank reconciliation — match transactions against your accounting records in Excel",
              "Expense categorization — tag each row with a category for monthly reports",
              "Accounting software import — use the CSV to import transactions into QuickBooks, Xero, Wave, or similar tools",
              "Tax preparation — organize income and expenses for Schedule C review or CPA handoff",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-600 text-sm leading-relaxed">
            Keep the original PDF as your source document for audits or official
            use. The converted Excel or CSV file is for analysis and
            organization — it is not a substitute for the original bank
            statement.
          </p>
        </section>

        {/* Section 8 — FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="font-semibold text-slate-900 mb-2 text-base">
                  {faq.question}
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* End CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 sm:p-8 text-center text-white mb-10">
          <h3 className="text-xl font-bold mb-2">Ready to try it yourself?</h3>
          <p className="text-primary-100 text-sm mb-5">
            Upload your PDF, review the transactions in a live editable table,
            and export to Excel or CSV in seconds.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm"
          >
            Start with your own statement <ArrowRight size={15} />
          </Link>
        </div>

        {/* Back to blog */}
        <div className="pt-6 border-t border-slate-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
