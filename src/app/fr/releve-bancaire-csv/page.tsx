import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Relevé Bancaire CSV — Convertisseur PDF vers CSV Gratuit",
  description: "Convertissez vos relevés bancaires PDF en fichier CSV. Parfait pour Excel, QuickBooks, et logiciels comptables. Gratuit.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/releve-bancaire-csv",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/releve-bancaire-csv",
      "en": "https://bankstatementtoexcelconverter.com/releve-bancaire-csv",
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
          <>Relevé Bancaire CSV</>
        }
        subheadline="Convertissez vos relevés bancaires PDF en fichier CSV. Parfait pour Excel, QuickBooks, et logiciels comptables. Gratuit."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Quelle est la différence entre CSV et Excel?</h3>\n              <p className="text-slate-600">Le CSV est un format de texte brut compatible avec tous les logiciels comptables. L'Excel conserve la mise en forme et les couleurs.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Le format CSV fonctionne-t-il avec QuickBooks?</h3>\n              <p className="text-slate-600">Oui, notre format CSV est parfaitement compatible avec QuickBooks, Sage, Xero et Pennylane.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Comment importer le fichier CSV généré dans Excel?</h3>\n              <p className="text-slate-600">Ouvrez Excel, allez dans Fichier → Importer → Sélectionnez votre fichier CSV → Suivez l'assistant d'importation.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Pourquoi convertir votre <strong>relevé bancaire CSV</strong> plutôt qu'en Excel ? Le format CSV est la norme d'importation de la majorité des logiciels de comptabilité français comme Pennylane, Sage ou Cegid.</p>\n          <p className="text-slate-600 mb-4">En transformant votre <strong>relevé bancaire CSV</strong>, vous vous assurez d'une compatibilité maximale pour l'import de vos flux bancaires. Notre outil structure le fichier CSV avec les délimiteurs standards (virgules ou points-virgules) appropriés.</p>\n          <p className="text-slate-600 mb-4">Que vous soyez dirigeant d'entreprise ou comptable, générer un <strong>relevé bancaire CSV</strong> depuis un PDF vous fera gagner de précieuses heures de pointage manuel chaque mois.</p>\n
        </div>
      </section>

      <Footer />
    </div>
  );
}
