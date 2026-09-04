import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title:
    "How to Download Canara Bank Statement in Excel Format (Step-by-Step)",
  description:
    "Learn how to download your Canara Bank statement in Excel format. Step-by-step guide for mobile app and net banking, plus how to convert the PDF to Excel for accounting.",
  alternates: {
    canonical:
      "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-canara-bank-statement-in-excel",
  },
  openGraph: {
    title: "How to Download Canara Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Step-by-step guide to download Canara Bank statements in Excel format, plus tips to convert the PDF to a clean spreadsheet.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-canara-bank-statement-in-excel",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "article",
  },
};

const faqs = [
  {
    question: "Can I get my Canara Bank statement directly in Excel?",
    answer:
      "No. Canara Bank does not offer a direct Excel download. Statements are only available as PDF from Canara ai1 or NetBanking. Download the PDF and then convert it to Excel using our free online tool.",
  },
  {
    question: "Is it better to use PDF or Excel from the bank?",
    answer:
      "PDF is the official format from Canara Bank and is accepted for most formal purposes. Excel is better for analysis, reconciliation, and accounting.",
  },
  {
    question: "How do I convert my Canara Bank statement to Excel?",
    answer:
      "Download the PDF from Canara ai1 or Canara NetBanking. Upload it to our converter, review the extracted transactions, and export to Excel or CSV.",
  },
  {
    question: "Can I use this for loans or visa applications?",
    answer:
      "For formal applications, present the original bank PDF. The Excel export is for your own analysis, preparation, or bookkeeping.",
  },
  {
    question: "What if some transactions are missing after conversion?",
    answer:
      "Check if the PDF covers the full date range you selected. If some pages are missing, download a fresh PDF from the bank and try again.",
  },
  {
    question: "How do I open the Canara Bank PDF if it is password-protected?",
    answer:
      "Canara Bank statement PDFs are sometimes password-protected with your account number or date of birth. Check the bank's email or net banking note for the password.",
  },
];

export default function CanaraBlogPost() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Download Canara Bank Statement in Excel Format (Step-by-Step)",
    description: "Step-by-step guide to download Canara Bank statements in Excel format.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-canara-bank-statement-in-excel",
    publisher: { "@type": "Organization", name: "StatementToExcel", url: "https://bankstatementtoexcelconverter.com" },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-canara-bank-statement-in-excel" },
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
      { "@type": "ListItem", position: 3, name: "How to Download Canara Bank Statement in Excel Format", item: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-canara-bank-statement-in-excel" },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <header className="pt-32 pb-10 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
              <li><Link href="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li><Link href="/blog" className="hover:text-primary-600 transition-colors">Blog</Link></li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-none">Canara Bank Statement in Excel</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
            How to Download Canara Bank Statement in Excel Format (Step-by-Step)
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
            Canara Bank provides statements only as PDF from the Canara ai1 app and NetBanking. Users often need Excel for analysis, loans, or accounting. This guide shows how to download the statement and convert it to Excel.
          </p>

          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-slate-700 text-sm font-medium mb-0.5">Upload your PDF and export to Excel or CSV.</p>
              <p className="text-slate-500 text-sm">No signup required. Free preview before download.</p>
            </div>
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm flex-shrink-0">
              Convert your Canara statement <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-14">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            How to download your Canara Bank statement from net banking
          </h2>
          <ol className="space-y-4">
            {[
              "Log in to Canara Bank NetBanking at canarabank.com using your credentials.",
              "Navigate to Accounts → Account Statement.",
              "Select your account and choose the date range.",
              "Click the PDF icon or Download PDF to save the statement.",
              "Save the file to your computer.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            How to download your Canara Bank statement from the mobile app
          </h2>
          <p className="text-slate-700 leading-relaxed mb-5">
            The Canara ai1 mobile app lets you download your statement PDF directly from your phone.
          </p>
          <ol className="space-y-4">
            {[
              "Open the Canara ai1 app and log in.",
              "Tap Accounts in the bottom menu.",
              "Select your account and tap Statement.",
              "Choose your desired date range.",
              "Tap Download PDF and save it to your phone.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">
            Converting your Canara Bank statement PDF to Excel
          </h2>
          <p className="text-slate-700 leading-relaxed mb-5">
            Canara Bank does not offer a direct Excel download. Once you have the PDF, follow these steps to get an editable spreadsheet:
          </p>
          <ol className="space-y-4 mb-6">
            {[
              "Download the PDF using the steps above.",
              "Upload the PDF to our converter.",
              "Review all extracted transactions in the editable preview table.",
              "Export to Excel (.xlsx) or CSV.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-slate-700 text-sm">Upload your Canara Bank PDF and export to Excel free.</p>
            </div>
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm flex-shrink-0">
              Convert now <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Common issues and how to fix them</h2>
          <div className="space-y-4">
            {[
              { title: "Statement shows only summary", fix: "In the Canara ai1 app or NetBanking, ensure you select the Account Statement (detailed view), not just the mini statement or passbook summary." },
              { title: "Date range too large", fix: "Canara Bank may restrict very long date ranges. Download in quarterly chunks and combine them if you need a full year." },
              { title: "Scanned or image-based PDF", fix: "Canara Bank PDFs are normally text-based. If yours looks like an image, try downloading a fresh copy from the official app or portal." },
              { title: "Missing pages or truncated PDF", fix: "If the last few transactions are missing, shorten the date range slightly and download again. Large statements sometimes get truncated." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.fix}</p>
              </div>
            ))}
          </div>
        </section>

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

        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 sm:p-8 text-center text-white mb-10">
          <h3 className="text-xl font-bold mb-2">Ready to convert your Canara Bank statement?</h3>
          <p className="text-primary-100 text-sm mb-5">Upload your PDF and export to Excel or CSV in seconds.</p>
          <Link href="/app" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm">
            Convert your Canara statement <ArrowRight size={15} />
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 text-sm">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors">
            <ArrowLeft size={14} /> Back to blog
          </Link>
          <Link href="/blog/convert-bank-statement-pdf-to-excel" className="text-slate-500 hover:text-primary-600 transition-colors">
            Read more about converting bank statements
          </Link>
          <Link href="/banks/in/canara-bank" className="text-slate-500 hover:text-primary-600 transition-colors">
            Canara Bank converter page
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
