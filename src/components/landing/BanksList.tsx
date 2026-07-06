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
  subtitle = "Upload any bank statement PDF — we handle the rest",
  banks = defaultBanks,
  moreText = "+ 100 more",
}: BanksListProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-slate-500 mb-10">
          {subtitle}
        </p>

        {/* Bank pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {banks.map((bank) => (
            <div
              key={bank}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full
                text-sm font-medium text-slate-700
                hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700
                transition-all duration-200 cursor-default
                shadow-sm"
            >
              {bank}
            </div>
          ))}
          <div className="px-4 py-2 bg-primary-50 border border-primary-200 rounded-full
            text-sm font-semibold text-primary-700 shadow-sm">
            {moreText}
          </div>
        </div>
      </div>
    </section>
  );
}
