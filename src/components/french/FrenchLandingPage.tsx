import Link from "next/link";
import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { frenchOrigin, frenchPath, frenchRelated, getFrenchPage, type FrenchPage } from "@/lib/frenchSeo";
import styles from "./FrenchLandingPage.module.css";

const labels: Record<string, string> = {
  home: "Accueil français", excel: "Convertir un PDF en Excel", csv: "Exporter les opérations en CSV",
  choice: "Choisir un convertisseur", ocr: "Convertir un relevé scanné", extract: "Comprendre les données extraites",
  import: "Importer le fichier dans Excel", multi: "Traiter un relevé de plusieurs pages", check: "Vérifier le fichier converti",
  cash: "Organiser un suivi de trésorerie", help: "Résoudre un problème de conversion",
};

const focus: Record<string, { title: string; text: string; items: string[] }> = {
  choice: { title: "Évaluer un résultat concret", text: "Testez un relevé représentatif de vos documents et ouvrez le fichier exporté. Les critères utiles portent sur tout le travail nécessaire pour obtenir des données vérifiées.", items: ["La source : PDF texte, scan et nombre de pages.", "La vérification : colonnes, lignes et corrections possibles.", "La destination : fichier Excel ou modèle d’import CSV."] },
  home: { title: "Choisissez votre point de départ", text: "Le format de votre document et l’usage prévu du fichier déterminent le parcours. Tous les guides donnent accès au même convertisseur.", items: ["Un PDF et un besoin de tableur : commencez par Excel.", "Un logiciel à alimenter : vérifiez son modèle CSV.", "Une archive papier : préparez le scan avant l’OCR."] },
  excel: { title: "Un contrôle en trois repères", text: "Gardez le PDF ouvert à côté du tableau. Commencez par une sortie et une entrée identifiables, puis comparez le solde obtenu sur la même période.", items: ["Date et libellé : retrouver le mouvement exact.", "Débit ou crédit : confirmer le sens du montant.", "Solde final : rechercher tout écart inexpliqué."] },
  csv: { title: "Réglages de l’export actuel", text: "Le fichier contient des données textuelles. L’outil qui l’ouvre décide de leur interprétation ; vérifiez son aperçu d’import avant de charger l’ensemble des lignes.", items: ["Séparateur de colonnes : virgule.", "Encodage : UTF-8 avec marqueur initial.", "Périmètre : transactions de la feuille active."] },
  ocr: { title: "Lire l’image avant de relire le tableau", text: "L’OCR facilite la lecture d’un scan, mais une donnée absente de l’image ne peut pas être confirmée. Préparez une meilleure copie si une zone essentielle reste illisible.", items: ["Les quatre bords de chaque page sont présents.", "Les petits chiffres, signes et décimales sont lisibles.", "Les pages sont dans le bon ordre et sans répétition."] },
  extract: { title: "Une colonne, une signification", text: "Distinguez les informations transcrites du relevé des informations que vous ajoutez ensuite pour l’analyse. Conserver cette séparation rend le tableau plus facile à vérifier et à expliquer.", items: ["Source : date, libellé et mouvements du relevé.", "Contrôle : soldes, totaux et références disponibles.", "Analyse ultérieure : catégories et commentaires de travail."] },
  import: { title: "Avant la première formule", text: "Testez les types de cellules sur quelques opérations connues. Une valeur qui s’affiche correctement peut encore être du texte et ne pas participer aux calculs attendus.", items: ["Les dates se trient dans l’ordre chronologique.", "Les montants participent à une somme de contrôle.", "Les références conservent leurs caractères et leurs zéros."] },
  multi: { title: "Aux frontières de chaque page", text: "Les ruptures de page concentrent souvent les difficultés de lecture. Un contrôle ciblé à chaque transition aide à retrouver les omissions, les descriptions fragmentées et les reports comptés deux fois.", items: ["Retrouver la dernière opération de la page précédente.", "Identifier le report de solde sans le compter comme mouvement.", "Confirmer la première opération de la page suivante."] },
  check: { title: "La relation à vérifier", text: "Solde d’ouverture + crédits − débits = solde de clôture. Cette égalité ne vaut que pour un même compte, une même période et des mouvements correctement identifiés.", items: ["Partir d’un solde confirmé dans le PDF.", "Exclure les reports et totaux des sommes de mouvements.", "Chercher la cause d’un écart, sans ligne d’ajustement inventée."] },
  cash: { title: "Séparer trois niveaux de travail", text: "Le relevé décrit des mouvements réalisés. Votre classement et vos hypothèses doivent rester identifiables pour expliquer chaque synthèse et revenir aux faits lorsque cela est nécessaire.", items: ["Historique : les opérations vérifiées du compte.", "Classement : vos catégories ajoutées dans Excel.", "Prévision : les mouvements attendus, dans une zone distincte."] },
  help: { title: "Diagnostiquer avant de réessayer", text: "Un fichier refusé, une lecture incomplète et un CSV mal ouvert demandent des vérifications différentes. Gardez le message exact et identifiez la dernière étape qui a fonctionné.", items: ["Avant l’aperçu : format, accès, lisibilité et limites.", "Dans l’aperçu : lignes, colonnes et qualité de la source.", "Après téléchargement : encodage, séparateur et types de données."] },
};

