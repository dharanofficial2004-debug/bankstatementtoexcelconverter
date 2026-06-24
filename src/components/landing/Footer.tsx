import React from "react";
import Link from "next/link";
import { FileSpreadsheet, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Logo and Tagline */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <FileSpreadsheet size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                StatementToExcel
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Convert bank statement PDFs to editable Excel files instantly.
              Preview, edit, and export.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield size={14} />
              Secure. Private. PDFs deleted after processing.
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3">
                Product
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/pricing"
                  className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/app"
                  className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  Try Free
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3">
                Legal
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} StatementToExcel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
