import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import VideoDemo from "@/components/landing/VideoDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Convertisseur Relevé Bancaire — PDF vers Excel et CSV Gratuit",
  description: "Le meilleur convertisseur de relevés bancaires gratuit. Convertissez en Excel ou CSV avec aperçu éditable. Sans inscription requise.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/convertisseur-releve-bancaire",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/convertisseur-releve-bancaire",
      "en": "https://bankstatementtoexcelconverter.com/convertisseur-releve-bancaire",
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
          <>Convertisseur Relevé Bancaire</>
        }
        subheadline="Le meilleur convertisseur de relevés bancaires gratuit. Convertissez en Excel ou CSV avec aperçu éditable. Sans inscription requise."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je utiliser cet outil pour des comptes associatifs?</h3>\n              <p className="text-slate-600">Oui, c'est parfaitement adapté pour la gestion des comptes d'une association.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Comment le convertisseur gère-t-il les descriptions longues?</h3>\n              <p className="text-slate-600">Les descriptions longues sont conservées intégralement sans être tronquées.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Le fichier généré contient-il des macros cachées?</h3>\n              <p className="text-slate-600">Non, nous générons des fichiers .xlsx purs, 100% sécurisés et sans macros.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Un bon <strong>convertisseur relevé bancaire</strong> fait toute la différence lors de la clôture mensuelle. Fini le stress de la saisie et les erreurs de frappe !</p>\n          <p className="text-slate-600 mb-4">Nous avons développé le <strong>convertisseur relevé bancaire</strong> le plus puissant et le plus simple d'utilisation pour le marché francophone. Il comprend les subtilités des formats des banques comme LCL ou Banque Populaire.</p>\n          <p className="text-slate-600 mb-4">N'attendez plus pour tester notre <strong>convertisseur relevé bancaire</strong>. L'interface d'édition intégrée agit comme un véritable tableur, vous offrant flexibilité et rapidité.</p>\n
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
