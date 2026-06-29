const fs = require('fs');
const path = require('path');

const pages = [
  {
    slug: "convertisseur-releve-bancaire-excel",
    title: "Convertisseur Relevé Bancaire Excel — Gratuit et Instantané",
    description: "Convertissez n'importe quel relevé bancaire PDF en Excel en quelques secondes. Aperçu éditable, sans inscription, 100+ banques supportées.",
    h1: "Convertisseur Relevé Bancaire Excel",
    faqs: [
      { q: "Comment convertir mon relevé bancaire en Excel?", a: "Téléchargez votre PDF, visualisez l'aperçu éditable, puis exportez en Excel." },
      { q: "Le format Excel est-il compatible avec Microsoft Excel?", a: "Oui, le fichier .xlsx est compatible avec toutes versions de Microsoft Excel." },
      { q: "Puis-je modifier les données avant de télécharger?", a: "Oui, c'est notre fonctionnalité unique — vous pouvez éditer chaque cellule avant l'export." }
    ],
    content: ["Le <strong>convertisseur relevé bancaire Excel</strong> est l'outil indispensable pour simplifier votre comptabilité. En France, de nombreux professionnels perdent des heures à recopier manuellement les transactions depuis un fichier PDF vers une feuille de calcul. Notre outil automatise entièrement ce processus.", "Grâce à notre <strong>convertisseur relevé bancaire Excel</strong>, vous pouvez extraire vos données instantanément et avec une précision inégalée. Que vous soyez un expert-comptable cherchant à optimiser son temps ou un particulier gérant ses finances, cet outil s'adapte à vos besoins.", "L'un des plus grands avantages de notre <strong>convertisseur relevé bancaire Excel</strong> est la possibilité de prévisualiser et de modifier les données avant même de générer le fichier final. Vous gardez ainsi le contrôle total sur vos données financières."]
  },
  {
    slug: "convertir-releve-bancaire-en-excel",
    title: "Convertir Relevé Bancaire en Excel — Outil Gratuit En Ligne",
    description: "Comment convertir votre relevé bancaire en Excel gratuitement. Outil en ligne avec aperçu éditable avant export.",
    h1: "Convertir Relevé Bancaire en Excel",
    faqs: [
      { q: "Est-ce difficile de convertir un relevé bancaire en Excel?", a: "Non, c'est très simple. Glissez votre fichier et nous nous occupons du reste." },
      { q: "Quels formats d'exportation sont disponibles?", a: "Vous pouvez exporter en format Excel (.xlsx) ou CSV." },
      { q: "Mon relevé contient plusieurs pages, est-ce un problème?", a: "Notre système gère parfaitement les relevés de plusieurs pages." }
    ],
    content: ["Vous cherchez à <strong>convertir relevé bancaire en Excel</strong> ? Vous avez trouvé la solution la plus rapide du marché. De la préparation des déclarations fiscales au simple suivi de budget, la nécessité de manipuler des données bancaires est omniprésente.", "Pour <strong>convertir relevé bancaire en Excel</strong>, notre algorithme intelligent identifie automatiquement les colonnes (date, libellé, débit, crédit) spécifiques aux banques françaises comme le Crédit Mutuel ou la Caisse d'Épargne.", "Il n'a jamais été aussi facile de <strong>convertir relevé bancaire en Excel</strong>. Téléchargez votre PDF, vérifiez le résultat dans notre tableur intégré, et téléchargez votre fichier parfaitement formaté."]
  },
  {
    slug: "convertir-pdf-releve-bancaire-en-excel",
    title: "Convertir PDF Relevé Bancaire en Excel — Rapide et Précis",
    description: "Convertissez vos PDF de relevés bancaires en fichiers Excel propres. Détection automatique du format bancaire. Gratuit.",
    h1: "Convertir PDF Relevé Bancaire en Excel",
    faqs: [
      { q: "La conversion conserve-t-elle les dates exactes?", a: "Oui, notre outil reconnaît et formate correctement les dates françaises." },
      { q: "Que faire si mon PDF est protégé par mot de passe?", a: "Veuillez déverrouiller ou imprimer en PDF sans mot de passe avant de le télécharger." },
      { q: "Puis-je l'utiliser sur mon téléphone?", a: "Oui, l'outil fonctionne parfaitement sur mobile et tablette." }
    ],
    content: ["La tâche de <strong>convertir PDF relevé bancaire en Excel</strong> peut vite devenir un cauchemar si on utilise des outils génériques qui détruisent la mise en page. C'est pourquoi nous avons créé un outil spécialisé.", "En choisissant de <strong>convertir PDF relevé bancaire en Excel</strong> via notre plateforme, vous bénéficiez d'une technologie IA entraînée spécifiquement sur les formats bancaires. Fini les lignes décalées ou les montants fusionnés avec les dates !", "N'hésitez plus à <strong>convertir PDF relevé bancaire en Excel</strong> pour faciliter votre rapprochement bancaire et gagner en productivité au quotidien."]
  },
  {
    slug: "releve-bancaire-vers-excel",
    title: "Relevé Bancaire vers Excel — Conversion Instantanée Gratuite",
    description: "Transformez vos relevés bancaires en feuilles Excel éditables. Fonctionne avec toutes les banques françaises et internationales.",
    h1: "Relevé Bancaire vers Excel",
    faqs: [
      { q: "Le logiciel reconnaît-il les banques automatiquement?", a: "Oui, notre système détecte l'institution financière pour appliquer le meilleur modèle d'extraction." },
      { q: "Puis-je ajouter des catégories à mes dépenses?", a: "L'outil vous permet d'éditer les cellules, vous pouvez donc ajouter des annotations." },
      { q: "Combien de temps prend la conversion?", a: "Généralement moins de 5 secondes par page." }
    ],
    content: ["Le passage d'un <strong>relevé bancaire vers Excel</strong> est une étape cruciale pour toute analyse financière sérieuse. Que ce soit pour un audit ou pour la gestion de trésorerie, avoir des données structurées est indispensable.", "Notre outil de transformation de <strong>relevé bancaire vers Excel</strong> vous assure un résultat propre et prêt à l'emploi. Vous pourrez immédiatement appliquer vos filtres, formules et tableaux croisés dynamiques habituels.", "Ne perdez plus de temps avec la saisie manuelle. La transition d'un <strong>relevé bancaire vers Excel</strong> se fait désormais en un seul clic, en toute sécurité."]
  },
  {
    slug: "pdf-releve-bancaire-vers-excel",
    title: "PDF Relevé Bancaire vers Excel — Convertisseur Gratuit",
    description: "Convertisseur PDF relevé bancaire vers Excel. Aperçu en direct, édition possible, export en un clic.",
    h1: "PDF Relevé Bancaire vers Excel",
    faqs: [
      { q: "Est-il nécessaire d'installer une application?", a: "Non, tout fonctionne directement dans votre navigateur web." },
      { q: "Les montants négatifs sont-ils bien gérés?", a: "Oui, les débits et les crédits sont placés dans des colonnes distinctes et formatés correctement." },
      { q: "Puis-je convertir les relevés de ma carte de crédit?", a: "Absolument, les relevés de cartes de crédit sont également supportés." }
    ],
    content: ["Transformer un <strong>PDF relevé bancaire vers Excel</strong> demande souvent des compétences techniques ou des logiciels coûteux. Nous avons démocratisé ce processus.", "Notre solution de <strong>PDF relevé bancaire vers Excel</strong> est conçue pour être intuitive. Vous téléchargez le document et, instantanément, les données s'affichent sous forme de grille interactive.", "La fiabilité de notre outil de <strong>PDF relevé bancaire vers Excel</strong> en fait le choix privilégié des TPE et PME françaises pour digitaliser leur comptabilité."]
  },
  {
    slug: "releve-bancaire-pdf-excel",
    title: "Relevé Bancaire PDF Excel — Convertisseur Gratuit En Ligne",
    description: "Convertissez vos relevés bancaires PDF en Excel. Compatible avec BNP, Crédit Agricole, Société Générale, La Banque Postale.",
    h1: "Relevé Bancaire PDF Excel",
    faqs: [
      { q: "Le format est-il compatible avec Mac?", a: "Oui, le fichier Excel fonctionne parfaitement avec Numbers ou Excel pour Mac." },
      { q: "Y a-t-il une limite de taille de fichier?", a: "Vous pouvez télécharger des fichiers allant jusqu'à 10 Mo." },
      { q: "Que se passe-t-il si une transaction est mal lue?", a: "Notre interface éditable unique vous permet de corriger n'importe quelle erreur avant de télécharger." }
    ],
    content: ["La conversion d'un <strong>relevé bancaire PDF Excel</strong> est le meilleur moyen d'importer vos transactions passées dans votre logiciel de comptabilité.", "Lorsque vous opérez une extraction <strong>relevé bancaire PDF Excel</strong> avec notre plateforme, nous nettoyons automatiquement les en-têtes et les bas de page inutiles pour ne garder que l'essentiel : vos transactions.", "Simplifiez votre gestion avec notre service de <strong>relevé bancaire PDF Excel</strong>, et rejoignez des milliers d'utilisateurs satisfaits en France."]
  },
  {
    slug: "convertisseur-releve-bancaire",
    title: "Convertisseur Relevé Bancaire — PDF vers Excel et CSV Gratuit",
    description: "Le meilleur convertisseur de relevés bancaires gratuit. Convertissez en Excel ou CSV avec aperçu éditable. Sans inscription requise.",
    h1: "Convertisseur Relevé Bancaire",
    faqs: [
      { q: "Puis-je utiliser cet outil pour des comptes associatifs?", a: "Oui, c'est parfaitement adapté pour la gestion des comptes d'une association." },
      { q: "Comment le convertisseur gère-t-il les descriptions longues?", a: "Les descriptions longues sont conservées intégralement sans être tronquées." },
      { q: "Le fichier généré contient-il des macros cachées?", a: "Non, nous générons des fichiers .xlsx purs, 100% sécurisés et sans macros." }
    ],
    content: ["Un bon <strong>convertisseur relevé bancaire</strong> fait toute la différence lors de la clôture mensuelle. Fini le stress de la saisie et les erreurs de frappe !", "Nous avons développé le <strong>convertisseur relevé bancaire</strong> le plus puissant et le plus simple d'utilisation pour le marché francophone. Il comprend les subtilités des formats des banques comme LCL ou Banque Populaire.", "N'attendez plus pour tester notre <strong>convertisseur relevé bancaire</strong>. L'interface d'édition intégrée agit comme un véritable tableur, vous offrant flexibilité et rapidité."]
  },
  {
    slug: "extracteur-releve-bancaire",
    title: "Extracteur Relevé Bancaire — Extrayez vos Transactions en Excel",
    description: "Extrayez automatiquement toutes vos transactions bancaires depuis un PDF vers Excel. Précis, rapide et gratuit.",
    h1: "Extracteur Relevé Bancaire",
    faqs: [
      { q: "L'extraction est-elle basée sur l'OCR?", a: "Nous utilisons un mélange d'extraction de texte natif et d'IA avancée pour une précision maximale." },
      { q: "Puis-je extraire les données de plusieurs comptes sur le même PDF?", a: "Oui, notre système sépare intelligemment les différentes sections." },
      { q: "Quelles données sont extraites exactement?", a: "Nous extrayons la date, la description de l'opération, le montant (débit/crédit) et le solde courant." }
    ],
    content: ["L'utilisation d'un <strong>extracteur relevé bancaire</strong> performant est essentielle pour l'automatisation comptable. L'extraction est toujours supérieure au simple copier-coller, qui désorganise souvent les colonnes.", "Notre <strong>extracteur relevé bancaire</strong> s'appuie sur des algorithmes d'intelligence artificielle pour comprendre la structure du document, même si celle-ci varie d'une page à l'autre. La précision de l'extraction garantit des chiffres justes pour votre bilan.", "Faites confiance à notre <strong>extracteur relevé bancaire</strong> pour récupérer vos transactions sans faille et exporter le tout vers un format standardisé et universel."]
  },
  {
    slug: "convertisseur-pdf-releve-bancaire",
    title: "Convertisseur PDF Relevé Bancaire — Outil Gratuit En Ligne",
    description: "Convertissez facilement vos PDF de relevés bancaires. Aperçu éditable inclus. Compatible avec toutes les banques françaises.",
    h1: "Convertisseur PDF Relevé Bancaire",
    faqs: [
      { q: "Dois-je créer un compte pour commencer?", a: "Non, les premières conversions sont accessibles directement sans inscription." },
      { q: "Les anciens formats de relevés sont-ils supportés?", a: "Oui, notre système est entraîné sur des formats récents et anciens." },
      { q: "Puis-je l'utiliser pour un audit financier?", a: "Absolument, de nombreux auditeurs utilisent notre outil pour numériser des documents papier numérisés." }
    ],
    content: ["Il est temps d'adopter un <strong>convertisseur PDF relevé bancaire</strong> fiable. Les documents PDF, bien que parfaits pour la consultation, sont inexploitables pour l'analyse de données.", "C'est là qu'intervient notre <strong>convertisseur PDF relevé bancaire</strong>. En quelques clics, il libère vos données financières de leur carcan numérique et les rend dynamiques et manipulables.", "Essayez ce <strong>convertisseur PDF relevé bancaire</strong> gratuit aujourd'hui. Il deviendra rapidement un outil incontournable de votre boîte à outils administrative."]
  },
  {
    slug: "releve-bancaire-csv",
    title: "Relevé Bancaire CSV — Convertisseur PDF vers CSV Gratuit",
    description: "Convertissez vos relevés bancaires PDF en fichier CSV. Parfait pour Excel, QuickBooks, et logiciels comptables. Gratuit.",
    h1: "Relevé Bancaire CSV",
    faqs: [
      { q: "Quelle est la différence entre CSV et Excel?", a: "Le CSV est un format de texte brut compatible avec tous les logiciels comptables. L'Excel conserve la mise en forme et les couleurs." },
      { q: "Le format CSV fonctionne-t-il avec QuickBooks?", a: "Oui, notre format CSV est parfaitement compatible avec QuickBooks, Sage, Xero et Pennylane." },
      { q: "Comment importer le fichier CSV généré dans Excel?", a: "Ouvrez Excel, allez dans Fichier → Importer → Sélectionnez votre fichier CSV → Suivez l'assistant d'importation." }
    ],
    content: ["Pourquoi convertir votre <strong>relevé bancaire CSV</strong> plutôt qu'en Excel ? Le format CSV est la norme d'importation de la majorité des logiciels de comptabilité français comme Pennylane, Sage ou Cegid.", "En transformant votre <strong>relevé bancaire CSV</strong>, vous vous assurez d'une compatibilité maximale pour l'import de vos flux bancaires. Notre outil structure le fichier CSV avec les délimiteurs standards (virgules ou points-virgules) appropriés.", "Que vous soyez dirigeant d'entreprise ou comptable, générer un <strong>relevé bancaire CSV</strong> depuis un PDF vous fera gagner de précieuses heures de pointage manuel chaque mois."]
  }
];

