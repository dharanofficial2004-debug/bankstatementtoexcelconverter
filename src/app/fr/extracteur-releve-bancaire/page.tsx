import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import VideoDemo from "@/components/landing/VideoDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Extracteur Relevé Bancaire — Extrayez vos Transactions en Excel",
  description: "Extrayez automatiquement toutes vos transactions bancaires depuis un PDF vers Excel. Précis, rapide et gratuit.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/extracteur-releve-bancaire",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/extracteur-releve-bancaire",
      "en": "https://bankstatementtoexcelconverter.com/extracteur-releve-bancaire",
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
          <>Extracteur Relevé Bancaire</>
        }
        subheadline="Extrayez automatiquement toutes vos transactions bancaires depuis un PDF vers Excel. Précis, rapide et gratuit."
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

      <VideoDemo />

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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">L'extraction est-elle basée sur l'OCR?</h3>\n              <p className="text-slate-600">Nous utilisons un mélange d'extraction de texte natif et d'IA avancée pour une précision maximale.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je extraire les données de plusieurs comptes sur le même PDF?</h3>\n              <p className="text-slate-600">Oui, notre système sépare intelligemment les différentes sections.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Quelles données sont extraites exactement?</h3>\n              <p className="text-slate-600">Nous extrayons la date, la description de l'opération, le montant (débit/crédit) et le solde courant.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">L'utilisation d'un <strong>extracteur relevé bancaire</strong> performant est essentielle pour l'automatisation comptable. L'extraction est toujours supérieure au simple copier-coller, qui désorganise souvent les colonnes.</p>\n          <p className="text-slate-600 mb-4">Notre <strong>extracteur relevé bancaire</strong> s'appuie sur des algorithmes d'intelligence artificielle pour comprendre la structure du document, même si celle-ci varie d'une page à l'autre. La précision de l'extraction garantit des chiffres justes pour votre bilan.</p>\n          <p className="text-slate-600 mb-4">Faites confiance à notre <strong>extracteur relevé bancaire</strong> pour récupérer vos transactions sans faille et exporter le tout vers un format standardisé et universel.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
