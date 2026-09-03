import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import VideoDemo from "@/components/landing/VideoDemo";
import Footer from "@/components/landing/Footer";
import FaqSection from "@/components/landing/FaqSection";
import Image from "next/image";
import Link from "next/link";
import { CloudUpload, Download, PencilLine, Grid3X3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontoauszug in Excel umwandeln | PDF zu Excel & CSV",
  description:
    "Wandeln Sie Kontoauszüge oder Bankauszüge im PDF in Excel oder CSV um. Prüfen und bearbeiten Sie Buchungen vor dem Export.",
  openGraph: {
    title: "Kontoauszug-PDF in Excel und CSV umwandeln",
    description:
      "Extrahieren Sie Buchungen aus Kontoauszugs-PDFs in Excel oder CSV und prüfen Sie die Daten vor dem Export.",
    url: "https://bankstatementtoexcelconverter.com/de/banken",
    siteName: "StatementToExcel",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://bankstatementtoexcelconverter.com/icon-512.png",
        width: 512,
        height: 512,
        alt: "Kontoauszug in Excel umwandeln",
      },
    ],
  },
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/de/banken",
    languages: {
      de: "https://bankstatementtoexcelconverter.com/de/banken",
      "x-default": "https://bankstatementtoexcelconverter.com/",
    },
  },
};

