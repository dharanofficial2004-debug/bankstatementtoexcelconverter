import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { indianBanks } from "@/lib/indianBanks";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface BankPageProps {
  params: {
    bank: string;
  };
}

// Generate static routes for all banks
export async function generateStaticParams() {
  return Object.keys(indianBanks).map((bank) => ({
    bank: bank,
  }));
}

// Dynamic SEO metadata — updated pattern for all banks
export async function generateMetadata({
  params,
}: BankPageProps): Promise<Metadata> {
  const bank = indianBanks[params.bank];

  if (!bank) {
    return {};
  }

  const title = `${bank.name} Bank Statement to Excel — Convert PDF to Excel Free (2026)`;
  const description = `Convert ${bank.name} bank statement PDF to Excel or CSV free. 99%+ accuracy, no signup required. Works with iBanking/net banking statements. Download instantly →`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.bankstatementtoexcelconverter.com/banks/in/${params.bank}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.bankstatementtoexcelconverter.com/banks/in/${params.bank}`,
      siteName: "StatementToExcel",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default function BankPage({ params }: BankPageProps) {
  const bankSlug = params.bank;
  const bank = indianBanks[bankSlug];

  if (!bank) {
    notFound();
  }

  // Select related banks (exclude current, pick up to 6)
  const allBankSlugs = Object.keys(indianBanks);
  const relatedSlugs = allBankSlugs.filter((slug) => slug !== bankSlug).slice(0, 6);

  // Blog post slug for this bank (if it exists)
  const blogPostSlugs: Record<string, string> = {
    "icici-bank": "/blog/how-to-download-icici-bank-statement-in-excel",
    "canara-bank": "/blog/how-to-download-canara-bank-statement-in-excel",
    "union-bank": "/blog/how-to-download-union-bank-statement-in-excel",
    "kotak-mahindra-bank": "/blog/how-to-download-kotak-bank-statement-in-excel",
    "hdfc-bank": "/blog/how-to-download-hdfc-bank-statement-in-excel",
  };
  const blogPostSlug = blogPostSlugs[bankSlug];

  const faqs = [
    {
      q: `How do I convert my ${bank.name} statement to Excel?`,
      a: `Download your ${bank.name} statement as a PDF from NetBanking or the mobile app, then upload it to our converter. Review the extracted transactions and export to Excel or CSV.`,
    },
    {
      q: `Does ${bank.name} offer a direct Excel download?`,
      a: `Most Indian banks, including ${bank.name}, provide statements only as PDF. Use our converter to turn the PDF into an editable Excel or CSV file.`,
    },
    {
      q: `Is it safe to upload my ${bank.name} PDF to an online converter?`,
      a: `All uploads are encrypted with SSL. Files are deleted after processing and are never stored permanently or shared with third parties.`,
    },
    {
      q: `Does it work with password-protected ${bank.name} PDFs?`,
      a: `Yes. Our converter will prompt you for the password if the PDF is protected — typically your date of birth or account number.`,
    },
    {
      q: `Can I use the converted Excel file for a loan or visa application?`,
      a: `For official purposes, always submit the original ${bank.name} PDF. The Excel export is for your analysis and preparation.`,
    },
    {
      q: `What columns does the Excel output include?`,
      a: `The converted file includes Date, Description, Debit, Credit, and Balance columns — clean, no merged cells, ready for accounting or import.`,
    },
    {
      q: `Is Excel or CSV better for ${bank.name} statements?`,
      a: `Excel is better for analysis and reports. CSV is better for importing into accounting tools like Tally, Zoho Books, or QuickBooks.`,
    },
  ];

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${bank.name} Bank Statement to Excel Converter`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    description: `Convert ${bank.name} bank statement PDF to Excel or CSV instantly`,
    url: `https://www.bankstatementtoexcelconverter.com/banks/in/${bankSlug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bankstatementtoexcelconverter.com" },
      { "@type": "ListItem", position: 2, name: "India", item: "https://www.bankstatementtoexcelconverter.com/banks/in" },
      { "@type": "ListItem", position: 3, name: `${bank.name} Banks`, item: `https://www.bankstatementtoexcelconverter.com/banks/in/${bankSlug}` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <header className="pt-32 pb-16 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
                <li><Link href="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
                <li aria-hidden="true" className="text-slate-300">/</li>
                <li><Link href="/banks/in" className="hover:text-primary-600 transition-colors">India</Link></li>
                <li aria-hidden="true" className="text-slate-300">/</li>
                <li className="text-slate-700 font-medium">{bank.name}</li>
              </ol>
            </nav>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
              {bank.name} Bank Statement to Excel
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
              Convert your {bank.name} statement PDF to Excel or CSV. Upload the file, review transactions in an editable table, and export a clean spreadsheet.
            </p>

            {/* Hero benefits */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                "Preview and edit before export",
                "Excel and CSV downloads",
                "Works with PDF bank statements",
                "Keep your original PDF for verification",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                  <CheckCircle2 size={14} className="text-success-600 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25 text-base"
            >
              Upload {bank.name} Statement PDF <ArrowRight size={18} />
            </Link>
          </div>
        </header>

        {/* How to download */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10">
              How to download your {bank.name} statement
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bank.downloadInstructions?.map((method, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    {method.title}
                  </h3>
                  <ul className="space-y-3">
                    {method.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex items-start gap-3 text-slate-600 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-medium text-xs">
                          {stepIdx + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to convert */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              How to convert your {bank.name} statement to Excel
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title: "Download statement as PDF",
                  desc: `Log into ${bank.name} NetBanking or mobile app and download your account statement as a PDF.`,
                },
                {
                  step: 2,
                  title: "Upload the PDF",
                  desc: "Click the upload button, select your bank statement PDF, and wait a few seconds for processing.",
                },
                {
                  step: 3,
                  title: "Review and edit transactions",
                  desc: "Check the editable preview table. Correct any values if needed before downloading.",
                },
                {
                  step: 4,
                  title: "Export to Excel or CSV",
                  desc: "Download a clean .xlsx or .csv file ready for accounting, tax, or loan applications.",
                },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/app" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25">
                Upload {bank.name} Statement PDF <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Supported formats */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              Supported {bank.name} statement formats
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <ul className="grid sm:grid-cols-2 gap-4 text-left">
                {bank.statementFormats.map((format, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 size={18} className="text-success-500 flex-shrink-0" />
                    {bank.name} {format}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              Why people convert {bank.name} statements to Excel
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Home loans and personal loans", desc: "Banks and NBFCs ask for structured statement data. Export a clean spreadsheet from your PDF in seconds." },
                { title: "Income tax returns (ITR)", desc: "Organize income and expenses for ITR filing or CA review. Export to Excel and categorize by month." },
                { title: "Visa applications", desc: "Many visa categories require recent bank statements. An organized spreadsheet helps present the data clearly." },
                { title: "Bookkeeping and reconciliation", desc: "Match transactions against your accounts without manual entry. Import CSV into Tally, Zoho, or QuickBooks." },
                { title: "Cash flow analysis", desc: "Analyze monthly spending and income in an editable spreadsheet. Filter by date or transaction type." },
                { title: "Personal budgeting", desc: "Understand where your money goes each month with an editable Excel breakdown." },
              ].map((uc) => (
                <div key={uc.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2">{uc.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common issues */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              Common issues and solutions
            </h2>
            <div className="space-y-4">
              {[
                { title: "Password-protected PDF", fix: `${bank.name} PDFs are often protected with your date of birth (DDMMYYYY) or account number. Our converter will prompt you if it detects a password.` },
                { title: "Missing pages or transactions", fix: "If the PDF appears incomplete, download a fresh copy from the bank's official app or portal. Try a shorter date range if the statement is very long." },
                { title: "Scanned or image-based PDF", fix: `Most ${bank.name} statements are text-based PDFs. If yours looks like an image, download a fresh copy from the official channel. Our converter uses OCR for scanned files, but accuracy is best on text PDFs.` },
                { title: "Large file taking long to process", fix: "For statements over 50 pages, try splitting the PDF into 3-month chunks. Each segment will process faster and can be combined later." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2 text-base">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2 text-base">{faq.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 px-4 bg-primary-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Convert your {bank.name} statement now
            </h2>
            <p className="text-primary-100 mb-6">
              Upload your PDF, review transactions in a live editable table, and export to Excel or CSV.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Upload {bank.name} Statement PDF <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Related banks */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Also works with:
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {relatedSlugs.map((slug) => {
                const b = indianBanks[slug];
                return (
                  <Link
                    key={slug}
                    href={`/banks/in/${slug}`}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm hover:border-primary-300"
                  >
                    {b.name}
                  </Link>
                );
              })}
            </div>

            {/* Internal links */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/banks/in" className="text-primary-600 hover:underline font-medium">
                All India Banks
              </Link>
              <Link href="/blog/convert-bank-statement-pdf-to-excel" className="text-primary-600 hover:underline font-medium">
                Guide: Convert Bank Statement PDF to Excel
              </Link>
              {blogPostSlug && (
                <Link href={blogPostSlug} className="text-primary-600 hover:underline font-medium">
                  How to download {bank.name} statement in Excel
                </Link>
              )}
              <Link href="/" className="text-primary-600 hover:underline font-medium">
                Bank Statement to Excel Converter
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
