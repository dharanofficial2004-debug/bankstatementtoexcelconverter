"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">
              StatementToExcel
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors
                px-4 py-2 border border-slate-200 rounded-xl hover:border-primary-300 transition-all"
            >
              Login
            </Link>
            <Link href="/app" className="btn-primary text-sm py-2 px-5">
              Try Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/pricing"
                className="text-sm font-medium text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-50"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-50"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/app"
                className="btn-primary text-sm py-2"
                onClick={() => setIsOpen(false)}
              >
                Try Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
