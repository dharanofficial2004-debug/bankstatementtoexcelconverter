import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "US Bank Statement to CSV — Convert PDF to CSV Online Free",
  description:
    "Convert your US bank statement PDF to CSV format online. Perfect for QuickBooks, Excel, Google Sheets, and accounting software. Free preview. Starts at $1.",
  alternates: {
    canonical:
      "https://bankstatementtoexcelconverter.com/banks/us/bank-statement-csv-usa",
  },
};

const csvUses = [
  {
    app: "QuickBooks Online",
    desc: "Banking → Upload transactions → Select CSV → Map Date, Description, Amount",
  },
  {
    app: "QuickBooks Desktop",
    desc: "Banking → Bank Feeds → Import Web Connect → Use CSV IIF format",
  },
  {
    app: "Xero",
    desc: "Bank Accounts → Import Statement → Upload CSV → Map columns",
  },
  {
    app: "FreshBooks",
    desc: "Reports → Import Bank Transactions → Upload CSV",
  },
  {
    app: "Wave Accounting",
    desc: "Banking → Connected Accounts → Upload Statement → CSV format",
  },
  {
    app: "Google Sheets",
    desc: "File → Import → Upload CSV → comma-separated → auto-detect",
  },
  { app: "Excel", desc: "Data → Get Data → From Text/CSV → open CSV directly" },
  {
    app: "Mint / YNAB",
    desc: "Import transactions → Upload CSV → map your columns",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero — full-width dark banner */}
      <section className="pt-32 pb-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block mb-4">
            US Bank Statement Converter
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Convert US Bank Statement PDF to{" "}
            <span className="text-blue-400">CSV</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            CSV files are the universal format for accounting software. Convert
            your Chase, Bank of America, or Wells Fargo PDF — then import
            directly into QuickBooks, Xero, FreshBooks, or any spreadsheet app.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              "Free preview",
              "UTF-8 BOM encoded",
              "QuickBooks ready",
              "From $1",
            ].map((b) => (
              <span
                key={b}
                className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300"
              >
                {b}
              </span>
            ))}
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <Download size={17} /> Export to CSV Free
          </Link>
        </div>
      </section>

      {/* CSV column format */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            What the CSV Output Looks Like
          </h2>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 font-mono text-sm overflow-x-auto">
            <div className="text-slate-400 mb-2 text-xs">
              # Example output from a Chase checking statement
            </div>
            <div className="text-blue-700 font-bold">
              #,Date,Description,Debit,Credit,Balance
            </div>
            <div className="text-slate-700">
              1,01/05/2026,CHASE ONLINE TRANSFER,500.00,,4800.00
            </div>
            <div className="text-slate-700">
              2,01/07/2026,DIRECT DEPOSIT - EMPLOYER,,3200.00,8000.00
            </div>
            <div className="text-slate-700">
              3,01/09/2026,AMAZON MARKETPLACE,89.99,,7910.01
            </div>
            <div className="text-slate-700">
              4,01/12/2026,ZELLE TRANSFER - RENT,1500.00,,6410.01
            </div>
            <div className="text-slate-400 mt-2 text-xs">
              # UTF-8 BOM encoded for Excel compatibility
            </div>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Our CSV uses a UTF-8 BOM header so it opens
              correctly in Microsoft Excel without any encoding issues — a
              common problem with US bank statement exports.
            </p>
          </div>
        </div>
      </section>

      {/* App compatibility table */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            CSV Import Instructions by App
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {csvUses.map((u) => (
              <div
                key={u.app}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
              >
                <p className="font-bold text-slate-900 text-sm mb-2">{u.app}</p>
                <p className="text-xs text-slate-500">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-14 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Related US Tools
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                href: "/banks/us/bank-statement-to-excel-usa",
                label: "Bank Statement to Excel",
              },
              {
                href: "/banks/us/quickbooks-bank-statement-import",
                label: "QuickBooks Import",
              },
              {
                href: "/banks/us/free-bank-statement-converter-usa",
                label: "Free Converter",
              },
              { href: "/banks/us", label: "All US Banks" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
