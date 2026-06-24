import React from "react";

export default function ProductPreview() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Preview Container */}
        <div className="relative animate-fade-in-up">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-100/50 via-primary-50/30 to-blue-100/50 rounded-3xl blur-2xl" />

          {/* Browser Window */}
          <div className="relative bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white rounded-md text-xs text-slate-400 border border-slate-200">
                  statementtoexcel.com/app
                </div>
              </div>
            </div>

            {/* Spreadsheet Preview */}
            <div className="overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center h-8 px-3 bg-white border-b border-slate-200 gap-2">
                <div className="w-12 h-5 bg-slate-100 rounded text-[10px] flex items-center justify-center text-slate-500 font-mono">B2</div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex gap-1">
                  {["B", "I", "U"].map((l) => (
                    <div key={l} className="w-6 h-5 flex items-center justify-center text-[10px] text-slate-400 font-bold rounded hover:bg-slate-50">{l}</div>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-medium flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  HDFC Bank detected
                </div>
                <span className="text-[10px] text-slate-400">47 transactions</span>
              </div>

              {/* Grid */}
              <table className="w-full text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="w-8 px-2 py-1.5 text-center text-slate-400 border-r border-b border-slate-200" />
                    {["A", "B", "C", "D", "E", "F"].map((l) => (
                      <th key={l} className="px-3 py-1.5 text-center text-slate-500 font-medium border-r border-b border-slate-200">{l}</th>
                    ))}
                  </tr>
                  <tr className="bg-blue-50/70">
                    <td className="px-2 py-1.5 text-center text-blue-500 font-medium border-r border-b border-slate-200" />
                    {["#", "Date", "Description", "Debit", "Credit", "Balance"].map((h) => (
                      <td key={h} className="px-3 py-1.5 text-blue-800 font-semibold border-r border-b border-blue-200">{h}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 1, d: "01/06/2026", desc: "UPI-HDFC-John Doe-HDFC001", dr: "2,500.00", cr: "", bal: "47,500.00" },
                    { n: 2, d: "02/06/2026", desc: "NEFT-SALARY-ACME Corp", dr: "", cr: "65,000.00", bal: "1,12,500.00" },
                    { n: 3, d: "03/06/2026", desc: "ATM-CASH WITHDRAWAL", dr: "10,000.00", cr: "", bal: "1,02,500.00" },
                    { n: 4, d: "05/06/2026", desc: "POS-AMAZON PURCHASE", dr: "3,299.00", cr: "", bal: "99,201.00" },
                    { n: 5, d: "07/06/2026", desc: "UPI-SWIGGY-FOOD ORDER", dr: "450.00", cr: "", bal: "98,751.00", selected: true },
                    { n: 6, d: "10/06/2026", desc: "IMPS-RENT PAYMENT", dr: "15,000.00", cr: "", bal: "83,751.00" },
                  ].map((row) => (
                    <tr key={row.n} className={`${row.n % 2 === 0 ? "bg-slate-50/50" : "bg-white"} ${row.selected ? "relative" : ""}`}>
                      <td className="px-2 py-1.5 text-center text-slate-400 border-r border-b border-slate-100">{row.n}</td>
                      <td className="px-3 py-1.5 border-r border-b border-slate-100">{row.n}</td>
                      <td className="px-3 py-1.5 border-r border-b border-slate-100">{row.d}</td>
                      <td className={`px-3 py-1.5 border-r border-b border-slate-100 ${row.selected ? "ring-2 ring-blue-500 bg-blue-50/50 relative z-10" : ""}`}>{row.desc}</td>
                      <td className="px-3 py-1.5 text-red-600 border-r border-b border-slate-100">{row.dr}</td>
                      <td className="px-3 py-1.5 text-green-600 border-r border-b border-slate-100">{row.cr}</td>
                      <td className="px-3 py-1.5 text-slate-700 border-b border-slate-100">{row.bal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Status Bar */}
              <div className="flex items-center h-6 px-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500">
                <div className="px-3 py-0.5 bg-white border-t-2 border-t-blue-500 border-x border-slate-200 rounded-t text-slate-700 font-medium -mb-px">Sheet1</div>
                <div className="flex-1" />
                <span>47 rows</span>
              </div>
            </div>
          </div>
        </div>

        {/* Label */}
        <p className="text-center text-sm text-slate-500 mt-6 font-medium">
          Live editable preview — like Google Sheets, inside your browser
        </p>
      </div>
    </section>
  );
}
