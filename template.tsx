import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "__TITLE__",
  description: "__DESCRIPTION__",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/__SLUG__",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/__SLUG__",
      "en": "https://bankstatementtoexcelconverter.com/__SLUG__",
    },
  },
};

const frenchSteps = [
  {
    icon: require("lucide-react").CloudUpload,
    title: "Téléchargez votre PDF",
    description: "Déposez votre relevé bancaire PDF",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: require("lucide-react").Grid3X3,
    title: "Aperçu en direct",
    description: "Visualisez vos transactions dans un tableau éditable",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: require("lucide-react").Download,
    title: "Exportez en Excel ou CSV",
    description: "Téléchargez votre fichier propre en un clic",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

const frenchBanks = [
  "BNP Paribas",
  "Crédit Agricole",
  "Société Générale",
  "La Banque Postale",
  "Crédit Mutuel",
  "Caisse d'Épargne",
  "LCL",
  "HSBC France",
  "Banque Populaire",
  "CIC",
];

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <Hero 
        badgeText="Gratuit — Sans carte de crédit"
        headline={
          <>__H1__</>
        }
        subheadline="__DESCRIPTION__"
        ctaText="Essayer Gratuitement"
        ctaSecondaryText="Comment ça marche"
        trustBadges={[
          "Aperçu gratuit",
          "Éditez avant d'exporter",
          "100+ banques supportées",
          "Aucune donnée stockée",
        ]}
        ctaLink="/app"
      />

      <ProductPreview />

      <HowItWorks 
        title="Comment ça marche"
        subtitle="Trois étapes simples pour convertir n'importe quel relevé bancaire"
        steps={frenchSteps}
      />

      <BanksList 
        title="Fonctionne avec toutes les banques françaises"
        subtitle="Téléchargez votre relevé bancaire PDF — nous nous occupons du reste"
        banks={frenchBanks}
        moreText="+ 100 autres"
      />

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Questions Fréquemment Posées</h2>
          </div>
          <div className="space-y-6">
            __FAQS__
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          __CONTENT__
        </div>
      </section>

      <Footer />
    </div>
  );
}
