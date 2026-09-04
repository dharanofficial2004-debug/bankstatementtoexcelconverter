import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title:
    "How to Download ICICI Bank Statement in Excel Format (Step-by-Step)",
  description:
    "Learn how to download your ICICI bank statement in Excel format. Step-by-step guide for mobile app and net banking, plus how to convert the PDF to Excel for accounting.",
  alternates: {
    canonical:
      "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-icici-bank-statement-in-excel",
  },
  openGraph: {
    title: "How to Download ICICI Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Learn how to download your ICICI bank statement in Excel format from net banking and the mobile app, and how to convert the PDF to Excel.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-icici-bank-statement-in-excel",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "article",
  },
};

const faqs = [
  {
    question: "Can I get my ICICI bank statement directly in Excel?",
    answer:
      "ICICI Bank does not provide a direct Excel download. Statements are available as PDF from iMobile Pay or internet banking. You can then convert the PDF to Excel using an online converter.",
  },
  {
    question: "Is it better to use PDF or Excel from the bank?",
    answer:
      "PDF is the official format from ICICI Bank and is accepted for most official purposes. Excel is more useful for analysis, budgeting, reconciliation, and accounting.",
  },
  {
    question: "How do I convert my ICICI statement to Excel?",
    answer:
      "Download the PDF from iMobile Pay or ICICI internet banking, then upload it to our converter. Review the extracted transactions in the editable table and export to Excel or CSV.",
  },
  {
    question: "Can I use this for loans or visa applications?",
    answer:
      "For official loan or visa purposes, use the original PDF from the bank. The Excel export is useful for your own analysis and preparation.",
  },
  {
    question: "What if some transactions are missing after conversion?",
    answer:
      "Compare the preview with your original PDF. If transactions are missing, check if the PDF is password-protected (use your date of birth or account number to unlock), or try downloading a fresh copy from the bank.",
  },
  {
    question: "Does the converter work with password-protected ICICI PDFs?",
    answer:
      "ICICI Bank PDFs are often protected. Our converter will prompt you for the password if it detects one — typically your date of birth in DDMMYYYY format.",
  },
];

export default function ICICIBlogPost() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Download ICICI Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Learn how to download your ICICI bank statement in Excel format from net banking and the mobile app.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-icici-bank-statement-in-excel",
    publisher: {
      "@type": "Organization",
      name: "StatementToExcel",
      url: "https://bankstatementtoexcelconverter.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":
        "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-icici-bank-statement-in-excel",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bankstatementtoexcelconverter.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.bankstatementtoexcelconverter.com/blog" },
      { "@type": "ListItem", position: 3, name: "How to Download ICICI Bank Statement in Excel Format", item: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-icici-bank-statement-in-excel" },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      {/* Hero */}
      <header className="pt-32 pb-10 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
              <li><Link href="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li><Link href="/blog" className="hover:text-primary-600 transition-colors">Blog</Link></li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-none">ICICI Bank Statement in Excel</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
            How to Download ICICI Bank Statement in Excel Format (Step-by-Step)
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
            ICICI Bank provides statements as PDF from iMobile Pay and internet banking. Users often need Excel for loan applications, accounting, or reconciliation. This guide shows how to download the statement and convert it to Excel.
          </p>

          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
            <div className="flex-1">
              <p className="text-slate-700 text-sm font-medium mb-0.5">Upload your PDF and export to Excel or CSV.</p>
              <p className="text-slate-500 text-sm">No signup required. Free preview before download.</p>
            </div>
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm flex-shrink-0">
              Convert your ICICI statement <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-14">
        {/* Section 1 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            How to download your ICICI Bank statement from net banking
          </h2>
          <ol className="space-y-4">
            {[
              "Log in to ICICI Bank internet banking at icicibank.com with your User ID and password.",
              "Go to Bank Accounts → Accounts in the top menu.",
              "Click Detailed Statement on your account.",
              "Select the date range — you can choose a preset like Last 30 days, Last 90 days, or enter a custom From / To date.",
              "Click Get Statement and then Download PDF.",
              "Save the file to your computer.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            How to download your ICICI Bank statement from the mobile app
          </h2>
          <p className="text-slate-700 leading-relaxed mb-5">
            The iMobile Pay app lets you download a detailed statement PDF directly from your phone.
          </p>
          <ol className="space-y-4">
            {[
              "Open iMobile Pay on your phone and log in.",
              "Tap Accounts & Deposits at the bottom or in the menu.",
              "Select the account you want a statement for.",
              "Tap Detailed Statement.",
              "Choose your date range and tap Proceed to PDF.",
              "The PDF will be generated — save it to your phone or share it directly.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            Converting your ICICI Bank statement PDF to Excel
          </h2>
          <p className="text-slate-700 leading-relaxed mb-5">
            ICICI Bank does not offer a direct Excel download. The file you get from the app or net banking is always a PDF. To get an editable spreadsheet:
          </p>
          <ol className="space-y-4 mb-6">
            {[
              "Download the PDF from iMobile Pay or ICICI internet banking (steps above).",
              "Upload the PDF to our converter using the button below.",
              "Review the extracted transactions in the live editable table.",
              "Export to Excel (.xlsx) or CSV in one click.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-slate-700 text-sm">Upload your ICICI PDF and download a clean Excel file in seconds.</p>
            </div>
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm flex-shrink-0">
              Convert now <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            Common issues and how to fix them
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "Statement shows only summary, not detailed transactions",
                fix: "In iMobile Pay, make sure you select Detailed Statement, not Mini Statement. In net banking, choose a specific date range and select the detailed view.",
              },
              {
                title: "Date range too large — file is very big",
                fix: "ICICI limits statement PDFs to a maximum of one year per download. If you need more data, download in three-month or six-month chunks and combine them.",
              },
              {
                title: "Scanned or image-based statements",
                fix: "Emailed e-statements from ICICI are usually text-based PDFs. If yours looks like a scanned image, try downloading a fresh copy directly from iMobile Pay or internet banking.",
              },
              {
                title: "Password-protected PDF",
                fix: "ICICI Bank PDFs are often password-protected. The default password is typically your date of birth in DDMMYYYY format. Our converter will prompt you to enter it.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 — FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{faq.question}</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* End CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 sm:p-8 text-center text-white mb-10">
          <h3 className="text-xl font-bold mb-2">Ready to convert your ICICI statement?</h3>
          <p className="text-primary-100 text-sm mb-5">
            Upload your PDF, review the transactions in a live editable table, and export to Excel or CSV in seconds.
          </p>
          <Link href="/app" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm">
            Convert your ICICI statement <ArrowRight size={15} />
          </Link>
        </div>

        {/* Internal links */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 text-sm">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors">
            <ArrowLeft size={14} /> Back to blog
          </Link>
          <Link href="/blog/convert-bank-statement-pdf-to-excel" className="text-slate-500 hover:text-primary-600 transition-colors">
            Read more about converting bank statements
          </Link>
          <Link href="/banks/in/icici-bank" className="text-slate-500 hover:text-primary-600 transition-colors">
            ICICI Bank converter page
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