const germanSteps = [
  {
    icon: CloudUpload,
    title: "1. Kontoauszug als PDF herunterladen",
    description:
      "Melden Sie sich im Online-Banking oder in der Banking-App Ihrer Bank an, wählen Sie das Konto und den gewünschten Zeitraum und laden Sie den Kontoauszug als PDF herunter. Verwenden Sie nach Möglichkeit die Originaldatei der Bank statt eines Screenshots.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: Grid3X3,
    title: "2. PDF hochladen",
    description:
      "Klicken Sie auf \u201eKontoauszug konvertieren\u201c und w\u00e4hlen Sie die PDF-Datei aus. Digitale Dokumente mit lesbarem Text und klaren Tabellen lassen sich meist einfacher pr\u00fcfen.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: PencilLine,
    title: "3. Buchungen prüfen und bearbeiten",
    description:
      "Kontrollieren Sie Buchungsdatum, Verwendungszweck, Beträge und Saldo. Wenn eine Zeile unvollständig ist oder eine Korrektur benötigt, bearbeiten Sie sie in der Vorschau, bevor Sie die Datei herunterladen.",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    icon: Download,
    title: "4. Als Excel oder CSV exportieren",
    description:
      "Wählen Sie Excel (.xlsx), wenn Sie mit Filtern, Formeln, Grafiken oder Berichten arbeiten möchten. Wählen Sie CSV, wenn Sie eine einfache Datenstruktur für die Verarbeitung oder den Import in ein anderes System benötigen.",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

const germanBanks = [
  "Sparkasse",
  "Volksbank und Raiffeisenbank",
  "ING",
  "Commerzbank",
  "N26",
  "DKB",
  "Postbank",
  "HypoVereinsbank (UniCredit)",
  "Santander",
  "Targobank",
  "Consorsbank",
  "Comdirect",
  "Revolut",
  "Wise",
  "bunq",
  "C24 Bank",
  "Tomorrow",
  "GLS Bank",
  "PSD Bank",
  "BBBank",
];

const germanFaqs = [
  {
    question: "Wie wandle ich einen Kontoauszug-PDF in Excel um?",
    answer:
      "Laden Sie den Kontoauszug als PDF von Ihrer Bank herunter, senden Sie die Datei an den Konverter, prüfen Sie die Buchungen in der bearbeitbaren Tabelle und exportieren Sie das Ergebnis als Excel- oder CSV-Datei.",
  },
  {
    question: "Kann ich einen Bankauszug kostenlos in Excel umwandeln?",
    answer:
      "Prüfen Sie die im Konverter angezeigten Konditionen zum Zeitpunkt des Uploads. Der Ablauf ist einfach: PDF senden, Daten prüfen und im verfügbaren Format exportieren.",
  },
  {
    question: "Funktioniert das mit Sparkasse, Volksbank, ING, Commerzbank oder N26?",
    answer:
      "Sie können ein PDF dieser Institute hochladen und die Vorschau prüfen. Das Layout kann je nach Land, Kontotyp und Zeitraum variieren, also prüfen Sie die Buchungen vor dem Export.",
  },
  {
    question: "Kann ich einen gescannten Kontoauszug umwandeln?",
    answer:
      "Ja, gescannte PDFs können verarbeitet werden, wenn Text und Zahlen klar lesbar sind. Verwenden Sie eine scharfe Kopie und prüfen Sie alle Zeilen sorgfältig, bevor Sie die Tabelle nutzen.",
  },
  {
    question: "Was ist der Unterschied zwischen Excel und CSV?",
    answer:
      "Excel ist besser für Formeln, Filter, Berichte und visuelle Bearbeitung. CSV ist eine einfache, leichte Datei, nützlich für die Verarbeitung oder den Import, wenn das System dies unterstützt.",
  },
  {
    question: "Kann ich eine CSV in jedes Buchhaltungssystem importieren?",
    answer:
      "Nicht immer. Jedes System kann eigene Spalten, Datumsformate, Trennzeichen oder Kategorien verlangen. Prüfen Sie die Dokumentation und testen Sie mit wenigen Daten vor einem vollständigen Import.",
  },
  {
    question: "Ersetzt die Excel-Tabelle den offiziellen Kontoauszug der Bank?",
    answer:
      "Nein. Die Tabelle dient der Organisation und Analyse. Für Kredite, Visa, Audits, Steuern oder offizielle Vorgänge bewahren Sie das Original-PDF auf und prüfen die Anforderungen der zuständigen Stelle.",
  },
  {
    question: "Was tun, wenn eine Buchung unvollständig ist?",
    answer:
      "Vergleichen Sie sie mit dem Original-PDF und korrigieren Sie die Zeile in der Vorschau. Wenn mehrere Zeilen betroffen sind, laden Sie eine neue Kopie direkt von der Bank herunter und stellen Sie sicher, dass alle Seiten enthalten sind.",
  },
  {
    question: "Wie prüfe ich die extrahierten Daten?",
    answer:
      "Vergleichen Sie den Anfangs- und Endsaldo mit dem PDF und prüfen Sie eine Auswahl von Bewegungen, besonders hohe Beträge, Überweisungen und Zeilen nahe einem Seitenumbruch.",
  },
  {
    question: "Wofür eignet sich die Umwandlung von Bankbewegungen in Excel?",
    answer:
      "Sie kann bei der Bankabstimmung, Ausgabenkontrolle, Cashflow-Analyse, Zahlungsprüfung und Vorbereitung von Informationen für die Buchhaltung helfen.",
  },
];

const useCaseCards = [
  {
    emoji: "🔁",
    title: "Bankabstimmung",
    desc: "Vergleichen Sie Bankbewegungen mit Rechnungen, Verkäufen, Quittungen und internen Buchungen, um Abweichungen zu finden.",
  },
  {
    emoji: "📉",
    title: "Ausgabenkontrolle",
    desc: "Kategorisieren Sie Zahlungen, identifizieren Sie wiederkehrende Abbuchungen und prüfen Sie Ihre Ausgaben pro Woche oder Monat.",
  },
  {
    emoji: "🧾",
    title: "Buchhaltung für Selbstständige und kleine Unternehmen",
    desc: "Organisieren Sie Einnahmen, Lieferantenrechnungen, Gebühren und Ausgaben, bevor Sie diese mit Ihrem Steuerberater prüfen.",
  },
  {
    emoji: "📊",
    title: "Cashflow-Analyse",
    desc: "Trennen Sie Ein- und Ausgänge, um zu verstehen, wie viel Geld hereinkommt, wie viel ausgeht und welche Vorgänge sich wiederholen.",
  },
  {
    emoji: "📋",
    title: "Steuerliche Vorbereitung",
    desc: "Nutzen Sie die Tabelle als Hilfe, um Bewegungen zu lokalisieren und Unterlagen zu ordnen. Sie ersetzt keine Rechnungen, Belege oder von der Finanzbehörde geforderten Dokumente.",
  },
  {
    emoji: "🔍",
    title: "Überweisungsprüfung",
    desc: "Suchen Sie Überweisungen, Kartenzahlungen, Gebühren oder wiederkehrende Bewegungen, ohne jede PDF-Seite manuell zu lesen.",
  },
];

const checkIcon = (
  <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default function GermanBankenPage() {
  return (
    <div lang="de" className="min-h-screen flex flex-col bg-white">
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: germanFaqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://bankstatementtoexcelconverter.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Deutsch",
                item: "https://bankstatementtoexcelconverter.com/de/banken",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Kontoauszug in Excel",
              },
            ],
          }),
        }}
      />

      <Navbar />

      <main className="flex-grow">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7ff_45%,_#eef6ff_100%)] px-4 pb-24 pt-28 sm:pt-32 lg:pt-36">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[640px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-100/85 via-primary-50/30 to-transparent blur-3xl" />
            <div className="absolute right-8 top-20 h-60 w-60 rounded-full bg-primary-100/40 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Für deutsche Kontoauszüge und Bankauszüge
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
              Kontoauszug in Excel umwandeln
            </h1>
            <p className="mb-8 mx-auto max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Wandeln Sie Ihren Kontoauszug oder Bankauszug im PDF in eine übersichtliche Excel- oder CSV-Tabelle um. Laden Sie die Datei hoch, prüfen Sie die Buchungen in einer bearbeitbaren Tabelle und exportieren Sie das Ergebnis im passenden Format.
            </p>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <a
                href="/app"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
              >
                Kontoauszug konvertieren
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                  →
                </span>
              </a>
              <a
                href="#so-gehts"
                className="btn-ghost inline-flex items-center justify-center px-8 py-3.5 text-base"
              >
                So geht's
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600">
              {[
                "Buchungen vor dem Export prüfen und bearbeiten",
                "Download als Excel (.xlsx) oder CSV",
                "Kein manuelles Abtippen von Zeilen",
                "Original-PDF der Bank für beste Ergebnisse",
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
                >
                  <span className="text-emerald-600">{checkIcon}</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div
            className="mx-auto mt-10 flex max-w-5xl justify-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href="https://www.producthunt.com/products/statementtoexcel?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-statementtoexcel"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                alt="StatementToExcel - AI-powered PDF Bank Statement to Excel Converter | Product Hunt"
                width={250}
                height={54}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1183682&theme=light&t=1782800408880"
                unoptimized
              />
            </a>
          </div>
        </section>

        {/* ── Section 1 – Intro ── */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Kontoauszüge aus PDF in Excel oder CSV umwandeln
            </h2>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Ein Kontoauszug im PDF ist gut zum Nachschauen, aber oft unpraktisch, wenn Sie Ausgaben analysieren, Einnahmen zuordnen oder eine Abstimmung vorbereiten möchten. Beim manuellen Kopieren aus dem PDF in Excel landen Beträge häufig in der falschen Spalte, Datumsangaben verlieren ihr Format und mehrzeilige Verwendungszwecke zerstören die Zeilenstruktur.
            </p>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Dieser Konverter für Kontoauszüge hilft Ihnen, die Tabelle aus einem PDF-Dokument in eine besser lesbare Struktur zu überführen. Anstatt jede Zeile von Hand zu übertragen, können Sie die extrahierten Buchungen prüfen, bei Bedarf korrigieren und eine geordnete Datei exportieren.
            </p>
            <p className="text-lg text-slate-600 leading-8">
              Wählen Sie Excel, wenn Sie filtern, Formeln anwenden, Berichte erstellen oder Ausgaben kategorisieren möchten. Wählen Sie CSV, wenn Sie eine einfache Datenstruktur für die Weiterverarbeitung oder den Import in ein anderes System benötigen. Die Tabelle dient der Organisation und Analyse; sie ersetzt nicht das offizielle Dokument Ihrer Bank.
            </p>
          </div>
        </section>

        {/* ── Section 2 – How It Works ── */}
        <section id="so-gehts" className="py-24 px-4 bg-slate-50/70">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                Schnell und einfach
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                So wandeln Sie einen Kontoauszug in Excel um
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Vier Schritte vom PDF-Kontoauszug zur geordneten Excel- oder CSV-Datei
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {germanSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgLight}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                        <step.icon size={22} className="text-white" />
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-slate-600 mb-4">Laden Sie Ihr PDF hoch und sehen Sie Ihre Buchungen in einer bearbeitbaren Tabelle.</p>
              <a
                href="/app"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
              >
                Kontoauszug konvertieren
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Section 3 – What data ── */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Welche Daten können Sie in der Tabelle organisieren?
            </h2>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Jede Bank stellt Auszüge anders dar. Manche verwenden eine einzige Betragsspalte; andere trennen Soll und Haben. Einige zeigen den Saldo nach jeder Buchung, andere nur den Anfangs- und Endsaldo. Deshalb ist die Prüfung vor dem Export wichtig.
            </p>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Eine gut organisierte Tabelle kann Ihnen helfen, Daten wie diese zu strukturieren:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "Buchungsdatum",
                "Wertstellung",
                "Verwendungszweck oder Buchungstext",
                "Einnahmen, Gutschriften oder Haben-Beträge",
                "Ausgaben, Belastungen oder Soll-Beträge",
                "Verfügbarer Saldo oder Saldo nach der Buchung",
                "Referenzen von Überweisungen",
                "Kartenzahlungen",
                "Lastschriften",
                "Bareinzahlungen und -abhebungen",
                "Gebühren und Bankkosten",
                "Erstattungen und Rückbuchungen",
                "Überweisungen zwischen Konten",
                "Von der Bank angezeigte Verwendungszwecke",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500 mt-0.5">{checkIcon}</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-slate-700 leading-7">
              Gehen Sie nicht davon aus, dass alle Daten ohne Prüfung korrekt sind. Prüfen Sie besonders Buchungen mit hohen Beträgen, Bewegungen nahe einem Seitenumbruch und lange Beschreibungen. Bewahren Sie das Original-PDF als Referenzdokument auf.
            </div>
          </div>
        </section>

        {/* ── Section 4 – German Banks ── */}
        <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-10 text-center">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                Deutsche Banken
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                Funktioniert das mit deutschen Banken?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Sie können den Konverter mit PDF-Auszügen von traditionellen Banken, Genossenschaftsbanken, Sparkassen und digitalen Konten ausprobieren. Das Ergebnis kann je nach PDF-Qualität, Kontotyp, Zeitraum und Layout der Bank variieren.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {germanBanks.map((bank) => (
                <div
                  key={bank}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {bank}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              Diese Liste ist informativ und garantiert keine Kompatibilität mit allen Kontotypen, PDF-Varianten oder Auszugsversionen. Prüfen Sie die Vorschau und bestätigen Sie die Daten vor der Nutzung. Zu den unterstützten Begriffen zählen Sparkasse Kontoauszug Excel, Volksbank Kontoauszug Excel, ING Kontoauszug Excel, Commerzbank Kontoauszug Excel, N26 Kontoauszug Excel, DKB Kontoauszug Excel, Postbank Kontoauszug Excel, HypoVereinsbank Kontoauszug Excel, Santander Kontoauszug Excel und Targobank Kontoauszug Excel.
            </p>
          </div>
        </section>

        {/* ── Section 5 – Format Table ── */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Excel, CSV oder DATEV: Welches Format wählen?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Excel und CSV sind nicht dasselbe. Wählen Sie das Format, das zu Ihrem Arbeitsablauf passt.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left p-4 font-semibold rounded-tl-2xl">Format</th>
                    <th className="text-left p-4 font-semibold">Besser für</th>
                    <th className="text-left p-4 font-semibold rounded-tr-2xl">Was zu beachten ist</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Excel (.xlsx)", "Analyse, Filter, Formeln und Berichte", "Ermöglicht visuelle Bearbeitung, Tabellen und Diagramme"],
                    ["CSV", "Verarbeitung und Datenimport", "Einfach und leicht, behält aber kein Format oder Formeln bei"],
                    ["DATEV / Lexware / sevDesk", "Buchhaltungsimport, wenn das System es explizit unterstützt", "Verwenden Sie nur, wenn Ihr System das Format offiziell annimmt"],
                  ].map(([format, bestFor, note], i) => (
                    <tr key={format} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-4 font-medium text-slate-700 border-b border-slate-100">{format}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{bestFor}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="font-bold text-slate-900 mb-2">Excel wählen, wenn…</p>
                <p className="text-sm text-slate-600 leading-7">
                  Sie direkt mit den Informationen arbeiten möchten: Ausgaben kategorisieren, Einnahmen prüfen, nach Datum filtern oder einen Monatsbericht erstellen.
                </p>
              </div>
              <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
                <p className="font-bold text-slate-900 mb-2">CSV wählen, wenn…</p>
                <p className="text-sm text-slate-600 leading-7">
                  Sie eine einfache, weit kompatible Struktur benötigen. DATEV, Lexware Office und sevDesk haben eigene Schemata — konvertieren Sie keine CSV einfach durch Ändern der Dateierweiterung.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6 – Use Cases ── */}
        <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                Anwendungsfälle
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Wofür einen Kontoauszug in Excel verwenden?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Von Selbstständigen bis zu kleinen Unternehmen — ein Werkzeug für viele Finanzaufgaben
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCaseCards.map((uc) => (
                <div key={uc.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-3xl mb-3">{uc.emoji}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{uc.title}</h3>
                  <p className="text-sm text-slate-600 leading-7">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 7 – Tips ── */}
        <section className="py-24 px-4 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Tipps für eine zuverlässigere Umwandlung
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Die Qualität des Dokuments beeinflusst das Ergebnis. Ein direkt von der Bank heruntergeladenes PDF ist meist besser als ein Scan oder Foto.
              </p>
            </div>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[
                "Laden Sie das Original-PDF aus der App oder dem Online-Banking herunter",
                "Stellen Sie sicher, dass alle Seiten enthalten sind",
                "Vermeiden Sie Screenshots oder unscharfe Bilder",
                "Wenn der Auszug gescannt ist, verwenden Sie eine klare, gerade und gut beleuchtete Kopie",
                "Vergleichen Sie den Anfangs- und Endsaldo mit dem Original-PDF",
                "Prüfen Sie einige zufällige Buchungen, besonders hohe Beträge",
                "Kontrollieren Sie Überweisungen, Kartenzahlungen, Lastschriften und Gebühren",
                "Bewahren Sie das Original-PDF für steuerliche, buchhalterische oder offizielle Zwecke auf",
              ].map((tip, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{tip}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-600 leading-8 max-w-4xl mx-auto">
              Eine kurze Prüfung kann spätere Probleme vermeiden. Wenn ein Auszug viele Seiten hat, stellen Sie sicher, dass keine Kopfzeilen als Buchungen wiederholt wurden und dass Bewegungen nahe Seitenumbrüchen vollständig sind. Korrigieren Sie Fehler in der Vorschau vor dem Export.
            </p>
          </div>
        </section>

        {/* ── Section 8 – FAQ ── */}
        <FaqSection
          title="Häufige Fragen"
          subtitle="Alles, was Sie zur Umwandlung von Kontoauszügen in Excel oder CSV wissen müssen"
          items={germanFaqs}
          variant="cards"
        />

        {/* ── Video Demo ── */}
        <VideoDemo
          title="So funktioniert der Konverter"
          subtitle="Sehen Sie, wie ein Kontoauszugs-PDF in unter 30 Sekunden in Excel umgewandelt wird — ohne Anmeldung, ohne Software-Installation."
          badgeText="Demo ansehen"
        />

        {/* ── Section 9 – Final CTA ── */}
        <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Wandeln Sie Ihren Kontoauszug jetzt um
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Laden Sie Ihren Kontoauszug oder Bankauszug im PDF hoch, prüfen Sie Ihre Buchungen in einer bearbeitbaren Tabelle und laden Sie eine geordnete Datei in Excel oder CSV herunter.
            </p>
            <a
              href="/app"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
            >
              PDF in Excel umwandeln
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                →
              </span>
            </a>
            <p className="mt-4 text-sm text-slate-500">Prüfen Sie Ihre Daten vor dem Export.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-500">
              {["Buchungen prüfen", "Excel oder CSV", "Kein Abtippen", "Original-PDF behalten"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <span className="text-emerald-500">{checkIcon}</span>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related Tools ── */}
        <section className="py-16 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Verwandte Tools</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "/", label: "Kontoauszug in Excel umwandeln" },
                { href: "/banks/in", label: "Indische Bankauszüge konvertieren" },
                { href: "/banks/in/canara-bank", label: "Beispiel für die Umwandlung eines Kontoauszugs" },
                { href: "/ar-kw/banks", label: "Konverter für kuwaitische Kontoauszüge" },
                { href: "/ar-bh/banks", label: "Konverter für bahrainische Kontoauszüge" },
                { href: "/ar-jo/banks", label: "Konverter für jordanische Kontoauszüge" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
