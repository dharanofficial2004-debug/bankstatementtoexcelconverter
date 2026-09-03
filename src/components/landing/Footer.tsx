import React from "react";
import Link from "next/link";
import { FileSpreadsheet, Shield, PlayCircle } from "lucide-react";
import { usBanks } from "@/lib/usBanks";

const featuredUSBanks = [
  "chase-bank",
  "bank-of-america",
  "wells-fargo",
  "citibank",
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid gap-10 xl:grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-200">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">
                  StatementToExcel
                </p>
                <p className="text-sm text-slate-500">
                  Convert bank statement PDFs to editable Excel files with live
                  previews and fast exports.
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield size={16} className="text-slate-400" />
              Secure conversion, no PDF data retained after processing.
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 uppercase tracking-[0.18em] mb-4">
              Product
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <Link
                href="/pricing"
                className="block hover:text-primary-600 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/app"
                className="block hover:text-primary-600 transition-colors"
              >
                Try free
              </Link>
              <Link
                href="/blog"
                className="block hover:text-primary-600 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="https://www.youtube.com/@smartpost_sheduler"
                className="inline-flex items-center gap-2 hover:text-primary-600 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <PlayCircle size={14} className="text-red-600" />
                YouTube channel
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 uppercase tracking-[0.18em] mb-4">
              U.S. Banks
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              {featuredUSBanks.map((slug) => {
                const bank = usBanks[slug];
                if (!bank) return null;
                return (
                  <Link
                    key={slug}
                    href={`/banks/us/${slug}`}
                    className="block hover:text-primary-600 transition-colors"
                  >
                    {bank.name}
                  </Link>
                );
              })}
              <Link
                href="/banks/us"
                className="block hover:text-primary-600 transition-colors"
              >
                View all U.S. banks →
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 uppercase tracking-[0.18em] mb-4">
              Contact
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <a
                href="mailto:dharan.official.2004@gmail.com"
                className="block hover:text-primary-600 transition-colors"
              >
                dharan.official.2004@gmail.com
              </a>
              <Link
                href="/pdf-to-excel-bank-statement"
                className="block hover:text-primary-600 transition-colors"
              >
                Help & FAQ
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 uppercase tracking-[0.18em] mb-4">
              Sitemaps
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <Link
                href="/sitemap.xml"
                className="block hover:text-primary-600 transition-colors"
              >
                Main sitemap
              </Link>
              <Link
                href="/fr/sitemap.xml"
                className="block hover:text-primary-600 transition-colors"
              >
                French sitemap
              </Link>
              <Link
                href="/banks/us/sitemap.xml"
                className="block hover:text-primary-600 transition-colors"
              >
                U.S. sitemap
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 uppercase tracking-[0.18em] mb-4">
              Français
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <Link
                href="/fr"
                className="block hover:text-primary-600 transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/fr/convertisseur-releve-bancaire-excel"
                className="block hover:text-primary-600 transition-colors"
              >
                Convertisseur Excel
              </Link>
              <Link
                href="/fr/releve-bancaire-csv"
                className="block hover:text-primary-600 transition-colors"
              >
                Relevé Bancaire CSV
              </Link>
              <Link
                href="/fr"
                className="block hover:text-primary-600 transition-colors"
              >
                Voir tout →
              </Link>
              <Link
                href="/es/bancos"
                className="block hover:text-primary-600 transition-colors"
              >
                Conversor en español
              </Link>
              <Link
                href="/pt-br/bancos"
                className="block hover:text-primary-600 transition-colors"
              >
                Conversor em português
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} StatementToExcel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
