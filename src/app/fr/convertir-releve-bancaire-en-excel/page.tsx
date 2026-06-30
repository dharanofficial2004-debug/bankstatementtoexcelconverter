import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Convertir Relevé Bancaire en Excel — Outil Gratuit En Ligne",
  description: "Comment convertir votre relevé bancaire en Excel gratuitement. Outil en ligne avec aperçu éditable avant export.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/convertir-releve-bancaire-en-excel",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/convertir-releve-bancaire-en-excel",
      "en": "https://bankstatementtoexcelconverter.com/convertir-releve-bancaire-en-excel",
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
          <>Convertir Relevé Bancaire en Excel</>
        }
        subheadline="Comment convertir votre relevé bancaire en Excel gratuitement. Outil en ligne avec aperçu éditable avant export."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Est-ce difficile de convertir un relevé bancaire en Excel?</h3>\n              <p className="text-slate-600">Non, c'est très simple. Glissez votre fichier et nous nous occupons du reste.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Quels formats d'exportation sont disponibles?</h3>\n              <p className="text-slate-600">Vous pouvez exporter en format Excel (.xlsx) ou CSV.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Mon relevé contient plusieurs pages, est-ce un problème?</h3>\n              <p className="text-slate-600">Notre système gère parfaitement les relevés de plusieurs pages.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Vous cherchez à <strong>convertir relevé bancaire en Excel</strong> ? Vous avez trouvé la solution la plus rapide du marché. De la préparation des déclarations fiscales au simple suivi de budget, la nécessité de manipuler des données bancaires est omniprésente.</p>\n          <p className="text-slate-600 mb-4">Pour <strong>convertir relevé bancaire en Excel</strong>, notre algorithme intelligent identifie automatiquement les colonnes (date, libellé, débit, crédit) spécifiques aux banques françaises comme le Crédit Mutuel ou la Caisse d'Épargne.</p>\n          <p className="text-slate-600 mb-4">Il n'a jamais été aussi facile de <strong>convertir relevé bancaire en Excel</strong>. Téléchargez votre PDF, vérifiez le résultat dans notre tableur intégré, et téléchargez votre fichier parfaitement formaté.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
