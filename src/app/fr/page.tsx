import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Convertisseur Relevé Bancaire Excel Gratuit — Aperçu Éditable En Direct",
  description: "Convertissez votre relevé bancaire PDF en Excel instantanément. Aperçu en direct modifiable avant téléchargement. Fonctionne avec BNP Paribas, Crédit Agricole, Société Générale et 100+ banques. Gratuit — sans inscription.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr",
      "en": "https://bankstatementtoexcelconverter.com",
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

export default function FrenchHomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <Hero 
        badgeText="Gratuit — Sans carte de crédit"
        headline={
          <>
            Convertisseur <span className="gradient-text">Relevé Bancaire Excel</span> Gratuit
          </>
        }
        subheadline="Convertissez votre relevé bancaire PDF en Excel instantanément. Aperçu en direct modifiable avant téléchargement. Gratuit — sans inscription."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Est-ce gratuit?</h3>
              <p className="text-slate-600">Oui, les 3 premières conversions sont gratuites sans inscription.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quelles banques sont supportées?</h3>
              <p className="text-slate-600">Plus de 100 banques dont BNP Paribas, Crédit Agricole, Société Générale et toutes les grandes banques françaises.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mes données sont-elles sécurisées?</h3>
              <p className="text-slate-600">Vos PDF sont traités immédiatement et jamais stockés sur nos serveurs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Le meilleur convertisseur de relevé bancaire vers Excel</h2>
          <p className="text-slate-600 mb-4">
            Si vous cherchez un <strong>convertisseur relevé bancaire Excel gratuit</strong>, vous êtes au bon endroit. Notre outil a été conçu spécifiquement pour les professionnels de la comptabilité, les indépendants et les particuliers en France qui ont besoin de transformer rapidement leurs relevés PDF en données exploitables.
          </p>
          <p className="text-slate-600 mb-4">
            Grâce à notre technologie avancée, ce <strong>convertisseur relevé bancaire Excel</strong> extrait avec précision les dates, les descriptions, les débits et les crédits. L'avantage principal est notre aperçu éditable en direct. Vous n'avez plus besoin de vérifier le fichier après l'avoir téléchargé : vous pouvez corriger d'éventuelles erreurs directement dans votre navigateur.
          </p>
          <p className="text-slate-600">
            Essayez dès maintenant notre <strong>convertisseur de relevé bancaire Excel</strong>. Il prend en charge toutes les grandes institutions financières françaises (Crédit Agricole, BNP Paribas, Société Générale, etc.) et ne nécessite aucune installation de logiciel. Protégez vos données et gagnez un temps précieux lors de votre rapprochement bancaire !
          </p>
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
