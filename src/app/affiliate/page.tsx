import type { Metadata } from "next";
import { ArrowUpRight, Link2, Percent, Users } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Affiliate Program — Earn 20% Commission",
  description: "Recommend Bank Statement to Excel Converter and earn 20% commission on every eligible sale. Join our affiliate program on Affitor.",
  alternates: { canonical: "/affiliate" },
};

const steps = [
  { icon: Users, title: "Join the program", description: "Sign up through Affitor to get started with our affiliate program." },
  { icon: Link2, title: "Share your referral link", description: "Recommend the converter to accountants, bookkeepers, business owners, and anyone who works with bank statements." },
  { icon: Percent, title: "Earn 20% per eligible sale", description: "When someone purchases through your referral link, earn 20% commission on the eligible sale." },
];

export default function AffiliatePage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <section className="mx-auto max-w-5xl px-4 pb-20 pt-28 text-center sm:pt-36">
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-primary-600">Affiliate program</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Share a useful tool.<br />Earn <span className="text-primary-600">20% commission.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Bank Statement to Excel Converter turns PDF bank statements into editable
            Excel spreadsheets and CSV files. Help your audience save time on manual
            data entry and earn 20% commission on every eligible sale you refer.
          </p>
          <a
            href="https://affitor.com/marketplace/bankstatementtoexcel"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
          >
            Join Affiliate Program <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <p className="mt-3 text-sm text-slate-500">Sign up and manage your referrals through Affitor.</p>
        </section>
        <section className="mx-auto max-w-6xl px-4 pb-20" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="mb-8 text-center text-3xl font-bold text-slate-900">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-8">
                <Icon size={28} className="mb-6 text-primary-600" aria-hidden="true" />
                <p className="mb-2 text-sm font-medium text-slate-500">Step {index + 1}</p>
                <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-slate-500">
            Commission applies to eligible, attributed sales under the program terms
            shown in Affitor. Refunded or disputed sales may have their commission reversed.
            Review the program details in Affitor before joining.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
