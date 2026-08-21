import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import VideoDemo from "@/components/landing/VideoDemo";
import Footer from "@/components/landing/Footer";
import FaqSection from "@/components/landing/FaqSection";
import Image from "next/image";
import { CloudUpload, Download, PencilLine } from "lucide-react";

export const metadata: Metadata = {
  title: "تحويل كشف حساب بنكي كويتي إلى Excel مجاناً | PDF إلى Excel",
  description:
    "حوّل كشف حسابك البنكي الكويتي من PDF إلى Excel أو CSV خلال ثوانٍ. معاينة قابلة للتعديل قبل التصدير، مجاناً وبدون تعقيد.",
  openGraph: {
    title: "محول كشف الحساب البنكي الكويتي إلى Excel",
    description:
      "استخرج معاملات كشف الحساب PDF إلى ملف Excel أو CSV قابل للتعديل.",
    url: "https://bankstatementtoexcelconverter.com/ar-kw/banks",
    siteName: "StatementToExcel",
    locale: "ar_KW",
    type: "website",
    images: [
      {
        url: "https://bankstatementtoexcelconverter.com/icon-512.png",
        width: 512,
        height: 512,
        alt: "محول كشف الحساب البنكي الكويتي إلى Excel",
      },
    ],
  },
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/ar-kw/banks",
    languages: {
      "ar-KW": "https://bankstatementtoexcelconverter.com/ar-kw/banks",
      "en-KW": "https://bankstatementtoexcelconverter.com/kw/banks",
      "x-default": "https://bankstatementtoexcelconverter.com/",
    },
  },
};

