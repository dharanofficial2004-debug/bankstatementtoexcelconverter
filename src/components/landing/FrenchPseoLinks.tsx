import React from "react";
import Link from "next/link";

export default function FrenchPseoLinks() {
  const similarPages = [
    { href: "/fr/convertisseur-releve-bancaire-excel", title: "Convertisseur Excel" },
    { href: "/fr/convertir-releve-bancaire-en-excel", title: "Convertir en Excel" },
    { href: "/fr/convertir-pdf-releve-bancaire-en-excel", title: "Convertir PDF" },
    { href: "/fr/releve-bancaire-vers-excel", title: "Relevé vers Excel" },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Pages Similaires:
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {similarPages.map((page, idx) => (
            <Link 
              key={idx} 
              href={page.href}
              className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              {page.title}
            </Link>
          ))}
        </div>
        <div className="mt-12 flex justify-center gap-6">
          <Link href="/fr" className="text-primary-600 hover:underline font-medium">
            Accueil Français
          </Link>
          <Link href="/" className="text-primary-600 hover:underline font-medium">
            English Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