const tpl = fs.readFileSync('template.tsx', 'utf-8');

pages.forEach(page => {
  let contentHtml = '';
  page.content.forEach(p => {
    contentHtml += '          <p className="text-slate-600 mb-4">' + p + '</p>\\n';
  });

  let faqsHtml = '';
  page.faqs.forEach(faq => {
    faqsHtml += '            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">\\n';
    faqsHtml += '              <h3 className="text-lg font-bold text-slate-900 mb-2">' + faq.q + '</h3>\\n';
    faqsHtml += '              <p className="text-slate-600">' + faq.a + '</p>\\n';
    faqsHtml += '            </div>\\n';
  });

  let pageCode = tpl;
  pageCode = pageCode.replace(/__TITLE__/g, page.title.replace(/"/g, '\\\\\"'));
  pageCode = pageCode.replace(/__DESCRIPTION__/g, page.description.replace(/"/g, '\\\\\"'));
  pageCode = pageCode.replace(/__SLUG__/g, page.slug);
  pageCode = pageCode.replace(/__H1__/g, page.h1);
  pageCode = pageCode.replace(/__FAQS__/g, faqsHtml.trim());
  pageCode = pageCode.replace(/__CONTENT__/g, contentHtml.trim());

  const dirPath = path.join(__dirname, 'src', 'app', 'fr', page.slug);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), pageCode, 'utf-8');
  console.log('Generated ' + page.slug);
});
