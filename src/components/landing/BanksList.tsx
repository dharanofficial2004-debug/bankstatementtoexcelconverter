import React from "react";

const defaultBanks = [
  "HDFC",
  "SBI",
  "ICICI",
  "Axis",
  "Kotak",
  "Chase",
  "Barclays",
  "HSBC",
  "GTBank",
  "BDO",
  "Zenith Bank",
  "Wells Fargo",
  "Bank of America",
  "South Indian Bank",
];

interface BanksListProps {
  title?: string;
  subtitle?: string;
  banks?: string[];
  moreText?: string;
}

export default function BanksList({
  title = "Works with all major banks",
  subtitle = "From personal checking accounts to business statements, our converter handles high-volume PDFs across global banks and regional formats.",
  banks = defaultBanks,
  moreText = "+ 100 more supported",
}: BanksListProps) {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
            Broad bank coverage
          </p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {banks.map((bank) => (
            <div
              key={bank}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              {bank}
            </div>
          ))}
          <div className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
            {moreText}
          </div>
        </div>
      </div>
    </section>
  );
}
