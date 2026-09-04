import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title:
    "How to Download Kotak Mahindra Bank Statement in Excel Format (Step-by-Step)",
  description:
    "Learn how to download your Kotak Mahindra Bank statement in Excel format. Step-by-step guide for mobile app and net banking, plus how to convert the PDF to Excel for accounting.",
  alternates: {
    canonical:
      "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-kotak-bank-statement-in-excel",
  },
  openGraph: {
    title: "How to Download Kotak Mahindra Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Step-by-step guide to download Kotak Mahindra Bank statements and convert the PDF to Excel.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-kotak-bank-statement-in-excel",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "article",
  },
};

const faqs = [
  {
    question: "Can I get my Kotak Mahindra Bank statement directly in Excel?",
    answer:
      "Kotak Bank does not offer a direct Excel download. Statements are available as PDF from Kotak Mobile Banking or NetBanking. Convert the PDF to Excel using our free tool.",
  },
  {
    question: "Is it better to use PDF or Excel from the bank?",
    answer:
      "PDF is the official format from Kotak and is needed for formal purposes. Excel is better for analysis, tax preparation, and bookkeeping.",
  },
  {
    question: "How do I convert my Kotak statement to Excel?",
    answer:
      "Download the PDF from the Kotak app or NetBanking, upload it to our converter, review the preview, and export to Excel or CSV.",
  },
  {
    question: "Can I use this for a visa or loan application?",
    answer:
      "Official applications require the original Kotak PDF. The Excel export helps you prepare and organize the data beforehand.",
  },
  {
    question: "What if some transactions are missing after conversion?",
    answer:
      "Check that the PDF covers the full date range. If your Kotak PDF is password-protected, use your date of birth or the password provided in the bank's email.",
  },
  {
    question: "How do I download a Kotak 811 account statement?",
    answer:
      "Log in to the Kotak Mobile Banking app, go to Banking → Account Activity, tap Statement, and download the PDF. The process is the same for 811 and regular savings accounts.",
  },
];

export default function KotakBlogPost() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Download Kotak Mahindra Bank Statement in Excel Format (Step-by-Step)",
    description: "Step-by-step guide to download Kotak Mahindra Bank statements and convert to Excel.",
    url: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-kotak-bank-statement-in-excel",
    publisher: { "@type": "Organization", name: "StatementToExcel", url: "https://bankstatementtoexcelconverter.com" },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-kotak-bank-statement-in-excel" },
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
      { "@type": "ListItem", position: 3, name: "How to Download Kotak Bank Statement in Excel Format", item: "https://www.bankstatementtoexcelconverter.com/blog/how-to-download-kotak-bank-statement-in-excel" },
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
              <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-none">Kotak Bank Statement in Excel</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
            How to Download Kotak Mahindra Bank Statement in Excel Format (Step-by-Step)
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
            Kotak Mahindra Bank provides statements as PDF from the Kotak mobile app and NetBanking. This guide explains how to download the statement and convert it to Excel for analysis, tax filing, or accounting.
          </p>

          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-slate-700 text-sm font-medium mb-0.5">Upload your PDF and export to Excel or CSV.</p>
              <p className="text-slate-500 text-sm">No signup required. Free preview before download.</p>
            </div>
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm flex-shrink-0">
              Convert your Kotak statement <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-14">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">How to download your Kotak Bank statement from net banking</h2>
          <ol className="space-y-4">
            {[
              "Log in to Kotak NetBanking at kotak.com.",
              "Navigate to Banking → Savings/Current Account.",
              "Click on Statement.",
              "Select the date range for your statement.",
              "Click Download PDF and save the file.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">How to download your Kotak Bank statement from the mobile app</h2>
          <ol className="space-y-4">
            {[
              "Open the Kotak Mobile Banking app and log in.",
              "Go to Banking → Account Activity.",
              "Select Statement.",
              "Choose Email / Download PDF from the options.",
              "Select the date range and tap confirm to download.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Converting your Kotak Bank statement PDF to Excel</h2>
          <ol className="space-y-4 mb-6">
            {[
              "Download the PDF from the Kotak app or NetBanking.",
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
            <div className="flex-1"><p className="text-slate-700 text-sm">Upload your Kotak Bank PDF and export to Excel free.</p></div>
            <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm flex-shrink-0">
              Convert now <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Common issues and how to fix them</h2>
          <div className="space-y-4">
            {[
              { title: "Statement shows only account summary", fix: "In the Kotak app, select Account Activity rather than just Mini Statement. Choose Statement → Download PDF for the full detailed view." },
              { title: "Date range too large", fix: "Kotak may limit the date range to one year per download. Download in quarterly chunks if you need more than a year of data." },
              { title: "Password-protected PDF", fix: "Kotak Bank PDFs are often password-protected. The password is typically your date of birth in DDMMYYYY format." },
              { title: "Missing transactions at the end of the period", fix: "Check that you selected the correct end date. If transactions are still missing, download a fresh PDF directly from the portal." },
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
          <h3 className="text-xl font-bold mb-2">Ready to convert your Kotak statement?</h3>
          <p className="text-primary-100 text-sm mb-5">Upload your PDF and export to Excel or CSV in seconds.</p>
          <Link href="/app" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm">
            Convert your Kotak statement <ArrowRight size={15} />
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 text-sm">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors">
            <ArrowLeft size={14} /> Back to blog
          </Link>
          <Link href="/blog/convert-bank-statement-pdf-to-excel" className="text-slate-500 hover:text-primary-600 transition-colors">
            Read more about converting bank statements
          </Link>
          <Link href="/banks/in/kotak-mahindra-bank" className="text-slate-500 hover:text-primary-600 transition-colors">
            Kotak Bank converter page
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
