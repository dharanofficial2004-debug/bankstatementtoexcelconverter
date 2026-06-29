import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Convertisseur Relevé Bancaire Excel — Gratuit et Instantané",
  description: "Convertissez n'importe quel relevé bancaire PDF en Excel en quelques secondes. Aperçu éditable, sans inscription, 100+ banques supportées.",
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/fr/convertisseur-releve-bancaire-excel",
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr/convertisseur-releve-bancaire-excel",
      "en": "https://bankstatementtoexcelconverter.com/convertisseur-releve-bancaire-excel",
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
          <>Convertisseur Relevé Bancaire Excel</>
        }
        subheadline="Convertissez n'importe quel relevé bancaire PDF en Excel en quelques secondes. Aperçu éditable, sans inscription, 100+ banques supportées."
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
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Comment convertir mon relevé bancaire en Excel?</h3>\n              <p className="text-slate-600">Téléchargez votre PDF, visualisez l'aperçu éditable, puis exportez en Excel.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Le format Excel est-il compatible avec Microsoft Excel?</h3>\n              <p className="text-slate-600">Oui, le fichier .xlsx est compatible avec toutes versions de Microsoft Excel.</p>\n            </div>\n            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\n              <h3 className="text-lg font-bold text-slate-900 mb-2">Puis-je modifier les données avant de télécharger?</h3>\n              <p className="text-slate-600">Oui, c'est notre fonctionnalité unique — vous pouvez éditer chaque cellule avant l'export.</p>\n            </div>\n
          </div>
        </div>
      </section>

      {/* Unique Body Content Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
          <p className="text-slate-600 mb-4">Le <strong>convertisseur relevé bancaire Excel</strong> est l'outil indispensable pour simplifier votre comptabilité. En France, de nombreux professionnels perdent des heures à recopier manuellement les transactions depuis un fichier PDF vers une feuille de calcul. Notre outil automatise entièrement ce processus.</p>\n          <p className="text-slate-600 mb-4">Grâce à notre <strong>convertisseur relevé bancaire Excel</strong>, vous pouvez extraire vos données instantanément et avec une précision inégalée. Que vous soyez un expert-comptable cherchant à optimiser son temps ou un particulier gérant ses finances, cet outil s'adapte à vos besoins.</p>\n          <p className="text-slate-600 mb-4">L'un des plus grands avantages de notre <strong>convertisseur relevé bancaire Excel</strong> est la possibilité de prévisualiser et de modifier les données avant même de générer le fichier final. Vous gardez ainsi le contrôle total sur vos données financières.</p>\n
        </div>
      </section>

      <Footer />
    </div>
  );
}
