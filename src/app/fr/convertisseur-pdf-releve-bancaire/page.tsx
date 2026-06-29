import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Convertisseur PDF Relevé Bancaire — Outil Gratuit En Ligne",
  description: "Convertissez facilement vos PDF de relevés bancaires. Aperçu éditable inclus. Compatible avec toutes les banques françaises.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/convertisseur-pdf-releve-bancaire",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/convertisseur-pdf-releve-bancaire",
      "en": "https://bankstatementtoexcelconverter.com/convertisseur-pdf-releve-bancaire",
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
          <>Convertisseur PDF Relevé Bancaire</>
        }
        subheadline="Convertissez facilement vos PDF de relevés bancaires. Aperçu éditable inclus. Compatible avec toutes les banques françaises."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Dois-je créer un compte pour commencer?</h3>\n              <p className="text-slate-600">Non, les premières conversions sont accessibles directement sans inscription.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Les anciens formats de relevés sont-ils supportés?</h3>\n              <p className="text-slate-600">Oui, notre système est entraîné sur des formats récents et anciens.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je l'utiliser pour un audit financier?</h3>\n              <p className="text-slate-600">Absolument, de nombreux auditeurs utilisent notre outil pour numériser des documents papier numérisés.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Il est temps d'adopter un <strong>convertisseur PDF relevé bancaire</strong> fiable. Les documents PDF, bien que parfaits pour la consultation, sont inexploitables pour l'analyse de données.</p>\n          <p className="text-slate-600 mb-4">C'est là qu'intervient notre <strong>convertisseur PDF relevé bancaire</strong>. En quelques clics, il libère vos données financières de leur carcan numérique et les rend dynamiques et manipulables.</p>\n          <p className="text-slate-600 mb-4">Essayez ce <strong>convertisseur PDF relevé bancaire</strong> gratuit aujourd'hui. Il deviendra rapidement un outil incontournable de votre boîte à outils administrative.</p>\n
        </div>
      </section>

      <Footer />
    </div>
  );
}