function Example({ page }: { page: FrenchPage }) {
  return <figure className={styles.example} aria-labelledby="exemple-titre">
    <div className={styles.exampleHeading}><span>PDF → {page.id === "csv" ? "CSV" : "tableau"}</span><span>Données fictives</span></div>
    <h2 id="exemple-titre">{page.id === "csv" ? "Les opérations avant l’export CSV" : "Des opérations que vous pouvez vérifier"}</h2>
    <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Exemple de tableau bancaire, défilement horizontal disponible">
      <table><caption className={styles.srOnly}>Exemple illustratif de deux opérations en euros</caption>
        <thead><tr>{["Date", "Libellé", "Débit", "Crédit", "Solde"].map((text) => <th scope="col" key={text}>{text}</th>)}</tr></thead>
        <tbody><tr><td>12/09/2026</td><td>PRLV EDF</td><td>84,20 €</td><td>—</td><td>2 415,30 €</td></tr>
          <tr><td>13/09/2026</td><td>VIR SEPA CLIENT</td><td>—</td><td>1 250,00 €</td><td>3 665,30 €</td></tr></tbody>
      </table>
    </div>
    <figcaption>Exemple pédagogique avec un solde initial de 2 499,50 €. Présentation française illustrative ; l’export actuel utilise notamment les en-têtes Description, Debit, Credit et Balance. Les données récupérées dépendent du relevé fourni.</figcaption>
  </figure>;
}

const referenceTables: Record<string, { title: string; columns: string[]; rows: string[][] }> = {
  csv: { title: "Préparer la correspondance des colonnes CSV", columns: ["Champ exporté", "Lecture française", "À vérifier à l’import"], rows: [["Description", "Libellé", "Conserver les accents et les références"], ["Debit / Credit", "Débit / Crédit", "Confirmer deux colonnes ou un montant signé"], ["Date", "Date de l’opération", "Contrôler l’ordre jour, mois, année"], ["Balance", "Solde", "Ne pas le traiter comme un mouvement"]] },
  help: { title: "Quel symptôme, quelle vérification ?", columns: ["Ce que vous constatez", "Premier contrôle", "Suite du diagnostic"], rows: [["Le dépôt est refusé", "Format et taille du fichier", "Ouvrir le PDF dans un lecteur"], ["Des chiffres sont illisibles", "Qualité du scan", "Chercher une source plus nette"], ["Des mouvements manquent", "Pagination et transitions", "Comparer les lignes au PDF"], ["Le CSV occupe une colonne", "Séparateur à l’ouverture", "Choisir la virgule dans l’import"]] },
  extract: { title: "Dictionnaire des informations bancaires", columns: ["Information", "Ce qu’elle décrit", "Point de vigilance"], rows: [["Date", "Position du mouvement dans le temps", "Ne pas confondre les différentes dates imprimées"], ["Libellé", "Description et références du mouvement", "Préserver les fragments sur plusieurs lignes"], ["Débit / Crédit", "Sortie / entrée sur le compte", "Vérifier le sens des remboursements"], ["Solde", "Position du compte", "Distinguer valeur source et valeur calculée"]] },
  choice: { title: "Votre grille d’essai", columns: ["Critère", "Comment l’évaluer", "Résultat à conserver"], rows: [["Lecture du document", "Tester un relevé représentatif", "Les pages et lignes effectivement récupérées"], ["Correction", "Vérifier une opération dans l’aperçu", "Une correction justifiée par le PDF"], ["Export", "Ouvrir le format nécessaire", "Un fichier lisible dans votre outil"], ["Conditions d’usage", "Consulter les indications du parcours", "Les limites pertinentes pour votre besoin"]] },
  import: { title: "Trois symptômes à repérer dans Excel", columns: ["Symptôme", "Cause à examiner", "Contrôle utile"], rows: [["Les dates se trient mal", "Valeurs texte ou ordre jour/mois", "Comparer plusieurs dates au relevé"], ["La somme ignore des cellules", "Montants interprétés comme du texte", "Tester une courte période vérifiée"], ["Les références sont altérées", "Conversion automatique en nombres", "Conserver la colonne de référence en texte"]] },
  cash: { title: "Exemple de classement après l’export", columns: ["Mouvement fictif", "Catégorie de travail possible", "Justification à conserver"], rows: [["PRLV EDF — 84,20 €", "Énergie", "Facture correspondant à la période"], ["VIR SEPA CLIENT — 1 250,00 €", "Règlement client, à confirmer", "Référence du règlement et pièce associée"], ["Virement entre vos comptes", "Transfert interne", "Correspondance avec l’autre compte suivi"]] },
};

