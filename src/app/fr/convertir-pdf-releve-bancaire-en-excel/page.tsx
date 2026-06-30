import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Convertir PDF Relevé Bancaire en Excel — Rapide et Précis",
  description: "Convertissez vos PDF de relevés bancaires en fichiers Excel propres. Détection automatique du format bancaire. Gratuit.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/convertir-pdf-releve-bancaire-en-excel",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/convertir-pdf-releve-bancaire-en-excel",
      "en": "https://bankstatementtoexcelconverter.com/convertir-pdf-releve-bancaire-en-excel",
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
          <>Convertir PDF Relevé Bancaire en Excel</>
        }
        subheadline="Convertissez vos PDF de relevés bancaires en fichiers Excel propres. Détection automatique du format bancaire. Gratuit."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">La conversion conserve-t-elle les dates exactes?</h3>\n              <p className="text-slate-600">Oui, notre outil reconnaît et formate correctement les dates françaises.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Que faire si mon PDF est protégé par mot de passe?</h3>\n              <p className="text-slate-600">Veuillez déverrouiller ou imprimer en PDF sans mot de passe avant de le télécharger.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je l'utiliser sur mon téléphone?</h3>\n              <p className="text-slate-600">Oui, l'outil fonctionne parfaitement sur mobile et tablette.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">La tâche de <strong>convertir PDF relevé bancaire en Excel</strong> peut vite devenir un cauchemar si on utilise des outils génériques qui détruisent la mise en page. C'est pourquoi nous avons créé un outil spécialisé.</p>\n          <p className="text-slate-600 mb-4">En choisissant de <strong>convertir PDF relevé bancaire en Excel</strong> via notre plateforme, vous bénéficiez d'une technologie IA entraînée spécifiquement sur les formats bancaires. Fini les lignes décalées ou les montants fusionnés avec les dates !</p>\n          <p className="text-slate-600 mb-4">N'hésitez plus à <strong>convertir PDF relevé bancaire en Excel</strong> pour faciliter votre rapprochement bancaire et gagner en productivité au quotidien.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
