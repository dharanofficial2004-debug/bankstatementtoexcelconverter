import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import USFooter from "@/components/landing/USFooter";
import { CheckCircle2, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "US Bank Statement Excel Template — Download & Populate Automatically",
  description:
    "Get a ready-made Excel template for US bank statements. Upload your PDF and our tool populates the template automatically. Works with Chase, BofA, Wells Fargo.",
  alternates: {
    canonical:
      "https://bankstatementtoexcelconverter.com/banks/us/bank-statement-excel-template-usa",
  },
};

const columns = [
  { col: "A", header: "#", type: "Row number", example: "1, 2, 3 …" },
  {
    col: "B",
    header: "Date",
    type: "Date (MM/DD/YYYY)",
    example: "01/15/2026",
  },
  {
    col: "C",
    header: "Description",
    type: "Text",
    example: "DIRECT DEPOSIT - EMPLOYER",
  },
  { col: "D", header: "Debit", type: "Number (USD)", example: "89.99" },
  { col: "E", header: "Credit", type: "Number (USD)", example: "3,200.00" },
  { col: "F", header: "Balance", type: "Number (USD)", example: "12,450.00" },
];

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left: text */}
          <div className="flex-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-4">
              📋 Excel Template — Auto-Populated
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              US Bank Statement Excel Template — Auto-Populated from Your PDF
            </h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Don't waste time creating a spreadsheet from scratch. Upload your
              US bank statement PDF and our tool generates a clean, consistently
              formatted Excel file that follows the same structure every time —
              perfect for month-to-month comparison.
            </p>
            <ul className="space-y-2 mb-7">
              {[
                "Standard 6-column format (US bank compatible)",
                "Numeric values — no string formatting issues",
                "Ready for pivot tables and Excel formulas",
                "Works with 12-month comparisons",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <CheckCircle2 size={15} className="text-blue-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all"
            >
              <Download size={16} /> Generate Excel File
            </Link>
          </div>

          {/* Right: template preview */}
          <div className="flex-1 w-full max-w-sm">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 text-white text-sm font-semibold flex items-center gap-2">
                📊 bank_statement_template.xlsx
              </div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-blue-50">
                    {columns.map((c) => (
                      <th
                        key={c.col}
                        className="px-2 py-2 text-blue-700 font-bold border border-blue-100 text-center"
                      >
                        {c.col}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-50">
                    {columns.map((c) => (
                      <th
                        key={c.header}
                        className="px-2 py-1.5 text-slate-600 font-semibold border border-slate-200 text-center"
                      >
                        {c.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "01/05/26", "TRANSFER", "500", "", "4,800"],
                    ["2", "01/07/26", "DEPOSIT", "", "3,200", "8,000"],
                    ["3", "01/09/26", "AMAZON", "89", "", "7,911"],
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`px-2 py-1.5 border border-slate-100 text-center ${j === 3 ? "text-red-600" : j === 4 ? "text-green-600" : "text-slate-700"}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Column descriptions */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Template Column Reference
          </h2>
          <div className="space-y-3">
            {columns.map((c) => (
              <div
                key={c.col}
                className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  {c.col}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {c.header}{" "}
                    <span className="font-normal text-slate-400">
                      · {c.type}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Example: <span className="font-mono">{c.example}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <USFooter />
    </div>
  );
}
