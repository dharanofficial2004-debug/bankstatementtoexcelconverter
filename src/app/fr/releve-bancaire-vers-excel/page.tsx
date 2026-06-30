import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Relevé Bancaire vers Excel — Conversion Instantanée Gratuite",
  description: "Transformez vos relevés bancaires en feuilles Excel éditables. Fonctionne avec toutes les banques françaises et internationales.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/releve-bancaire-vers-excel",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/releve-bancaire-vers-excel",
      "en": "https://bankstatementtoexcelconverter.com/releve-bancaire-vers-excel",
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
          <>Relevé Bancaire vers Excel</>
        }
        subheadline="Transformez vos relevés bancaires en feuilles Excel éditables. Fonctionne avec toutes les banques françaises et internationales."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Le logiciel reconnaît-il les banques automatiquement?</h3>\n              <p className="text-slate-600">Oui, notre système détecte l'institution financière pour appliquer le meilleur modèle d'extraction.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je ajouter des catégories à mes dépenses?</h3>\n              <p className="text-slate-600">L'outil vous permet d'éditer les cellules, vous pouvez donc ajouter des annotations.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Combien de temps prend la conversion?</h3>\n              <p className="text-slate-600">Généralement moins de 5 secondes par page.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Le passage d'un <strong>relevé bancaire vers Excel</strong> est une étape cruciale pour toute analyse financière sérieuse. Que ce soit pour un audit ou pour la gestion de trésorerie, avoir des données structurées est indispensable.</p>\n          <p className="text-slate-600 mb-4">Notre outil de transformation de <strong>relevé bancaire vers Excel</strong> vous assure un résultat propre et prêt à l'emploi. Vous pourrez immédiatement appliquer vos filtres, formules et tableaux croisés dynamiques habituels.</p>\n          <p className="text-slate-600 mb-4">Ne perdez plus de temps avec la saisie manuelle. La transition d'un <strong>relevé bancaire vers Excel</strong> se fait désormais en un seul clic, en toute sécurité.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
