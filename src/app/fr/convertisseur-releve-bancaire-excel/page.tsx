import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import VideoDemo from "@/components/landing/VideoDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import BanksList from "@/components/landing/BanksList";
import Footer from "@/components/landing/Footer";
import FrenchPseoLinks from "@/components/landing/FrenchPseoLinks";

export const metadata: Metadata = {
  title: "Convertir Relevé Bancaire PDF en Excel — Outil Gratuit en Ligne",
  description:
    "Convertissez votre relevé bancaire PDF en Excel ou CSV en quelques secondes. Sans inscription, sans installation. Compatible BNP Paribas, Société Générale, Crédit Agricole et 100+ autres banques.",
  alternates: {
    canonical:
      "https://bankstatementtoexcelconverter.com/fr/convertisseur-releve-bancaire-excel",
    languages: {
      fr: "https://bankstatementtoexcelconverter.com/fr/convertisseur-releve-bancaire-excel",
      en: "https://bankstatementtoexcelconverter.com/convertisseur-releve-bancaire-excel",
    },
  },
};

const frenchSteps = [
  {
    icon: require("lucide-react").CloudUpload,
    title: "Téléversez votre relevé PDF",
    description:
      "Déposez votre fichier PDF bancaire dans la zone d'upload — depuis n'importe quelle banque française ou internationale.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: require("lucide-react").Grid3X3,
    title: "Aperçu et vérification",
    description:
      "Visualisez vos transactions extraites dans un tableau éditable et corrigez si besoin avant l'export.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: require("lucide-react").Download,
    title: "Exportez en Excel ou CSV",
    description:
      "Téléchargez votre fichier XLSX ou CSV prêt à l'emploi dans Excel, Google Sheets ou votre logiciel comptable.",
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
  "CIC",
  "Caisse d'Épargne",
  "LCL",
  "Banque Populaire",
  "HSBC France",
  "Boursorama",
  "Revolut",
  "Wise",
  "N26",
];

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <Hero
        badgeText="Gratuit — Sans carte de crédit"
        headline={
          <>
            Convertir relevé bancaire PDF en Excel{" "}
            <span className="gradient-text">en ligne</span>
          </>
        }
        subheadline="Transformez votre relevé bancaire PDF en fichier Excel ou CSV en quelques secondes. Aperçu éditable, aucune installation, compatible avec toutes les banques françaises."
        ctaText="Convertir gratuitement"
        ctaSecondaryText="Comment ça marche"
        trustBadges={[
          "Aperçu gratuit avant export",
          "Éditez chaque transaction",
          "100+ banques supportées",
          "Aucune donnée conservée",
        ]}
        ctaLink="/app"
      />

      <VideoDemo />

      <HowItWorks
        title="Comment ça marche"
        subtitle="Trois étapes pour extraire et exporter vos transactions bancaires"
        steps={frenchSteps}
      />

      <BanksList
        title="Compatible avec toutes les banques françaises"
        subtitle="Déposez votre relevé PDF — notre moteur détecte automatiquement la mise en page et extrait les transactions."
        banks={frenchBanks}
        moreText="+ 100 autres banques"
      />

      {/* Why convert section */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Pourquoi convertir un relevé bancaire PDF en Excel ?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Gain de temps considérable",
                body: "Plus besoin de recopier ligne par ligne dates, libellés, débits et crédits. L'extraction automatique traite un relevé entier en quelques secondes.",
              },
              {
                title: "Réduction des erreurs",
                body: "La saisie manuelle entraîne inversions de chiffres, oublis de lignes et erreurs de virgule. Un fichier généré automatiquement limite ces risques.",
              },
              {
                title: "Analyse financière simplifiée",
                body: "Dans Excel, triez, filtrez, créez des tableaux croisés dynamiques, calculez des totaux par catégorie et suivez votre trésorerie.",
              },
              {
                title: "Intégration dans vos outils",
                body: "La plupart des logiciels comptables acceptent les fichiers CSV ou XLSX. L'export facilite l'import et le rapprochement bancaire.",
              },
              {
                title: "Centralisation des données",
                body: "Regroupez plusieurs comptes ou plusieurs mois dans un même classeur Excel pour une vue financière consolidée.",
              },
              {
                title: "Zéro installation",
                body: "Tout se passe dans le navigateur. Aucun logiciel à installer, aucun compte à créer pour démarrer.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-6"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-step guide */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Guide de conversion étape par étape
          </h2>
          <p className="text-slate-600 mb-10 text-lg">
            Suivez ces quatre étapes pour transformer votre relevé bancaire PDF en fichier Excel exploitable.
          </p>
          <ol className="space-y-6">
            {[
              {
                step: "1",
                title: "Téléversez votre relevé bancaire PDF",
                body: "Cliquez sur la zone d'upload ou faites glisser votre fichier. Compatible avec tous les relevés français (BNP Paribas, Société Générale, Crédit Agricole, banques en ligne, néobanques…).",
              },
              {
                step: "2",
                title: "Lancement de la conversion",
                body: "Le moteur analyse la structure du PDF, détecte les tableaux de transactions et identifie les colonnes : date, libellé, débit, crédit, solde.",
              },
              {
                step: "3",
                title: "Vérifiez l'aperçu (optionnel)",
                body: "Prévisualisez les données extraites dans un tableau éditable. Corrigez si besoin avant de générer le fichier final.",
              },
              {
                step: "4",
                title: "Téléchargez votre fichier Excel ou CSV",
                body: "Choisissez le format XLSX (Excel) ou CSV selon vos besoins. Ouvrez-le dans Excel, Google Sheets ou importez-le dans votre logiciel comptable.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="flex gap-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PDF to CSV section */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Conversion d'un relevé bancaire PDF en CSV
          </h2>
          <p className="text-slate-600 mb-6 text-lg">
            En plus du format Excel (XLSX), vous pouvez exporter votre relevé en CSV (Comma-Separated Values). Ce format est particulièrement utile pour :
          </p>
          <ul className="space-y-4">
            {[
              {
                title: "Import dans un logiciel comptable",
                body: "La plupart des solutions comme Pennylane, Tiime, QuickBooks ou Xero acceptent les fichiers CSV pour le rapprochement bancaire automatique.",
              },
              {
                title: "Traitement de gros volumes",
                body: "Le CSV est léger et facile à manipuler par des scripts ou des outils d'automatisation. Idéal pour les cabinets traitant des centaines de relevés par mois.",
              },
              {
                title: "Échange de données universel",
                body: "Si vous travaillez avec un expert-comptable ou un prestataire, le CSV est lisible par quasiment tous les outils financiers.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-5"
              >
                <span className="font-bold text-slate-900">{item.title} : </span>
                <span className="text-slate-600">{item.body}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-600 mt-6">
            Pour exporter en CSV, sélectionnez simplement l'option CSV lors du téléchargement. Le contenu des données reste identique à celui du fichier Excel.
          </p>
        </div>
      </section>

      {/* Online vs manual */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10">
            Conversion en ligne vs saisie manuelle
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                ✅ Conversion en ligne
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li>
                  <strong>Rapide :</strong> quelques secondes, même pour des relevés de plusieurs pages.
                </li>
                <li>
                  <strong>Précis :</strong> détection automatique des tableaux et des colonnes, gestion des décimales et des signes.
                </li>
                <li>
                  <strong>Simple :</strong> aucune installation, tout se fait dans le navigateur.
                </li>
                <li>
                  <strong>Scalable :</strong> gérez plusieurs comptes et plusieurs mois sans effort supplémentaire.
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                ❌ Saisie manuelle dans Excel
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li>
                  <strong>Très longue :</strong> un relevé de 100 à 300 lignes peut prendre 30 minutes à plusieurs heures.
                </li>
                <li>
                  <strong>Source d'erreurs :</strong> inversions de chiffres, lignes sautées, mauvais alignement de colonnes.
                </li>
                <li>
                  <strong>Peu scalable :</strong> dès que vous avez plusieurs comptes ou plusieurs mois, la méthode devient ingérable.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs premium */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10">
            Version gratuite vs version premium
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Version gratuite
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li>Conversion ponctuelle ou limitée en pages</li>
                <li>Idéale pour les particuliers et micro-entrepreneurs</li>
                <li>Parfaite pour tester l'outil avant de l'adopter</li>
                <li>Sans inscription ni carte de crédit</li>
              </ul>
            </div>
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Version premium
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li>Conversions illimitées</li>
                <li>OCR avancé pour les PDF scannés</li>
                <li>Modèles spécifiques par banque</li>
                <li>Sécurité et stockage contrôlés</li>
                <li>Options d'automatisation (API, intégrations)</li>
              </ul>
            </div>
          </div>
          <p className="text-slate-600 mt-6">
            Pour les cabinets comptables et les entreprises traitant des centaines de relevés par mois, la version premium devient rapidement rentable grâce au temps gagné.
          </p>
        </div>
      </section>

      {/* How to import into Excel */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Comment importer un relevé bancaire dans Excel
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Une fois votre fichier Excel ou CSV obtenu, voici comment l'importer correctement dans Microsoft Excel.
          </p>
          <ol className="space-y-4">
            {[
              "Ouvrez Excel et créez un nouveau classeur ou ouvrez celui de destination.",
              "Allez dans l'onglet « Données ».",
              "Cliquez sur « À partir d'un fichier texte/CSV ».",
              "Sélectionnez votre fichier CSV ou TXT issu de la conversion.",
              "Configurez le délimiteur (virgule, point-virgule ou tabulation) et le format des colonnes (Date, Nombre avec séparateur décimal).",
              "Vérifiez l'aperçu : colonnes date, libellé, débit, crédit, solde bien alignées.",
              "Chargez les données dans la feuille. Si vous avez un fichier XLSX, ouvrez-le directement.",
            ].map((step, index) => (
              <li
                key={index}
                className="flex gap-4 items-start bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-slate-600 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10">
            Cas d'utilisation pour comptables et entreprises
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Comptables",
                body: "Traitez des dizaines de relevés chaque mois. Accélérez le rapprochement bancaire, standardisez les formats pour tous vos clients et automatisez les vérifications (soldes, totaux, anomalies).",
              },
              {
                title: "Experts-comptables",
                body: "Facilite l'audit des comptes, la préparation des liasses fiscales et le conseil en gestion de trésorerie. Précision et traçabilité assurées.",
              },
              {
                title: "Entrepreneurs et indépendants",
                body: "Suivez votre chiffre d'affaires par mois ou par projet, identifiez vos principales dépenses et préparez vos déclarations de TVA plus facilement.",
              },
              {
                title: "Petites entreprises",
                body: "Sans département financier dédié, automatisez la saisie comptable. Réduisez le temps administratif et concentrez-vous sur votre cœur de métier.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-6"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported formats */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Formats pris en charge
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                format: "PDF",
                desc: "Relevés natifs (texte) et PDF scannés avec OCR selon la version. Multi-pages supporté.",
              },
              {
                format: "XLSX",
                desc: "Fichiers Excel modernes compatibles avec Excel, Google Sheets et LibreOffice Calc.",
              },
              {
                format: "CSV",
                desc: "Format universel pour l'import dans les logiciels comptables et les outils d'automatisation.",
              },
            ].map((item) => (
              <div
                key={item.format}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center"
              >
                <div className="text-3xl font-extrabold text-primary-600 mb-3">
                  .{item.format}
                </div>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common problems */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10">
            Problèmes fréquents et solutions
          </h2>
          <div className="space-y-6">
            {[
              {
                title: "PDF scanné non lisible",
                body: "Utilisez la version avec OCR. Assurez-vous que le scan est suffisamment net (pas trop sombre, non coupé). Si certaines lignes sont mal reconnues, corrigez-les directement dans l'aperçu ou dans Excel.",
              },
              {
                title: "Mauvaise mise en forme du tableau",
                body: "Pour les relevés avec mise en page complexe (plusieurs tableaux, notes, logos), notre moteur détecte automatiquement les zones de transactions et ignore les éléments non pertinents. Une vérification rapide via l'aperçu suffit pour les cas atypiques.",
              },
              {
                title: "Fichier PDF protégé par mot de passe",
                body: "Déverrouillez d'abord votre PDF avec le mot de passe fourni par votre banque, puis importez le fichier déverrouillé dans le convertisseur.",
              },
              {
                title: "Relevé de plusieurs pages ou mois",
                body: "Le moteur traite toutes les pages du PDF et regroupe toutes les transactions dans un seul fichier Excel ou CSV. Filtrez ensuite par date ou par compte directement dans Excel.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-6"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Questions fréquemment posées
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "Comment convertir un relevé bancaire PDF en Excel ?",
                a: "Déposez votre fichier PDF dans notre convertisseur, lancez la conversion et téléchargez le fichier Excel ou CSV généré. Aucune installation n'est requise.",
              },
              {
                q: "Ce service est-il vraiment gratuit ?",
                a: "Oui, vous pouvez convertir votre relevé gratuitement pour un usage ponctuel dans la limite des pages autorisées. Une version premium est disponible pour les besoins intensifs et les fonctionnalités avancées.",
              },
              {
                q: "Puis-je convertir un relevé bancaire PDF en CSV ?",
                a: "Oui. Lors du téléchargement, choisissez le format CSV. Cela est utile pour l'import dans la plupart des logiciels comptables.",
              },
              {
                q: "Est-ce que cela fonctionne avec tous les relevés bancaires ?",
                a: "L'outil prend en charge la plupart des relevés français et internationaux, y compris ceux des grandes banques, des banques en ligne et des néobanques. Les mises en page très atypiques peuvent nécessiter une vérification manuelle.",
              },
              {
                q: "Les PDF scannés sont-ils pris en charge ?",
                a: "Oui, grâce à la technologie OCR. La qualité du scan influence la précision de l'extraction.",
              },
              {
                q: "Est-ce sécurisé ?",
                a: "Vos fichiers sont traités de manière sécurisée et supprimés automatiquement après un court délai. Aucune donnée bancaire n'est conservée à long terme sur nos serveurs.",
              },
              {
                q: "Puis-je convertir des relevés de plusieurs pages ?",
                a: "Oui. Le convertisseur gère les PDF multi-pages et regroupe toutes les transactions dans un seul fichier.",
              },
              {
                q: "Comment importer mon relevé bancaire dans Excel ?",
                a: "Une fois le fichier CSV ou XLSX téléchargé, ouvrez-le dans Excel ou utilisez l'assistant d'import « À partir d'un fichier texte/CSV » pour configurer les délimiteurs et les formats de colonnes.",
              },
              {
                q: "Cet outil peut-il remplacer mon logiciel comptable ?",
                a: "Non. Il s'agit d'un convertisseur PDF en Excel et CSV conçu pour préparer vos données. Vous pouvez ensuite importer ces fichiers dans votre logiciel comptable pour le rapprochement et la comptabilité.",
              },
              {
                q: "Quelles banques françaises sont prises en charge ?",
                a: "BNP Paribas, Crédit Agricole, Société Générale, La Banque Postale, Crédit Mutuel, CIC, Caisse d'Épargne, LCL, Boursorama, Revolut, Wise, N26 et plus de 100 autres banques françaises et internationales.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.q}
                </h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related pages */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
            Outils et pages connexes
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "PDF vers CSV",
                desc: "Convertissez tout type de document PDF en CSV pour vos imports comptables.",
                href: "/fr/convertisseur-releve-bancaire",
              },
              {
                title: "Relevé bancaire PDF vers Excel",
                desc: "Outil dédié à la transformation de relevés PDF en tableaux Excel structurés.",
                href: "/fr/convertir-releve-bancaire-en-excel",
              },
              {
                title: "Convertisseur PDF relevé bancaire",
                desc: "Solution complète pour tous vos besoins de conversion PDF → Excel ou CSV.",
                href: "/fr/convertisseur-pdf-releve-bancaire",
              },
              {
                title: "Extracteur de relevé bancaire",
                desc: "Extrayez automatiquement les transactions de n'importe quel relevé bancaire.",
                href: "/fr/extracteur-releve-bancaire",
              },
            ].map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="block bg-slate-50 rounded-2xl border border-slate-100 p-5 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 group"
              >
                <h3 className="font-bold text-slate-900 group-hover:text-primary-700 mb-1">
                  {link.title}
                </h3>
                <p className="text-slate-600 text-sm">{link.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FrenchPseoLinks />

      <Footer />
    </div>
  );
}
