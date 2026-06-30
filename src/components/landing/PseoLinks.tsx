import React from "react";
import Link from "next/link";


export default function PseoLinks() {
  const frenchPages = [
    { href: "/fr", title: "Accueil Français" },
    { href: "/fr/convertisseur-releve-bancaire-excel", title: "Convertisseur Relevé Bancaire Excel" },
    { href: "/fr/convertir-releve-bancaire-en-excel", title: "Convertir Relevé Bancaire en Excel" },
    { href: "/fr/convertir-pdf-releve-bancaire-en-excel", title: "Convertir PDF Relevé Bancaire" },
    { href: "/fr/releve-bancaire-vers-excel", title: "Relevé Bancaire vers Excel" },
    { href: "/fr/pdf-releve-bancaire-vers-excel", title: "PDF Relevé Bancaire vers Excel" },
    { href: "/fr/releve-bancaire-pdf-excel", title: "Relevé Bancaire PDF Excel" },
    { href: "/fr/convertisseur-releve-bancaire", title: "Convertisseur Relevé Bancaire" },
    { href: "/fr/extracteur-releve-bancaire", title: "Extracteur Relevé Bancaire" },
    { href: "/fr/convertisseur-pdf-releve-bancaire", title: "Convertisseur PDF Relevé Bancaire" },
    { href: "/fr/releve-bancaire-csv", title: "Relevé Bancaire CSV" },
  ];

  // Specific indian banks mentioned
  const prominentIndianBanks = [
    { slug: "hdfc-bank", title: "HDFC Bank" },
    { slug: "sbi-bank", title: "State Bank of India" },
    { slug: "icici-bank", title: "ICICI Bank" },
    { slug: "axis-bank", title: "Axis Bank" },
    { slug: "kotak-mahindra-bank", title: "Kotak Mahindra Bank" },
    { slug: "yes-bank", title: "Yes Bank" },
    { slug: "punjab-national-bank", title: "Punjab National Bank" },
    { slug: "bank-of-baroda", title: "Bank of Baroda" },
    { slug: "canara-bank", title: "Canara Bank" },
    { slug: "union-bank", title: "Union Bank of India" },
    { slug: "bank-of-india", title: "Bank of India" },
    { slug: "indusind-bank", title: "IndusInd Bank" },
    { slug: "idfc-first-bank", title: "IDFC First Bank" },
    { slug: "federal-bank", title: "Federal Bank" },
    { slug: "bandhan-bank", title: "Bandhan Bank" },
    { slug: "rbl-bank", title: "RBL Bank" }
  ];

  return (
    <>
      <section className="py-20 px-4 bg-white" aria-label="Indian banks supported">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Supported Indian Banks
          </h2>
          <p className="text-lg text-slate-500 mb-10">
            Convert statements from all major Indian banks to Excel or CSV instantly
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {prominentIndianBanks.map((bank) => (
              <Link
                key={bank.slug}
                href={`/banks/in/${bank.slug}`}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm"
              >
                {bank.title}
              </Link>
            ))}
          </div>

          <Link href="/banks/in" className="text-primary-600 hover:underline font-medium text-lg">
            View all 27 Indian banks supported →
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50" aria-label="French pages available">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Disponible en Français — Banques Françaises
          </h2>
          <p className="text-lg text-slate-500 mb-10">
            Convertissez vos relevés bancaires français en Excel instantanément
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {frenchPages.map((page, idx) => (
              <Link
                key={idx}
                href={page.href}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm"
              >
                {page.title}
              </Link>
            ))}
          </div>

          <Link href="/fr" className="text-primary-600 hover:underline font-medium text-lg">
            Voir toutes les pages françaises →
          </Link>
        </div>
      </section>
    </>
  );
}