function ReferenceTable({ id }: { id: string }) {
  const content = referenceTables[id];
  if (!content) return null;
  return <section className={styles.referenceTable} aria-labelledby="repere-titre"><h2 id="repere-titre">{content.title}</h2><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={content.title}><table><thead><tr>{content.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{content.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>;
}

export default function FrenchLandingPage({ id }: { id: string }) {
  const page = getFrenchPage(id);
  const url = frenchOrigin + frenchPath(page);
  const related = frenchRelated[id].map(getFrenchPage);
  const panel = focus[id];
  const graph = [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: page.h1, description: page.description, inLanguage: "fr", isPartOf: { "@id": `${frenchOrigin}/#website` } },
    ...(page.slug ? [{ "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil français", item: `${frenchOrigin}/fr` },
      { "@type": "ListItem", position: 2, name: page.h1, item: url },
    ] }] : []),
    { "@type": "FAQPage", "@id": `${url}#faq`, inLanguage: "fr", mainEntity: page.faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  ];
  return <div className={`${styles.page} ${styles[page.variant]}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />
    <a href="#contenu" className={styles.skip}>Aller au contenu</a>
    <header className={styles.header}>
      <div className={styles.navWrap}>
        <Link href="/fr" className={styles.brand} aria-label="StatementToExcel, accueil français"><FileSpreadsheet aria-hidden="true" size={26} /><span>StatementToExcel</span></Link>
        <nav aria-label="Navigation principale" className={styles.nav}>
          <Link href="/fr/convertir-releve-bancaire-en-excel">PDF vers Excel</Link>
          <Link href="/fr/releve-bancaire-csv">PDF vers CSV</Link>
          <Link href="/fr#guides">Guides</Link>
          <Link href="/pricing" hrefLang="en">Tarifs (en anglais)</Link>
        </nav>
        <Link href="/app" prefetch={false} className={styles.navCta}>Ouvrir l’outil <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </header>
    <main id="contenu">
      <section className={styles.hero}>
        {page.slug && <nav aria-label="Fil d’Ariane" className={styles.breadcrumb}><Link href="/fr">Accueil français</Link><span aria-hidden="true">/</span><span aria-current="page">{labels[id]}</span></nav>}
        <div className={styles.heroGrid}>
          <div><p className={styles.eyebrow}>{page.eyebrow}</p><h1>{page.h1}</h1><p className={styles.intro}>{page.intro}</p>
            <div className={styles.actions}><Link href="/app" prefetch={false} className={styles.primary}>Ouvrir le convertisseur <ArrowRight size={18} aria-hidden="true" /></Link><a href="#exemple-titre" className={styles.secondary}>Examiner l’exemple</a></div>
            <p className={styles.reassurance}>PDF texte ou scanné · Aperçu modifiable · Export XLSX ou CSV</p>
            <p className={styles.access}>L’application peut demander une connexion pour exporter. Les conditions d’utilisation et les offres sont indiquées dans le parcours. L’interface de conversion est actuellement en anglais.</p>
          </div>
          <aside className={styles.focus} aria-label={panel.title}><p className={styles.eyebrow}>Point de repère</p><h2>{panel.title}</h2><p>{panel.text}</p><ul>{panel.items.map((item) => <li key={item}>{item}</li>)}</ul></aside>
        </div>
      </section>
      <div className={styles.exampleWrap}><Example page={page} /></div>
      <section className={styles.method} aria-labelledby="methode-titre">
        <div><p className={styles.eyebrow}>Le parcours de conversion</p><h2 id="methode-titre">Du document au fichier de travail</h2></div>
        <ol><li><strong>1. Préparez la source</strong><p>Ouvrez votre PDF, confirmez le compte et la période, puis déposez-le dans l’application. Pour un scan, vérifiez d’abord la lisibilité des pages.</p></li><li><strong>2. Contrôlez l’aperçu</strong><p>Comparez les opérations au relevé et corrigez les cellules lorsque la source le justifie. Vérifiez les montants avant de poursuivre.</p></li><li><strong>3. Choisissez l’export</strong><p>Téléchargez un classeur XLSX ou un fichier CSV selon votre besoin. Ouvrez le résultat et conservez le PDF comme référence de contrôle.</p></li></ol>
      </section>
      <ReferenceTable id={id} />
      <div className={styles.editorial}>
        <aside className={styles.contents}><nav aria-label="Sommaire de la page"><h2>Dans ce guide</h2><ol>{page.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol><a href="#faq">Questions fréquentes</a></nav></aside>
        <article className={styles.article} aria-label={page.h1}>
          {page.sections.map((section, sectionIndex) => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{sectionIndex < related.length && sectionIndex % 2 === 0 && <p className={styles.contextLink}>Pour cette étape : <Link href={frenchPath(related[sectionIndex])}>{labels[related[sectionIndex].id].charAt(0).toLowerCase() + labels[related[sectionIndex].id].slice(1)}</Link>.</p>}</section>)}
        </article>
      </div>
      <section id="faq" className={styles.faq} aria-labelledby="faq-titre"><p className={styles.eyebrow}>Réponses pratiques</p><h2 id="faq-titre">{page.faqTitle}</h2>
        <div>{page.faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </section>
      <section id="guides" className={styles.related} aria-labelledby="guides-titre"><h2 id="guides-titre">{id === "home" ? "Tous les guides pour vos relevés" : "Poursuivre avec le guide adapté"}</h2><p>Retrouvez les étapes utiles selon votre source, votre format de sortie et le travail à réaliser après l’extraction.</p><ul>{related.map((item) => <li key={item.id}><Link href={frenchPath(item)}>{labels[item.id]} <ArrowRight aria-hidden="true" size={16} /></Link></li>)}</ul></section>
      <section className={styles.finalCta}><div><h2>Préparez votre relevé, puis vérifiez le résultat</h2><p>Ouvrez le convertisseur pour déposer votre document et examiner les opérations. Gardez le PDF à portée de main pour comparer les données avant l’export.</p></div><Link href="/app" prefetch={false} className={styles.primary}>Accéder au convertisseur <ArrowRight aria-hidden="true" size={18} /></Link></section>
    </main>
    <footer className={styles.footer}><div><Link href="/fr" className={styles.brand}><FileSpreadsheet size={23} aria-hidden="true" />StatementToExcel</Link><p>Des relevés PDF aux tableaux de travail. Des données à vérifier, des formats à choisir selon votre usage.</p></div><nav aria-label="Liens de pied de page"><Link href="/fr">Accueil français</Link><Link href="/fr/convertisseur-releve-bancaire">Choisir son outil</Link><Link href="/fr/convertisseur-pdf-releve-bancaire">Aide à la conversion</Link><Link href="/pricing" hrefLang="en">Tarifs (en anglais)</Link><Link href="/" hrefLang="en">Version anglaise</Link><a href="/fr/sitemap.xml">Plan du site français</a></nav><p className={styles.copyright}>© {new Date().getFullYear()} StatementToExcel. Tous droits réservés.</p></footer>
  </div>;
}
