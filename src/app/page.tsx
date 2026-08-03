import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import PseoLinks from "@/components/landing/PseoLinks";
import FaqSection from "@/components/landing/FaqSection";

const homeFaqs = [
  {
    question: "Is the preview really free?",
    answer: "Yes. You can upload a statement, review the extracted spreadsheet, and verify the output before paying for any export."
  },
  {
    question: "Can I use this for tax and bookkeeping work?",
    answer: "Absolutely. The exported Excel or CSV files are formatted for reconciliations, cash-flow tracking, tax prep, and QuickBooks imports."
  },
  {
    question: "Do you support international banks?",
    answer: "Yes. The converter supports major Indian, US, UK, and global banks, with more regional banks added regularly."
  },
  {
    question: "Will my PDF data be stored?",
    answer: "No. Files are processed securely and the tool is designed to keep your statements private while you work inside the browser."
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ProductPreview />
      <HowItWorks />
      <BanksList />
      <Testimonials />
      <FaqSection
        title="Questions about converting bank statements into Excel"
        subtitle="Everything you need to know before converting your first PDF statement into a spreadsheet."
        items={homeFaqs}
        variant="cards"
      />
      <PseoLinks />
      <Footer />
    </div>
  );
}
