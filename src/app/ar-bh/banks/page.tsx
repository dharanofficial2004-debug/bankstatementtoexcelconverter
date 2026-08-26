import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import VideoDemo from "@/components/landing/VideoDemo";
import Footer from "@/components/landing/Footer";
import FaqSection from "@/components/landing/FaqSection";
import Image from "next/image";
import Link from "next/link";
import { CloudUpload, Download, PencilLine, Grid3X3 } from "lucide-react";

export const metadata: Metadata = {
  title: "تحويل كشف حساب بنكي بحريني إلى Excel مجاناً | PDF إلى Excel",
  description:
    "حوّل كشف حسابك البنكي في البحرين من PDF إلى Excel أو CSV. راجع وعدّل المعاملات قبل التصدير من خلال أداة بسيطة عبر الإنترنت.",
  openGraph: {
    title: "محول كشف الحساب البنكي البحريني إلى Excel",
    description:
      "استخرج معاملات كشف الحساب PDF إلى ملف Excel أو CSV منظم وقابل للتعديل.",
    url: "https://bankstatementtoexcelconverter.com/ar-bh/banks",
    siteName: "StatementToExcel",
    locale: "ar_BH",
    type: "website",
    images: [
      {
        url: "https://bankstatementtoexcelconverter.com/icon-512.png",
        width: 512,
        height: 512,
        alt: "محول كشف الحساب البنكي البحريني إلى Excel",
      },
    ],
  },
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/ar-bh/banks",
    languages: {
      "ar-BH": "https://bankstatementtoexcelconverter.com/ar-bh/banks",
      "x-default": "https://bankstatementtoexcelconverter.com/",
    },
  },
};

