import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";
import FaqSection from "@/components/landing/FaqSection";

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

const frenchFaqs = [
  {
    question: "Est-ce que l’aperçu est vraiment gratuit ?",
    answer: "Oui. Vous pouvez télécharger votre relevé, vérifier l’aperçu dans un tableau modifiable et seulement payer si vous souhaitez exporter le fichier final."
  },
  {
    question: "Le convertisseur est-il adapté à la comptabilité ?",
    answer: "Oui. Les fichiers exportés sont idéaux pour le rapprochement bancaire, la préparation fiscale et l’import dans Excel ou CSV pour vos dossiers comptables."
  },
  {
    question: "Quelles banques françaises sont prises en charge ?",
    answer: "Nous prenons en charge les grandes banques françaises ainsi que de nombreuses banques régionales, avec une couverture qui s’étend régulièrement."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Les relevés sont traités rapidement et le flux a été conçu pour garder vos documents privés pendant la conversion."
  },
];

export default function FrenchHomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <Hero 
        badgeText="Convertisseur fiable pour les professionnels et particuliers"
        headline={
          <>
            Transformez votre <span className="gradient-text">relevé bancaire PDF</span> en fichier Excel propre
          </>
        }
        subheadline="Convertissez rapidement vos PDFs de banque en tableau Excel exploitables. Vérifiez les données dans un aperçu modifiable avant de télécharger votre fichier final."
        ctaText="Essayer gratuitement"
        ctaSecondaryText="Voir la méthode"
        trustBadges={[
          "Aperçu gratuit",
          "Export Excel ou CSV",
          "Supporte les banques françaises",
          "Sans abonnement",
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

      <FaqSection
        title="Questions fréquentes sur le convertisseur de relevés bancaires"
        subtitle="Tout ce qu’il faut savoir avant de convertir votre premier document PDF en tableau Excel."
        items={frenchFaqs}
        variant="cards"
      />

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
