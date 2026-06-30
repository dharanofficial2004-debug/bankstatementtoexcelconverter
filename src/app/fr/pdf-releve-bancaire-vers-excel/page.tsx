import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "PDF Relevé Bancaire vers Excel — Convertisseur Gratuit",
  description: "Convertisseur PDF relevé bancaire vers Excel. Aperçu en direct, édition possible, export en un clic.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/pdf-releve-bancaire-vers-excel",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/pdf-releve-bancaire-vers-excel",
      "en": "https://bankstatementtoexcelconverter.com/pdf-releve-bancaire-vers-excel",
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
          <>PDF Relevé Bancaire vers Excel</>
        }
        subheadline="Convertisseur PDF relevé bancaire vers Excel. Aperçu en direct, édition possible, export en un clic."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Est-il nécessaire d'installer une application?</h3>\n              <p className="text-slate-600">Non, tout fonctionne directement dans votre navigateur web.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Les montants négatifs sont-ils bien gérés?</h3>\n              <p className="text-slate-600">Oui, les débits et les crédits sont placés dans des colonnes distinctes et formatés correctement.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je convertir les relevés de ma carte de crédit?</h3>\n              <p className="text-slate-600">Absolument, les relevés de cartes de crédit sont également supportés.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Transformer un <strong>PDF relevé bancaire vers Excel</strong> demande souvent des compétences techniques ou des logiciels coûteux. Nous avons démocratisé ce processus.</p>\n          <p className="text-slate-600 mb-4">Notre solution de <strong>PDF relevé bancaire vers Excel</strong> est conçue pour être intuitive. Vous téléchargez le document et, instantanément, les données s'affichent sous forme de grille interactive.</p>\n          <p className="text-slate-600 mb-4">La fiabilité de notre outil de <strong>PDF relevé bancaire vers Excel</strong> en fait le choix privilégié des TPE et PME françaises pour digitaliser leur comptabilité.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
