import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Relevé Bancaire PDF Excel — Convertisseur Gratuit En Ligne",
  description: "Convertissez vos relevés bancaires PDF en Excel. Compatible avec BNP, Crédit Agricole, Société Générale, La Banque Postale.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/releve-bancaire-pdf-excel",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/releve-bancaire-pdf-excel",
      "en": "https://bankstatementtoexcelconverter.com/releve-bancaire-pdf-excel",
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
          <>Relevé Bancaire PDF Excel</>
        }
        subheadline="Convertissez vos relevés bancaires PDF en Excel. Compatible avec BNP, Crédit Agricole, Société Générale, La Banque Postale."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Le format est-il compatible avec Mac?</h3>\n              <p className="text-slate-600">Oui, le fichier Excel fonctionne parfaitement avec Numbers ou Excel pour Mac.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Y a-t-il une limite de taille de fichier?</h3>\n              <p className="text-slate-600">Vous pouvez télécharger des fichiers allant jusqu'à 10 Mo.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Que se passe-t-il si une transaction est mal lue?</h3>\n              <p className="text-slate-600">Notre interface éditable unique vous permet de corriger n'importe quelle erreur avant de télécharger.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">La conversion d'un <strong>relevé bancaire PDF Excel</strong> est le meilleur moyen d'importer vos transactions passées dans votre logiciel de comptabilité.</p>\n          <p className="text-slate-600 mb-4">Lorsque vous opérez une extraction <strong>relevé bancaire PDF Excel</strong> avec notre plateforme, nous nettoyons automatiquement les en-têtes et les bas de page inutiles pour ne garder que l'essentiel : vos transactions.</p>\n          <p className="text-slate-600 mb-4">Simplifiez votre gestion avec notre service de <strong>relevé bancaire PDF Excel</strong>, et rejoignez des milliers d'utilisateurs satisfaits en France.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
