import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSpreadsheet, ListChecks, Upload } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FaqSection from "@/components/landing/FaqSection";

const siteUrl = "https://www.bankstatementtoexcelconverter.com";

export const metadata: Metadata = {
  title: "Conversor de Extractos Bancarios a Excel y CSV | PDF Gratis",
  description:
    "Convierte extractos bancarios o estados de cuenta PDF a Excel o CSV. Revisa y edita las transacciones antes de descargar tu archivo.",
  openGraph: {
    title: "Conversor de Extractos Bancarios PDF a Excel",
    description:
      "Extrae transacciones de extractos bancarios PDF a Excel o CSV y revisa los datos antes de exportarlos.",
    url: `${siteUrl}/es/bancos`,
    siteName: "StatementToExcel",
    locale: "es",
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/es/bancos`,
    languages: {
      es: `${siteUrl}/es/bancos`,
      "x-default": `${siteUrl}/`,
    },
  },
};

const faqs = [
  {
    question: "¿Cómo convierto un extracto bancario PDF a Excel?",
    answer:
      "Descarga el extracto en PDF desde tu banco, súbelo al conversor, revisa las transacciones en la tabla editable y exporta el resultado como archivo Excel o CSV.",
  },
  {
    question: "¿Puedo convertir un estado de cuenta a Excel?",
    answer:
      "Sí. “Estado de cuenta” y “extracto bancario” se usan en distintos países para documentos similares. Sube el PDF, revisa los datos extraídos y elige Excel o CSV.",
  },
  {
    question: "¿Funciona con extractos de Santander, BBVA, CaixaBank, Banorte o Bancolombia?",
    answer:
      "Puedes subir un PDF de esas entidades y comprobar la vista previa. El diseño puede variar por país, tipo de cuenta y período, así que revisa las transacciones antes de exportar.",
  },
  {
    question: "¿Puedo convertir un extracto bancario escaneado?",
    answer:
      "Puedes probar con un PDF escaneado si el texto y los números se ven con claridad. Utiliza una copia nítida y revisa cuidadosamente todas las filas antes de usar la hoja de cálculo.",
  },
  {
    question: "¿Cuál es la diferencia entre Excel y CSV?",
    answer:
      "Excel es mejor para fórmulas, filtros, informes y edición visual. CSV es un archivo simple y ligero, útil para procesar o importar datos cuando el sistema lo admite.",
  },
  {
    question: "¿Puedo importar un CSV en cualquier programa de contabilidad?",
    answer:
      "No siempre. Cada programa puede pedir sus propias columnas, formatos de fecha, separadores o categorías. Consulta su documentación y realiza una prueba antes de importar un archivo completo.",
  },
  {
    question: "¿La hoja de cálculo sustituye al extracto bancario oficial?",
    answer:
      "No. La hoja sirve para organizar y analizar movimientos. Para préstamos, visados, auditorías, impuestos o trámites oficiales, conserva el PDF original y consulta los requisitos de la entidad correspondiente.",
  },
  {
    question: "¿Qué hago si una transacción está incompleta?",
    answer:
      "Compárala con el PDF original y corrige la fila en la vista previa. Si hay varias líneas afectadas, descarga una nueva copia del extracto directamente desde el banco y comprueba que todas las páginas estén incluidas.",
  },
  {
    question: "¿Cómo puedo comprobar los datos antes de usar el archivo?",
    answer:
      "Revisa el saldo inicial y final, compara algunos movimientos con el PDF y presta especial atención a las operaciones de importe alto, transferencias y filas cercanas a un salto de página.",
  },
  {
    question: "¿Para qué sirve convertir movimientos bancarios a Excel?",
    answer:
      "Puede ayudarte con conciliación bancaria, control de gastos, análisis de flujo de caja, revisión de pagos y preparación de información para contabilidad.",
  },
];

const banks = [
  "Santander", "BBVA", "CaixaBank", "Banco Sabadell", "Bankinter", "ING España", "Openbank", "Unicaja", "Ibercaja", "Abanca",
  "Banorte", "BBVA México", "Santander México", "Banco de Bogotá", "Bancolombia", "Davivienda", "Banco de Chile", "BancoEstado",
  "BCP", "Interbank", "Banco Pichincha", "Banco Guayaquil", "Banco Nación Argentina", "Galicia", "Banco Macro", "Scotiabank", "Nu Bank / Nubank",
];

const uses = [
  ["Conciliación bancaria", "Compara los movimientos del banco con facturas, ventas, recibos y registros internos para localizar diferencias."],
  ["Control de gastos personales", "Clasifica pagos por categorías, identifica suscripciones recurrentes y revisa tus gastos por semana o por mes."],
  ["Contabilidad de autónomos y pequeñas empresas", "Organiza ingresos, pagos a proveedores, comisiones y gastos antes de revisarlos con tu asesor o contador."],
  ["Análisis de flujo de caja", "Separa entradas y salidas para entender cuánto dinero entra, cuánto sale y qué operaciones se repiten."],
  ["Preparación de impuestos", "Utiliza la hoja como ayuda para localizar movimientos y organizar documentación. No sustituye facturas, justificantes ni documentos exigidos por la autoridad fiscal."],
  ["Revisión de transferencias", "Busca transferencias, pagos con tarjeta, comisiones o movimientos recurrentes sin leer manualmente cada página del PDF."],
];

const relatedLinks = [
  ["/", "Conversor de extractos bancarios a Excel"],
  ["/banks/in", "Conversor de extractos bancarios de India"],
  ["/banks/in/canara-bank", "Ejemplo de conversión de un extracto bancario"],
  ["/ar-kw/banks", "Conversor de extractos bancarios de Kuwait"],
  ["/ar-bh/banks", "Conversor de extractos bancarios de Baréin"],
  ["/ar-jo/banks", "Conversor de extractos bancarios de Jordania"],
] as const;

export default function SpanishBanksPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Español" },
      { "@type": "ListItem", position: 3, name: "Conversor de Extractos Bancarios", item: `${siteUrl}/es/bancos` },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7ff_45%,_#eef6ff_100%)] px-4 pb-24 pt-28 sm:pt-32 lg:pt-36">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[640px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-100/85 via-primary-50/30 to-transparent blur-3xl" />
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm"><FileSpreadsheet size={16} /> PDF a hoja de cálculo editable</p>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">Conversor de Extractos Bancarios a <span className="gradient-text">Excel</span></h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">Convierte tu extracto bancario o estado de cuenta en PDF a una hoja de cálculo Excel o CSV organizada. Sube el archivo, revisa las transacciones en una tabla editable y exporta el resultado en el formato que necesites.</p>
            <Link href="/app" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base">Convertir extracto bancario <ArrowRight size={18} /></Link>
            <p className="mt-3 text-sm text-slate-600">Sube tu PDF y revisa tus movimientos en una hoja de cálculo editable.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              {["Revisa y edita los datos antes de exportarlos", "Descarga el archivo en Excel (.xlsx) o CSV", "Evita copiar y pegar movimientos manualmente", "Usa el PDF original del banco para obtener mejores resultados"].map((benefit) => <span key={benefit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"><CheckCircle2 size={15} className="text-success-600" />{benefit}</span>)}
            </div>
          </div>
        </section>

        <section className="px-4 py-20"><div className="mx-auto max-w-4xl space-y-5 text-lg leading-8 text-slate-600">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Convierte extractos bancarios PDF a Excel o CSV</h2>
          <p>Un extracto bancario en PDF sirve para consultar movimientos, saldos y pagos, pero no siempre es cómodo para analizar gastos o preparar una conciliación bancaria. Al copiar una tabla desde un PDF a Excel, las fechas pueden cambiar, los importes pueden terminar en la columna equivocada y las descripciones largas pueden dividirse en varias filas.</p>
          <p>Este conversor de extractos bancarios a Excel te ayuda a transformar un documento PDF en una tabla que puedes revisar antes de descargarla. En lugar de reconstruir cada fila manualmente, puedes comprobar las transacciones, corregir los datos que lo necesiten y exportar un archivo ordenado.</p>
          <p>Elige Excel si necesitas filtrar movimientos, aplicar fórmulas, crear informes o clasificar gastos. Elige CSV si necesitas un archivo simple para procesar datos o cargarlo en un sistema que acepte este formato. La hoja de cálculo sirve para organización y análisis; no sustituye el documento oficial emitido por tu banco.</p>
        </div></section>

        <section id="como-funciona" className="border-y border-slate-100 bg-slate-50 px-4 py-20"><div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-3xl font-bold text-slate-900 sm:text-4xl">Cómo convertir un extracto bancario a Excel</h2>
          <ol className="space-y-5">{[
            ["1. Descarga tu extracto o estado de cuenta en PDF", "Entra en la aplicación móvil o banca en línea de tu banco, selecciona la cuenta y el período que necesitas y descarga el extracto en PDF. Siempre que sea posible, utiliza el archivo original descargado desde el banco en lugar de una captura de pantalla."],
            ["2. Sube el PDF bancario", "Haz clic en “Convertir extracto bancario” y selecciona el archivo PDF. Los documentos digitales, con texto legible y tablas claras, suelen ser más fáciles de revisar después de la extracción."],
            ["3. Revisa y edita las transacciones", "Comprueba las fechas, descripciones, importes y saldos. Si una fila está incompleta o necesita una corrección, edítala en la vista previa antes de descargar el archivo."],
            ["4. Exporta a Excel o CSV", "Elige Excel (.xlsx) si vas a trabajar con filtros, fórmulas, gráficos o informes. Elige CSV si necesitas una estructura simple de datos para procesarla o importarla en otro sistema."],
          ].map(([title, copy], index) => <li key={title} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 font-bold text-white">{index + 1}</span><div><h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3><p className="leading-7 text-slate-600">{copy}</p></div></li>)}</ol>
        </div></section>

        <section className="px-4 py-20"><div className="mx-auto max-w-4xl text-lg leading-8 text-slate-600"><h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl">Qué datos puedes organizar en tu hoja de cálculo</h2><p className="mb-6">Cada banco genera sus documentos con un diseño distinto. Algunos extractos incluyen una sola columna de importe; otros separan cargos y abonos. Algunos muestran el saldo después de cada movimiento, mientras que otros muestran solo el saldo inicial y final. Por este motivo, revisar la tabla antes de descargarla es una parte importante del proceso.</p><p className="mb-4">Una hoja de cálculo de extracto bancario puede ayudarte a organizar datos como:</p><ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{["Fecha de la operación", "Fecha valor o fecha de contabilización", "Descripción del movimiento", "Importe de ingreso, abono o crédito", "Importe de gasto, cargo o débito", "Saldo disponible o saldo acumulado", "Referencias de transferencias", "Pagos con tarjeta", "Recibos domiciliados", "Retiradas de efectivo", "Comisiones y gastos bancarios", "Devoluciones y reembolsos", "Transferencias entre cuentas", "Conceptos de pago mostrados por el banco"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={18} className="mt-1 shrink-0 text-primary-600" />{item}</li>)}</ul><p className="mt-6">No des por hecho que todos los datos estarán correctos sin comprobarlos. Revisa especialmente las operaciones con importes altos, los movimientos cerca de un salto de página y las descripciones largas. Conserva el PDF original como documento de referencia.</p></div></section>

        <section className="border-y border-slate-100 bg-slate-50 px-4 py-20"><div className="mx-auto max-w-5xl"><h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl">¿Funciona con bancos de España y Latinoamérica?</h2><p className="mb-6 text-lg leading-8 text-slate-600">Puedes probar el conversor con extractos en PDF de bancos tradicionales, cooperativas, cajas y cuentas digitales. El resultado puede variar según la calidad del PDF, el tipo de cuenta, el período seleccionado y el formato que utiliza la entidad bancaria.</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{banks.map((bank) => <div key={bank} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">{bank}</div>)}</div><p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Esta lista es informativa y no garantiza que todos los tipos de cuenta, modelos de PDF o versiones de extracto sean compatibles. Revisa siempre la vista previa y confirma los datos antes de utilizar el archivo.</p><p className="mt-6 text-sm leading-7 text-slate-600">Por ejemplo, puedes probar un extracto Santander a Excel, un extracto BBVA a Excel, un extracto CaixaBank a Excel, un estado de cuenta Banorte a Excel, un estado de cuenta Bancolombia a Excel, un extracto Banco de Chile a Excel, un estado de cuenta BCP a Excel, un extracto Banco Pichincha a Excel o un estado de cuenta Banco Nación a Excel.</p></div></section>

        <section className="px-4 py-20"><div className="mx-auto max-w-5xl"><h2 className="mb-8 text-3xl font-bold text-slate-900 sm:text-4xl">Excel, CSV u OFX: cuál elegir</h2><div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[680px] w-full text-left"><thead className="bg-slate-900 text-white"><tr><th className="px-5 py-4">Formato</th><th className="px-5 py-4">Mejor para</th><th className="px-5 py-4">Qué debes tener en cuenta</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white text-slate-600"><tr><td className="px-5 py-4 font-semibold text-slate-900">Excel (.xlsx)</td><td className="px-5 py-4">Análisis, filtros, fórmulas e informes</td><td className="px-5 py-4">Permite editar visualmente, usar tablas y crear gráficos</td></tr><tr><td className="px-5 py-4 font-semibold text-slate-900">CSV</td><td className="px-5 py-4">Procesamiento e importación de datos</td><td className="px-5 py-4">Es simple y ligero, pero no conserva formato ni fórmulas</td></tr><tr><td className="px-5 py-4 font-semibold text-slate-900">OFX</td><td className="px-5 py-4">Flujos que requieren un formato financiero específico</td><td className="px-5 py-4">Úsalo solo si tu banco o programa admite OFX de forma explícita</td></tr></tbody></table></div><div className="mt-6 space-y-4 text-lg leading-8 text-slate-600"><p>Excel y CSV no son lo mismo. Excel es útil cuando quieres trabajar directamente con la información: clasificar gastos, revisar ingresos, filtrar por fecha o preparar un informe mensual. CSV es un formato simple y compatible con muchos sistemas, pero no mantiene colores, fórmulas, varias hojas ni estilos.</p><p>OFX es un formato financiero diferente. No conviertas un archivo Excel o CSV a OFX simplemente cambiando la extensión, porque cada formato tiene una estructura propia. Antes de importar movimientos, consulta los requisitos del programa que utilizas y prueba con un archivo pequeño.</p></div></div></section>

        <section className="border-y border-slate-100 bg-slate-50 px-4 py-20"><div className="mx-auto max-w-5xl"><h2 className="mb-10 text-3xl font-bold text-slate-900 sm:text-4xl">Usos habituales de un extracto bancario en Excel</h2><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{uses.map(([title, copy]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><ListChecks className="mb-4 text-primary-600" size={25} /><h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3><p className="leading-7 text-slate-600">{copy}</p></article>)}</div></div></section>

        <section className="px-4 py-20"><div className="mx-auto max-w-4xl text-lg leading-8 text-slate-600"><h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl">Consejos para obtener una conversión más fiable</h2><p className="mb-6">La calidad del documento influye en el resultado. Un PDF descargado directamente desde el banco suele ser preferible a una imagen o una fotocopia escaneada. Los archivos protegidos con contraseña, dañados o con texto poco legible pueden requerir una revisión más cuidadosa.</p><ul className="space-y-3">{["Descarga el PDF original desde la aplicación o banca en línea.", "Comprueba que el archivo contiene todas las páginas.", "Evita fotos de pantalla o imágenes borrosas.", "Si el extracto está escaneado, utiliza una copia clara, recta y legible.", "Verifica el saldo inicial y el saldo final contra el PDF original.", "Revisa algunos movimientos al azar, especialmente los de mayor importe.", "Comprueba transferencias, pagos con tarjeta, recibos y comisiones.", "Conserva el PDF original para fines contables, fiscales o oficiales."].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 shrink-0 text-success-600" size={19} />{item}</li>)}</ul><p className="mt-6">Una revisión rápida puede evitar problemas posteriores. Si un extracto tiene muchas páginas, confirma que no se hayan repetido encabezados como si fueran transacciones y que las operaciones cercanas a los cambios de página aparezcan completas. Si encuentras un error, corrígelo en la vista previa antes de exportar.</p></div></section>

        <FaqSection title="Preguntas frecuentes" subtitle="Respuestas sobre la conversión de extractos bancarios y estados de cuenta PDF." items={faqs} variant="cards" />

        <section className="bg-primary-50 px-4 py-20 text-center"><div className="mx-auto max-w-3xl"><Upload className="mx-auto mb-5 text-primary-600" size={34} /><h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">Convierte tu extracto bancario ahora</h2><p className="mb-8 text-lg leading-8 text-slate-600">Sube tu extracto bancario o estado de cuenta en PDF, revisa tus movimientos en una tabla editable y descarga un archivo organizado en Excel o CSV.</p><Link href="/app" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base">Convertir PDF bancario a Excel <ArrowRight size={18} /></Link><p className="mt-3 text-sm text-slate-600">Revisa tus datos antes de exportarlos.</p></div></section>

        <section className="border-t border-slate-100 bg-white px-4 py-16"><div className="mx-auto max-w-5xl"><h2 className="mb-8 text-3xl font-bold text-slate-900">Herramientas relacionadas</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{relatedLinks.map(([href, label]) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700">{label} <ArrowRight className="ml-1 inline transition-transform group-hover:translate-x-1" size={16} /></Link>)}</div></div></section>
      </main>
      <Footer />
    </div>
  );
}
