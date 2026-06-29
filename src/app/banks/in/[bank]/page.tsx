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
export async function generateMetadata({ params }: BankPageProps): Promise<Metadata> {
  const bank = indianBanks[params.bank];

  if (!bank) {
    return {};
  }

  return {
    title: `${bank.name} Statement to Excel Converter — Free Online Tool`,
    description: `Convert ${bank.name} statement PDF to Excel instantly. Supports NetBanking, Mobile App and Email statements. Live editable preview. Free — no signup needed.`,
    alternates: {
      canonical: `https://bankstatementtoexcelconverter.com/banks/in/${params.bank}`,
    },
  };
}

export default function BankPage({ params }: BankPageProps) {
  const bankSlug = params.bank;
  const bank = indianBanks[bankSlug];

  if (!bank) {
    notFound();
  }

  // Schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${bank.name} Statement to Excel Converter`,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
    "description": `Convert ${bank.name} bank statement PDF to Excel or CSV instantly`,
    "url": `https://bankstatementtoexcelconverter.com/banks/in/${bankSlug}`,
  };

  // Select 6 related banks
  const allBankSlugs = Object.keys(indianBanks);
  const relatedSlugs = allBankSlugs.filter((slug) => slug !== bankSlug).slice(0, 6);

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
              Convert <span className="text-primary-600">{bank.name}</span> Statement to Excel Free
            </>
          }
          subheadline={`Upload your ${bank.name} PDF statement and get a clean editable Excel spreadsheet instantly. Works with all ${bank.name} statement formats.`}
        />

        {/* Section 2 - Working Tool */}
        <div className="-mt-12 mb-20 relative z-10 px-4">
          <ProductPreview />
        </div>

        {/* Section 3 - How To Download */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
              How to Download {bank.name} Statement PDF
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bank.downloadInstructions?.map((method, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
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

        {/* Section 4 - Supported Statement Formats */}
        <section className="py-20 px-4 border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              We support all {bank.name} statement formats
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <ul className="grid sm:grid-cols-2 gap-4 text-left">
                {bank.statementFormats.map((format, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                    <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
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
                <h4 className="font-semibold text-slate-900 mb-2">How do I convert my {bank.name} statement to Excel?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Upload your {bank.name} PDF above. Our tool detects the {bank.name} format automatically and extracts all transactions into a clean editable spreadsheet.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">Does it work with password protected {bank.name} PDFs?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Most {bank.name} statements are password protected with your date of birth or account number. Our tool will securely prompt you for the password if it detects one, allowing seamless extraction.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">How accurate is {bank.name} statement conversion?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Our tool accurately extracts dates, descriptions, debit, credit and balance columns from {bank.name} statements. The live preview lets you verify before downloading.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-2">Can I convert multiple {bank.name} statements at once?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Currently one statement at a time on the free tier. The Pro plan supports bulk conversion of multiple statements simultaneously.</p>
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
              <Link href="/" className="text-primary-600 hover:underline font-medium">
                Back to Homepage
              </Link>
              <Link href="/fr" className="text-primary-600 hover:underline font-medium">
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
