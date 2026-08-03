import React from "react";
import Link from "next/link";
import { FileSpreadsheet, Shield } from "lucide-react";
import { usBanks } from "@/lib/usBanks";

export default function USFooter() {
  const bankSlugs = Object.keys(usBanks);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileSpreadsheet size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">StatementToExcel</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Convert US bank statement PDFs to Excel, CSV, or JSON instantly. Works with all major American banks.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Shield size={13} />
              Secure · Private · No data stored
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-10">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
              <div className="flex flex-col gap-2">
                <Link href="/app" className="text-sm text-slate-400 hover:text-white transition-colors">Try Free</Link>
                <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/banks/us" className="text-sm text-slate-400 hover:text-white transition-colors">US Banks</Link>
                <Link href="/banks/in" className="text-sm text-slate-400 hover:text-white transition-colors">Indian Banks</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Use Cases</h4>
              <div className="flex flex-col gap-2">
                <Link href="/bank-statement-to-excel" className="text-sm text-slate-400 hover:text-white transition-colors">Bank Statement to Excel</Link>
                <Link href="/bank-statement-to-csv" className="text-sm text-slate-400 hover:text-white transition-colors">Bank Statement to CSV</Link>
                <Link href="/banks/us/quickbooks-bank-statement-import" className="text-sm text-slate-400 hover:text-white transition-colors">QuickBooks Import</Link>
                <Link href="/banks/us/bank-statement-for-taxes" className="text-sm text-slate-400 hover:text-white transition-colors">Tax Preparation</Link>
              </div>
            </div>
          </div>
        </div>

        {/* All US bank links */}
        <div className="border-t border-slate-800 pt-10 mb-10">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">All US Banks</h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {bankSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/banks/us/${slug}`}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
              >
                {usBanks[slug].name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} StatementToExcel. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="#" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
