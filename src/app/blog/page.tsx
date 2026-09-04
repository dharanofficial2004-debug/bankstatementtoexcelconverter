import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Blog — Bank Statement to Excel & CSV Guides",
  description:
    "Practical guides on converting bank statement PDFs to Excel and CSV, preparing data for accounting, and avoiding common extraction errors.",
  alternates: {
    canonical: "https://www.bankstatementtoexcelconverter.com/blog",
  },
  openGraph: {
    title: "Blog — Bank Statement to Excel & CSV Guides",
    description:
      "Practical guides on converting bank statement PDFs to Excel and CSV, preparing data for accounting, and avoiding common extraction errors.",
    url: "https://www.bankstatementtoexcelconverter.com/blog",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "website",
  },
};

const posts = [
  {
    slug: "/blog/convert-bank-statement-pdf-to-excel",
    title: "How to Convert a Bank Statement PDF to Excel (Step-by-Step)",
    description:
      "Compare copy‑paste, Excel Power Query, and dedicated converters. Learn when to use each method, how to handle scanned statements, and how to validate the result before using it for accounting.",
  },
  {
    slug: "/blog/how-to-download-icici-bank-statement-in-excel",
    title: "How to Download ICICI Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Learn how to download your ICICI bank statement in Excel format from net banking and the mobile app, and how to convert the PDF to Excel for loans, accounting, and reconciliation.",
  },
  {
    slug: "/blog/how-to-download-canara-bank-statement-in-excel",
    title: "How to Download Canara Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Step-by-step guide to download Canara Bank statements in Excel format, plus tips to convert the PDF to a clean spreadsheet for analysis and accounting.",
  },
  {
    slug: "/blog/how-to-download-hdfc-bank-statement-in-excel",
    title: "How to Download HDFC Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Download your HDFC Bank statement from NetBanking or the HDFC Mobile app and convert the PDF to Excel for home loan applications, ITR filing, and bookkeeping.",
  },
  {
    slug: "/blog/how-to-download-union-bank-statement-in-excel",
    title: "How to Download Union Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Step-by-step guide to download Union Bank of India statements using the Vyom app or NetBanking, plus how to convert the PDF to Excel.",
  },
  {
    slug: "/blog/how-to-download-kotak-bank-statement-in-excel",
    title: "How to Download Kotak Mahindra Bank Statement in Excel Format (Step-by-Step)",
    description:
      "Download your Kotak Mahindra Bank statement from the Kotak mobile app or NetBanking and convert it to Excel for tax filing, analysis, or accounting.",
  },
];

export default function BlogIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "StatementToExcel Blog",
    url: "https://www.bankstatementtoexcelconverter.com/blog",
    description:
      "Practical guides on converting bank statement PDFs to Excel and CSV, preparing data for accounting, and avoiding common extraction errors.",
    publisher: {
      "@type": "Organization",
      name: "StatementToExcel",
      url: "https://bankstatementtoexcelconverter.com",
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-medium mb-5">
            <BookOpen size={14} />
            Guides &amp; Tutorials
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Blog
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Step-by-step guides to turn bank statement PDFs into clean Excel or
            CSV files, avoid formatting traps, and prepare data for accounting
            and reconciliation.
          </p>
        </div>
      </section>

      {/* Post list */}
      <main className="max-w-3xl mx-auto px-4 py-14">
        <ul className="space-y-6" role="list">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="group rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 hover:border-primary-200 hover:shadow-sm transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-3">
                  <Link href={post.slug}>{post.title}</Link>
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
                  {post.description}
                </p>
                <Link
                  href={post.slug}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Read more <ArrowRight size={15} />
                </Link>
              </article>
            </li>
          ))}
        </ul>

        {/* Internal links */}
        <div className="mt-14 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-600">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Convert your bank statement now <ArrowRight size={14} />
          </Link>
          <span className="hidden sm:inline text-slate-300">·</span>
          <Link
            href="/"
            className="hover:text-primary-600 transition-colors"
          >
            Bank Statement to Excel Converter
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
