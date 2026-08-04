import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { indianBanks } from "@/lib/indianBanks";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import Footer from "@/components/landing/Footer";

interface BankPageProps {
  params: {
    bank: string;
  };
}

// Generate static routes for all 27 banks
export async function generateStaticParams() {
  return Object.keys(indianBanks).map((bank) => ({
    bank: bank,
  }));
}

// Dynamic SEO metadata for each bank
export async function generateMetadata({
  params,
}: BankPageProps): Promise<Metadata> {
  const bank = indianBanks[params.bank];

  if (!bank) {
    return {};
  }

  const isCanaraBank = params.bank === "canara-bank";
  const title = isCanaraBank
    ? "How to Download Canara Bank Statement in Excel Format (Step-by-Step Guide)"
    : `${bank.name} Statement to Excel Converter — Free Online Tool`;
  const description = isCanaraBank
    ? "Canara Bank does not provide a direct Excel download. Learn how to download your Canara Bank statement as a PDF and convert it to Excel free, in seconds, with our online tool."
    : `Convert ${bank.name} statement PDF to Excel instantly. Supports NetBanking, Mobile App and Email statements. Live editable preview. Free — no signup needed.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://bankstatementtoexcelconverter.com/banks/in/${params.bank}`,
    },
  };
}

export default function BankPage({ params }: BankPageProps) {
  const bankSlug = params.bank;
  const bank = indianBanks[bankSlug];
  const isCanaraBank = bankSlug === "canara-bank";

  if (!bank) {
    notFound();
  }

  // Schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${bank.name} Statement to Excel Converter`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: `Convert ${bank.name} bank statement PDF to Excel or CSV instantly`,
    url: `https://bankstatementtoexcelconverter.com/banks/in/${bankSlug}`,
  };

  // Select 6 related banks
  const allBankSlugs = Object.keys(indianBanks);
  const relatedSlugs = allBankSlugs
    .filter((slug) => slug !== bankSlug)
    .slice(0, 6);

  // CTA copy — keyword-rich for Canara Bank, generic for all other banks
  const primaryCtaLabel = isCanaraBank
    ? "Convert Canara Bank Statement to Excel Free"
    : "Try free";
  const secondaryCtaLabel = isCanaraBank
    ? "Upload PDF & Get Excel Instantly"
    : "Try free";

  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-grow">
        {/* Section 1 - Hero */}
        <Hero
          headline={
            <>
              How to Download{" "}
              <span className="text-primary-600">{bank.name}</span> Statement in
              Excel Format (Step-by-Step Guide)
            </>
          }
          subheadline={
            isCanaraBank
              ? "Canara Bank does not provide a direct Excel download — statements are only available as PDF from the app or net banking portal. To get an Excel file, download the PDF first, then convert your Canara Bank statement to Excel using our free online tool in seconds."
              : `Download your ${bank.name} statement PDF and convert it into a clean Excel spreadsheet in minutes.`
          }
        />

        {/* Section 2 - Direct answer + guide */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-3">
                Quick answer
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {isCanaraBank
                  ? "Can I download Canara Bank statement in Excel format?"
                  : `Can I download ${bank.name} statement in Excel format?`}
              </h2>
              <p className="text-lg text-slate-600 leading-8">
                {isCanaraBank
                  ? "No — Canara Bank does not offer a direct Excel download option for account statements. The bank only lets you download statements as PDF from NetBanking or the mobile app. That's exactly why users search for how to download Canara Bank statement in Excel format: the real answer is to download the PDF and then use a converter. Once you have the PDF, you can convert Canara Bank statement to Excel in a few clicks with our free tool below."
                  : `You can usually download your ${bank.name} statement as a PDF from the app or net banking portal. If you need an editable spreadsheet, convert the PDF into Excel with our tool.`}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-2xl font-semibold text-slate-900 mb-5">
                  How to Download Canara Bank Statement in Excel Format from App
                </h3>
                <ol className="space-y-4 text-slate-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                      1
                    </span>
                    <span>
                      Open the official {bank.name} mobile app or net banking
                      portal and sign in securely.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                      2
                    </span>
                    <span>
                      Go to Accounts, Statements, or Account Statement and
                      choose the date range you need.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                      3
                    </span>
                    <span>
                      Download the statement as PDF and save it on your phone or
                      computer.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-sm">
                      4
                    </span>
                    <span>
                      Upload the file to our converter to get an editable Excel
                      sheet for your records or tax work.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-2xl font-semibold text-slate-900 mb-5">
                  Canara Bank Statement Excel Download (Easy Step-by-Step
                  Method)
                </h3>
                <p className="text-slate-600 leading-7 mb-4">
                  {isCanaraBank
                    ? "Canara Bank statement excel download is not available directly from the bank. It's done in two steps: first download the PDF from the app or net banking portal, then convert Canara Bank statement to Excel using an online converter. This gives you an editable spreadsheet you can sort, filter, and use for reporting or tax work."
                    : `Many banks offer statements in PDF by default because it is easier to preserve formatting, security, and legal record standards.`}
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      PDF files are easier to share and preserve for banking
                      records.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      Excel files need structured table extraction, which is why
                      conversion tools are helpful.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      Our converter helps you turn a downloaded statement into
                      an editable spreadsheet without manual entry.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bank.downloadInstructions?.map((method, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    {method.title}
                  </h3>
                  <ul className="space-y-3">
                    {method.steps.map((step, stepIdx) => (
                      <li
                        key={stepIdx}
                        className="flex items-start gap-3 text-slate-600 text-sm"
                      >
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

        {/* Section 2b - NEW: Full process section (Canara Bank only) */}
        {isCanaraBank && (
          <section className="py-20 px-4 border-t border-slate-100">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-3">
                Complete guide
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Download Canara Bank Statement Online (Full Process)
              </h2>
              <p className="text-lg text-slate-600 leading-8 mb-8">
                Here is the complete process to download Canara Bank statement
                online and turn it into a spreadsheet — from logging into your
                account to getting a ready-to-use Excel file.
              </p>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Step 1: Log in to Canara Bank NetBanking or the Canara ai1
                    app
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Use your NetBanking credentials or the Canara ai1 mobile app
                    to sign in securely to your account.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Step 2: Open the Account Statement section
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Select the account you want a statement for, then choose a
                    date range — for example, last month, last 3 months, or a
                    custom period.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Step 3: Download the statement as PDF
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Canara Bank generates the statement as a PDF file. Save it
                    to your device — this is the file you'll use for conversion.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Step 4: Convert Canara Bank statement to Excel
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Upload the PDF to our free converter. It automatically
                    detects the Canara Bank format and extracts every
                    transaction into a clean, editable spreadsheet — no manual
                    typing required.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Step 5: Review and download your Excel file
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Check the live preview to confirm dates, amounts, and
                    balances are correct, then download the finished Excel file
                    for bookkeeping, budgeting, or tax filing.
                  </p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
                >
                  Upload PDF & Get Excel Instantly
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Section 3 - Working Tool */}
        <section className="py-20 px-4 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-3">
                  Try free
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Canara Bank Statement Convert to Excel Online
                </h2>
                <p className="text-lg text-slate-600 leading-8">
                  Upload your downloaded Canara Bank PDF and convert Canara Bank
                  statement to Excel free in seconds. The tool is fast,
                  accurate, secure, and beginner-friendly.
                </p>
              </div>
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                {primaryCtaLabel}
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {[
                "Fast conversion",
                "Accurate transaction extraction",
                "Secure and private",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {benefit}
                </div>
              ))}
            </div>
            <div className="-mt-6 relative z-10 px-4">
              <ProductPreview
                detectedBankName={isCanaraBank ? "Canara Bank" : bank.name}
              />
            </div>
            <p className="mt-8 text-center text-sm text-slate-600">
              Convert Canara Bank Statement to Excel Free and use the same
              method for SBI, HDFC, ICICI, Axis, and other banks.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full border border-primary-600 px-6 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4 - Supported Statement Formats */}
        <section className="py-20 px-4 border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              We support all {bank.name} statement formats
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <ul className="grid sm:grid-cols-2 gap-4 text-left">
                {bank.statementFormats.map((format, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-slate-700 font-medium"
                  >
                    <svg
                      className="w-5 h-5 text-success-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {bank.name} {format}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5 - FAQ */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">
                  {isCanaraBank
                    ? "Does Canara Bank provide statements in Excel format directly?"
                    : `How do I convert my ${bank.name} statement to Excel?`}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {isCanaraBank
                    ? "No. Canara Bank only provides statements as PDF from NetBanking or the mobile app. To get an Excel file, download the PDF and convert Canara Bank statement to Excel using our free online tool — it takes seconds and needs no signup."
                    : `Upload your ${bank.name} PDF above. Our tool detects the ${bank.name} format automatically and extracts all transactions into a clean editable spreadsheet.`}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Does it work with password protected {bank.name} PDFs?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Most {bank.name} statements are password protected with your
                  date of birth or account number. Our tool will securely prompt
                  you for the password if it detects one, allowing seamless
                  extraction.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">
                  How accurate is {bank.name} statement conversion?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our tool accurately extracts dates, descriptions, debit,
                  credit and balance columns from {bank.name} statements. The
                  live preview lets you verify before downloading.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Can I convert multiple {bank.name} statements at once?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Currently one statement at a time on the free tier. The Pro
                  plan supports bulk conversion of multiple statements
                  simultaneously.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 - Related Banks */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Also works with:
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {relatedSlugs.map((slug) => {
                const b = indianBanks[slug];
                return (
                  <Link
                    key={slug}
                    href={`/banks/in/${slug}`}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    {b.name}
                  </Link>
                );
              })}
            </div>
            <div className="mt-12 flex justify-center gap-6">
              <Link
                href="/"
                className="text-primary-600 hover:underline font-medium"
              >
                Back to Homepage
              </Link>
              <Link
                href="/fr"
                className="text-primary-600 hover:underline font-medium"
              >
                Convertisseur de Relevé Bancaire (Français)
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