const bahrainSteps = [
  {
    icon: CloudUpload,
    title: "1. نزّل كشف الحساب بصيغة PDF",
    description:
      "سجّل الدخول إلى تطبيق البنك أو الخدمات المصرفية عبر الإنترنت، وحدد الحساب والفترة المطلوبة، ثم نزّل كشف الحساب بصيغة PDF.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: Grid3X3,
    title: "2. ارفع ملف كشف الحساب",
    description:
      "ارفع ملف PDF الأصلي إلى الأداة. يفضّل استخدام الملف الذي تم تنزيله مباشرة من البنك بدلاً من صورة الشاشة للحصول على بيانات أوضح.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: PencilLine,
    title: "3. راجع المعاملات وعدّلها",
    description:
      "راجع التواريخ والوصف والمبالغ والرصيد. صحّح أي صف يحتاج إلى تعديل قبل تنزيل الملف.",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    icon: Download,
    title: "4. نزّل Excel أو CSV",
    description:
      "اختر Excel للتحليل والتنسيق، أو CSV للملفات الخفيفة والاستيراد أو معالجة البيانات.",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

const bahrainBanks = [
  "بنك البحرين الوطني (NBB)",
  "بنك البحرين والكويت (BBK)",
  "بنك ABC",
  "بنك السلام",
  "بنك البحرين الإسلامي (BisB)",
  "بنك الخليج الدولي (GIB)",
  "بنك الكويت والبحرين",
  "بنك الإثمار",
  "بنك البحرين للتنمية",
  "ستاندرد تشارترد البحرين",
  "HSBC البحرين",
  "بنك الكويت الدولي البحرين",
  "بنك وربة البحرين",
];

const bahrainFaqs = [
  {
    question: "كيف أحوّل كشف حساب بنكي في البحرين إلى Excel؟",
    answer:
      "نزّل كشف الحساب بصيغة PDF من تطبيق البنك أو الخدمات المصرفية عبر الإنترنت، ثم ارفعه إلى الأداة. راجع المعاملات في المعاينة القابلة للتعديل، وبعد ذلك نزّل الملف بصيغة Excel أو CSV.",
  },
  {
    question: "هل يمكن تحويل كشف حساب PDF إلى CSV؟",
    answer:
      "نعم. بعد مراجعة البيانات، اختر CSV للحصول على ملف نصي بسيط مناسب لمعالجة البيانات أو الاستيراد إلى نظام يدعم CSV.",
  },
  {
    question: "هل تعمل الأداة مع بنك البحرين الوطني أو بنك البحرين والكويت؟",
    answer:
      "يمكنك رفع كشف PDF من NBB أو BBK وتجربة المعاينة. قد تختلف الصيغة بين أنواع الحسابات والإصدارات، لذلك يجب مراجعة كل معاملة قبل التصدير.",
  },
  {
    question: "هل يمكنني تعديل المعاملات قبل تنزيل ملف Excel؟",
    answer:
      "نعم. راجع الجدول وعدّل البيانات التي تحتاج إلى تصحيح قبل تنزيل الملف النهائي.",
  },
  {
    question: "ما الفرق بين Excel وCSV؟",
    answer:
      "Excel مناسب للتقارير والتنسيق والصيغ، بينما CSV صيغة بسيطة وخفيفة تستخدم غالباً للمعالجة أو الاستيراد إلى برامج أخرى.",
  },
  {
    question: "هل يمكن استخدام ملف Excel بدلاً من كشف الحساب الرسمي؟",
    answer:
      "لا. ملف Excel مفيد للتنظيم والتحليل، لكن البنوك والسفارات والجهات الرسمية قد تطلب كشف الحساب الأصلي بصيغة PDF أو وثيقة رسمية. احتفظ دائماً بالنسخة الأصلية.",
  },
  {
    question: "ماذا أفعل إذا كان كشف الحساب عبارة عن نسخة ممسوحة ضوئياً؟",
    answer:
      "استخدم نسخة واضحة تظهر فيها النصوص والأرقام بوضوح، ثم راجع النتائج بعناية قبل استخدامها.",
  },
];

export default function BahrainBanksPage() {
  return (
    <div
      dir="rtl"
      lang="ar-BH"
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: bahrainFaqs.map((f) => ({
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
                name: "الرئيسية",
                item: "https://bankstatementtoexcelconverter.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "البحرين",
                item: "https://bankstatementtoexcelconverter.com/ar-bh/banks",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "بنوك البحرين",
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
            <div className="absolute left-4 top-56 h-64 w-64 rounded-full bg-blue-100/45 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              مصمم للمملكة العربية البحرينية
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
              تحويل كشف حساب بنكي بحريني إلى Excel
            </h1>
            <p className="mb-8 mx-auto max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              حوّل كشف حسابك البنكي بصيغة PDF إلى ملف Excel أو CSV منظم وقابل للتعديل. ارفع الملف، راجع المعاملات في جدول مباشر، ثم صدّر النتيجة بالصيغة المناسبة لاحتياجاتك.
            </p>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <a
                href="/app"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
              >
                ارفع كشف الحساب الآن
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                  ↑
                </span>
              </a>
              <a
                href="#how-it-works"
                className="btn-ghost inline-flex items-center justify-center px-8 py-3.5 text-base"
              >
                شرح الطريقة
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600">
              {[
                "معاينة قابلة للتعديل قبل التصدير",
                "تصدير إلى Excel أو CSV",
                "مناسب لكشوفات الحساب PDF الواضحة",
                "بديل أسرع من النسخ واللصق اليدوي",
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
                >
                  <span className="text-emerald-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
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
              محول كشف الحساب البنكي في البحرين إلى Excel وCSV
            </h2>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              قد يكون نقل معاملات كشف الحساب من ملف PDF إلى جدول قابل للبحث والفرز عملية مرهقة، خصوصاً عند وجود عدة صفحات أو أوصاف طويلة للمعاملات. يساعدك StatementToExcel على استخراج البيانات من كشف الحساب إلى جدول منظم يمكنك مراجعته وتعديله قبل تنزيله.
            </p>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              بدلاً من النسخ واللصق الذي قد يسبب صفوفاً ناقصة أو أعمدة غير مرتبة، يمكنك مراجعة التاريخ والوصف والمبالغ والأرصدة في مكان واحد. بعد ذلك، نزّل الملف بصيغة Excel للتحليل والتقارير، أو CSV إذا كنت تحتاج تنسيقاً بسيطاً لمعالجة البيانات أو الاستيراد إلى برنامج مناسب.
            </p>
            <p className="text-lg text-slate-600 leading-8">
              يمكنك تجربة الأداة مع كشوفات الحساب بالدينار البحريني (BHD) عند ظهور النص والجداول بوضوح في ملف PDF. احتفظ دائماً بملف PDF الأصلي وراجع النتائج قبل استخدامها في المحاسبة أو أي إجراء رسمي. تعتبر هذه الأداة خياراً عملياً لتحويل Bahrain bank statement to Excel أو Bahrain bank statement to CSV بدون إدخال يدوي.
            </p>
          </div>
        </section>

        {/* ── Section 2 – How It Works ── */}
        <section id="how-it-works" className="py-24 px-4 bg-slate-50/70">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                عملية سريعة وبسيطة
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                كيف تحوّل كشف حساب بنكي بحريني إلى Excel؟
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                أربع خطوات لتحويل كشف الحساب PDF إلى ملف Excel أو CSV قابل للتعديل
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {bahrainSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 text-right shadow-sm"
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
          </div>
        </section>

        {/* ── Section 3 – Banks List ── */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-10 text-center">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                بنوك البحرين
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                البنوك في البحرين التي يمكنك تجربة كشف حساباتها
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                تختلف صيغة كشف الحساب حسب البنك ونوع الحساب والإصدار. يمكنك رفع ملف PDF وتجربة المعاينة، ثم التحقق من النتيجة قبل التصدير.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {bahrainBanks.map((bank) => (
                <div
                  key={bank}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {bank}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              هذه قائمة إرشادية وليست ضماناً لتوافق كل كشف حساب أو كل إصدار. يجب مراجعة المعاينة والأرقام والأرصدة قبل اعتماد الملف.
            </p>
          </div>
        </section>

        {/* ── Section 4 – Excel vs CSV ── */}
        <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Excel أم CSV: أي صيغة تناسبك؟
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                تحتوي الصيغتان على المعاملات المستخرجة نفسها. اختر Excel عندما تحتاج إلى العمل داخل برنامج جداول بيانات، واختر CSV عندما تحتاج ملفاً بسيطاً للاستخدام في نظام آخر.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-right p-4 font-semibold rounded-tl-2xl">الصيغة</th>
                    <th className="text-right p-4 font-semibold">الأفضل لـ</th>
                    <th className="text-right p-4 font-semibold rounded-tr-2xl">لماذا؟</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Excel (.xlsx)", "التحليل والمراجعة وإعداد التقارير", "يدعم الجداول والتنسيق والصيغ"],
                    ["CSV", "المعالجة أو الاستيراد إلى بعض الأنظمة", "ملف بسيط وخفيف ومتوافق على نطاق واسع"],
                  ].map(([format, bestFor, why], i) => (
                    <tr key={format} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-4 font-medium text-slate-700 border-b border-slate-100">{format}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{bestFor}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section 5 – Use Cases ── */}
        <section className="py-24 px-4 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                استخدامات شائعة
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                استخدامات شائعة لكشوفات الحساب في البحرين
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                من أصحاب الأعمال إلى الأفراد — أداة واحدة تناسب كل احتياج مالي
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  emoji: "🧾",
                  title: "المحاسبة والمطابقة البنكية",
                  desc: "راجع عمليات الدخل والمصروفات والأرصدة بسهولة.",
                },
                {
                  emoji: "🏢",
                  title: "أصحاب الأعمال الصغيرة",
                  desc: "نظّم المعاملات الشهرية قبل إرسالها إلى المحاسب.",
                },
                {
                  emoji: "📊",
                  title: "التحليل المالي الشخصي",
                  desc: "تتبع المصروفات والدفعات المتكررة والتدفق النقدي.",
                },
                {
                  emoji: "📜",
                  title: "التقديمات التمويلية",
                  desc: "جهّز جدولاً منظمًا للمراجعة مع الاحتفاظ بالبيان الأصلي.",
                },
                {
                  emoji: "✈️",
                  title: "التأشيرة أو الإقامة",
                  desc: "استخدم الملف للتنظيم الشخصي فقط، واحتفظ دائماً بملف PDF الرسمي الذي قد تطلبه الجهة المعنية.",
                },
                {
                  emoji: "🔍",
                  title: "المراجعة الداخلية",
                  desc: "ابحث عن التحويلات والمدفوعات والرسوم البنكية بسرعة.",
                },
              ].map((uc) => (
                <div key={uc.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-3xl mb-3">{uc.emoji}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{uc.title}</h3>
                  <p className="text-sm text-slate-600 leading-7">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 6 – Tips ── */}
        <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                نصائح للحصول على نتائج أفضل
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                اتبع هذه النصائح لضمان دقة البيانات المستخرجة من كشف الحساب PDF
              </p>
            </div>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                "نزّل كشف الحساب الأصلي بصيغة PDF من تطبيق البنك أو الموقع",
                "تأكد من إرفاق كل صفحات كشف الحساب",
                "تجنب صور الشاشة أو الملفات الضبابية قدر الإمكان",
                "راجع الرصيد الافتتاحي والختامي مقابل ملف PDF الأصلي",
                "راجع عينة من التحويلات والمبالغ الكبيرة قبل استخدام الملف",
                "احتفظ بالكشف الأصلي لأغراض المحاسبة أو الجهات الرسمية",
                "اختر CSV للاستيراد عند الحاجة، وExcel للتحليل اليدوي",
              ].map((tip, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 7 – FAQ ── */}
        <FaqSection
          title="الأسئلة الشائعة"
          subtitle="كل ما تحتاج معرفته حول تحويل كشوفات الحساب البحرينية إلى Excel أو CSV"
          items={bahrainFaqs}
          variant="cards"
        />

        {/* ── Video Demo ── */}
        <VideoDemo
          title="شاهد كيف يعمل المحول"
          subtitle="تعرّف على كيفية تحويل كشف حسابك البنكي البحريني من PDF إلى Excel أو CSV في أقل من 30 ثانية — بدون تسجيل وبدون تثبيت أي برنامج."
          badgeText="شاهد العملية في العمل"
        />

        {/* ── Section 8 – Final CTA ── */}
        <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              حوّل كشف حسابك إلى Excel الآن
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              ارفع كشف الحساب البنكي البحريني بصيغة PDF، راجع المعاملات، ثم نزّل ملف Excel أو CSV منظم.
            </p>
            <a
              href="/app"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
            >
              تحويل كشف الحساب إلى Excel
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                ↑
              </span>
            </a>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-500">
              {["مجاناً", "آمن", "بدون تسجيل", "معاينة قابلة للتعديل"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <span className="text-emerald-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related Tools ── */}
        <section className="py-16 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">أدوات ذات صلة</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "/", label: "محول كشف الحساب إلى Excel" },
                { href: "/banks/in", label: "تحويل كشوفات البنوك الهندية إلى Excel" },
                { href: "/banks/in/canara-bank", label: "مثال لتحويل كشف حساب بنكي إلى Excel" },
                { href: "/ar-kw/banks", label: "محول كشف الحساب البنكي الكويتي إلى Excel" },
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
