import { Metadata } from "next";
import Link from "next/link";
import { indianBanks } from "@/lib/indianBanks";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Convert Indian Bank Statements to Excel | Supported Banks",
  description: "View the full list of supported Indian banks for our PDF bank statement to Excel converter. Convert HDFC, SBI, ICICI, and more instantly.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/banks/in",
  },
};

export default function BanksIndexPage() {
  const bankSlugs = Object.keys(indianBanks);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-sm text-primary-700 font-medium mb-6">
              <Building2 size={16} />
              Supported Indian Banks
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
              Convert Any Bank Statement to Excel
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select your bank from the list below to learn how to download your statement PDF and convert it to a clean, editable Excel spreadsheet instantly.
            </p>
          </div>

          {/* Banks Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {bankSlugs.map((slug) => {
              const bank = indianBanks[slug];
              return (
                <Link
                  key={slug}
                  href={`/banks/in/${slug}`}
                  className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.name.charAt(0)}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {bank.name}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {bank.type}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Global CTA */}
          <div className="mt-20 text-center bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Don't see your bank?
            </h2>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
              Our AI-powered converter works with almost any bank statement format globally, even if it's not listed here.
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base">
              Try the Converter Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