const arabicSteps = [
  {
    icon: CloudUpload,
    title: "نزّل كشف الحساب بصيغة PDF",
    description: "سجّل الدخول إلى تطبيق البنك أو الخدمات المصرفية عبر الإنترنت، واختر الحساب والفترة الزمنية المطلوبة، ثم نزّل كشف الحساب بصيغة PDF.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: CloudUpload,
    title: "ارفع ملف PDF",
    description: "ارفع كشف الحساب إلى الأداة. استخدم الملف الأصلي من البنك متى أمكن، لأنه يكون أوضح من لقطة الشاشة.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: PencilLine,
    title: "راجع المعاملات وعدّلها",
    description: "تحقق من التاريخ والوصف والمبالغ والرصيد. يمكنك تصحيح أي صف قبل تنزيل الملف.",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    icon: Download,
    title: "صدّر إلى Excel أو CSV",
    description: "اختر Excel إذا كنت تريد التحليل والتنسيق، أو CSV إذا كنت تريد ملفاً بسيطاً للاستيراد أو المعالجة المحاسبية.",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

const kuwaitiBanks = [
  "بنك الكويت الوطني (NBK)",
  "بيت التمويل الكويتي (KFH)",
  "بنك الخليج",
  "بنك بوبيان",
  "بنك برقان",
  "البنك الأهلي الكويتي (ABK)",
  "بنك وربة",
  "البنك التجاري الكويتي",
  "بنك الكويت الدولي",
  "بنك الأهلي المتحد الكويت",
];

const kuwaitFaqs = [
  {
    question: "كيف أحوّل كشف حساب بنك كويتي إلى Excel؟",
    answer:
      "نزّل كشف الحساب بصيغة PDF من تطبيق البنك أو الخدمات المصرفية عبر الإنترنت، ثم ارفعه هنا. راجع الجدول القابل للتعديل وبعد ذلك نزّله بصيغة Excel أو CSV.",
  },
  {
    question: "هل يمكن تحويل كشف حساب PDF إلى CSV؟",
    answer:
      "نعم. بعد مراجعة المعاملات، اختر CSV إذا كنت تحتاج ملفاً بسيطاً للاستخدام في برنامج محاسبة أو لمعالجة البيانات.",
  },
  {
    question: "هل تعمل الأداة مع كشف حساب بنك الكويت الوطني أو بيت التمويل الكويتي؟",
    answer:
      "يمكنك رفع كشف PDF من NBK أو KFH وتجربة المعاينة. لأن تنسيق الكشوف قد يختلف حسب نوع الحساب والإصدار، راجع البيانات قبل التصدير.",
  },
  {
    question: "ما الفرق بين Excel وCSV لكشف الحساب؟",
    answer:
      "Excel أفضل للتحليل والتنسيق والصيغ، بينما CSV ملف نصي بسيط يستخدم غالباً للاستيراد والمعالجة في برامج أخرى.",
  },
  {
    question: "هل يمكن تعديل المعاملات قبل تنزيل الملف؟",
    answer:
      "نعم. راجع التواريخ والأوصاف والمبالغ في المعاينة وعدّل ما يلزم قبل التصدير.",
  },
  {
    question: "ماذا أفعل إذا كان كشف الحساب ممسوحاً ضوئياً؟",
    answer:
      "استخدم نسخة واضحة من المسح، وتأكد من أن جميع صفحات الكشف موجودة قبل الرفع. راجع جميع النتائج بعناية قبل استخدامها.",
  },
  {
    question: "هل يكفي ملف Excel لطلب تأشيرة أو تمويل؟",
    answer:
      "لا. قد يساعد Excel في التنظيم والمراجعة، لكن الجهة الرسمية أو البنك قد يطلب كشف الحساب الأصلي بصيغة PDF أو مستنداً مختوماً. احتفظ دائماً بالنسخة الأصلية.",
  },
];

export default function KuwaitBanksPage() {
  return (
    <div dir="rtl" lang="ar-KW" className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: kuwaitFaqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.answer,
              },
            })),
          }),
        }}
      />
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
                name: "الكويت",
                item: "https://bankstatementtoexcelconverter.com/ar-kw/banks",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "بنوك الكويت",
              },
            ],
          }),
        }}
      />

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7ff_45%,_#eef6ff_100%)] px-4 pb-24 pt-28 sm:pt-32 lg:pt-36">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[640px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-100/85 via-primary-50/30 to-transparent blur-3xl" />
            <div className="absolute left-4 top-56 h-64 w-64 rounded-full bg-blue-100/45 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                مصمم للمملكة العربية الكويتية
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
                تحويل كشف حساب بنكي كويتي إلى Excel
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                حوّل كشف حسابك البنكي بصيغة PDF إلى ملف Excel أو CSV منظم وقابل للتعديل. ارفع الملف، راجع المعاملات في جدول مباشر، ثم صدّر النتيجة بالصيغة المناسبة لعملك.
              </p>

              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <a
                  href="/app"
                  className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
                >
                  ارفع كشف الحساب الآن
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">↑</span>
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
                  "معاينة وتعديل قبل التصدير",
                  "تصدير إلى Excel أو CSV",
                  "مناسب لكشوفات PDF والنماذج الممسوحة ضوئياً",
                  "لا حاجة لنسخ المعاملات يدوياً",
                ].map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
                  >
                    <span className="text-emerald-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </span>
                    {badge}
                  </div>
                ))}
              </div>
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

        {/* Section 1 - Intro */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              محول كشف ا��حساب البنكي في الكويت إلى Excel وCSV
            </h2>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              تحتوي كشوفات الحساب البنكية على تواريخ ومعاملات وأوصاف ومبالغ وأرصدة، لكن تحويل جدول PDF إلى ملف قابل للفرز والتحليل قد يكون صعباً. يساعدك StatementToExcel على استخراج بيانات كشف الحساب إلى جدول واضح يمكنك مراجعته وتعديله قبل تنزيله.
            </p>
            <p className="text-lg text-slate-600 leading-8">
              بدلاً من النسخ واللصق الذي قد يسبب أعمدة مدمجة أو صفوفاً ناقصة أو أرقاماً غير مرتبة، يمكنك مراجعة البيانات في جدول قابل للتعديل ثم تصديرها إلى Excel للتحليل أو CSV للاستخدام في برامج المحاسبة. يدعم هذا التدفق كشوفات الحساب بالدينار الكويتي (KWD) عند ظهور البيانات بصورة واضحة في ملف PDF.
            </p>
          </div>
        </section>

        {/* Section 2 - How It Works */}
        <section id="how-it-works" className="py-24 px-4 bg-slate-50/70">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                عملية سريعة وبسيطة
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                كيف تحوّل كشف حسابك الكويتي إلى Excel؟
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                أربع خطوات سهلة لتحويل كشف حسابك PDF إلى ملف Excel أو CSV قابل للتعديل
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {arabicSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 text-right shadow-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgLight}`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}
                      >
                        <step.icon size={22} className="text-white" />
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 - Banks List */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-10 text-center">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                بنوك الكويت المدعومة
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                البنوك الكويتية التي يمكنك تجربة كشف حساباتها
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                يمكنك تجربة الأداة مع كشوفات PDF الصادرة عن البنوك الكويتية. تختلف التنسيقات بين البنوك والحسابات، لذلك راجع المعاينة دائماً قبل التصدير.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {kuwaitiBanks.map((bank) => (
                <div
                  key={bank}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {bank}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              هذه قائمة إرشادية وليست ضماناً لتوافق كل إصدار أو كل نوع من كشوفات الحساب. تحقق من النتائج في المعاينة قبل الاعتماد عليها في المحاسبة أو التقديمات الرسمية.
            </p>
          </div>
        </section>

        {/* Section 4 - Excel vs CSV Table */}
        <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                متى تستخدم Excel ومتى تستخدم CSV؟
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                لا يغيّر اختيار Excel أو CSV بيانات المعاملات نفسها. الفرق الأساسي هو التنسيق وطريقة الاستخدام بعد التنزيل.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-right p-4 font-semibold rounded-tl-2xl">الصيغة</th>
                    <th className="text-right p-4 font-semibold">الأفضل لـ</th>
                    <th className="text-right p-4 font-semibold rounded-tr-2xl">الميزة الأساسية</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Excel (.xlsx)", "المراجعة والتحليل وإعداد التقارير", "يدعم التنسيق والجداول والصيغ"],
                    ["CSV", "الاستيراد إلى بعض البرامج المحاسبية أو معالجة البيانات", "ملف بسيط وخفيف ومتوافق على نطاق واسع"],
                  ].map(([format, bestFor, keyBenefit], i) => (
                    <tr key={format} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-4 font-medium text-slate-700 border-b border-slate-100">{format}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{bestFor}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{keyBenefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 5 - Use Cases */}
        <section className="py-24 px-4 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                استخدامات شائعة
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                استخدامات شائعة لكشوفات الحساب الكويتية
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                من المباشرين إلى مديري المحاسبة — أداة واحدة تناسب كل سير عمل مالي
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  emoji: "🧾",
                  title: "المحاسبة ومطابقة المعاملات",
                  points: [
                    "راجع عمليات الدخل والمصروفات والأرصدة في جدول واحد",
                    "مطابقة المعاملات مع الفواتير",
                    "استيراد مباشر إلى برامج المحاسبة",
                  ],
                },
                {
                  emoji: "🏢",
                  title: "إدارة الأعمال الصغيرة",
                  points: [
                    "حضّر معاملاتك للتحليل الشهري أو للمحاسب",
                    "تتبع التدفق النقدي والمصروفات",
                    "تجهيز بيانات للضرائب أو المراجعة",
                  ],
                },
                {
                  emoji: "📜",
                  title: "طلبات التمويل",
                  points: [
                    "نظّم فترات متعددة من كشف الحساب قبل مراجعتها",
                    "تصدير جاهز للمراجعة من البنوك أو الجهات المانحة",
                    "حفظ ملفات أصلية مع ملفات Excel لسهولة العرض",
                  ],
                },
                {
                  emoji: "✈️",
                  title: "طلبات التأشيرة أو الإقامة",
                  points: [
                    "جهّز نسخة منظمة للمراجعة الشخصية",
                    "مع الاحتفاظ دائماً بملف PDF الأصلي المطلوب رسمياً",
                    "تصحيح أي أخطاء قبل تقديم الطلب",
                  ],
                },
                {
                  emoji: "💰",
                  title: "متابعة الميزانية الشخصية",
                  points: [
                    "صنّف المصروفات وراجع التدفق النقدي",
                    "تحديد الأنماط والإنفاق غير الضروري",
                    "التخطيط للمستقبَل والميزانية الشهرية",
                  ],
                },
                {
                  emoji: "🔍",
                  title: "التحقق من العمليات",
                  points: [
                    "ابحث عن التحويلات والدفعات المتكررة",
                    "التحقق من الرسوم البنكية غير المتوقعة",
                    "المطابقة الدورية مع السجل الشخصي",
                  ],
                },
              ].map((uc) => (
                <div
                  key={uc.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="text-3xl mb-3">{uc.emoji}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {uc.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {uc.points.map((pt) => (
                      <li key={pt} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 flex-shrink-0 mt-0.5">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 - Tips */}
        <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                نصائح للحصول على نتيجة أدق
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                اتبع هذه النصائح لتحسين دقة استخراج البيانات من كشف الحساب PDF
              </p>
            </div>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                "استخدم ملف PDF الأصلي الذي تم تنزيله من البنك، وليس صورة شاشة",
                "تأكد من أن جميع صفحات الكشف موجودة قبل الرفع",
                "استخدم كشفاً واضحاً غير ضبابي عند التعامل مع ملفات ممسوحة ضوئياً",
                "راجع الرصيد الافتتاحي والرصيد الختامي مقابل ملف PDF الأصلي",
                "راجع بعض المعاملات عشوائياً، خصوصاً التحويلات والمبالغ الكبيرة",
                "احتفظ بكشف الحساب الأصلي عند استخدام البيانات لأغراض رسمية أو مالية",
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

        {/* Section 7 - FAQ */}
        <FaqSection
          title="الأسئلة الشائعة"
          subtitle="كل ما تحتاج معرفته حول تحويل كشوفات الحساب الكويتية إلى Excel أو CSV"
          items={kuwaitFaqs}
          variant="cards"
        />

        {/* Section 8 - Video Demo */}
        <VideoDemo
          title="شاهد كيف يعمل المحول"
          subtitle="تعرّف على كيفية تحويل كشف حسابك البنكي الكويتي من PDF إلى Excel أو CSV في أقل من 30 ثانية — بدون تسجيل وبدون تثبيت أي برنامج."
          badgeText="شاهد العملية في العمل"
        />

        {/* Section 9 - Final CTA */}
        <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              جرّب محول كشف الحساب الآن
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              ارفع كشف حسابك البنكي الكويتي بصيغة PDF، راجع المعاملات، ثم نزّل ملف Excel أو CSV منظم.
            </p>
            <a
              href="/app"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
            >
              تحويل كشف الحساب إلى Excel
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">↑</span>
            </a>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-500">
              {["مجاناً", "آمن", "بدون تسجيل", "معاينة قابلة للتعديل"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <span className="text-emerald-500">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </span>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
