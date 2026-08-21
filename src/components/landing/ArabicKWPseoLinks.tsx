import React from "react";
import Link from "next/link";

export default function ArabicKWPseoLinks() {
  const kuwaitPages = [
    { href: "/ar-kw/banks", title: "بنوك الكويت" },
    { href: "/ar-kw", title: "الرئيسية العربية" },
  ];

  const relatedTools = [
    { href: "/", title: "محول كشف الحساب إلى Excel" },
    { href: "/banks/in", title: "تحويل كشوفات البنوك الهندية إلى Excel" },
    { href: "/banks/in/canara-bank", title: "تحويل كشف حساب بنك إلى Excel" },
    { href: "/banks/us", title: "بنوك الولايات المتحدة" },
  ];

  return (
    <section className="py-20 px-4 bg-white" aria-label="البنوك الكويتية والخدمات ذات الصلة">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          أدوات ذات صلة
        </h2>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {relatedTools.map((tool, idx) => (
            <Link
              key={idx}
              href={tool.href}
              className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              {tool.title}
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-lg font-semibold text-slate-900 mb-6">
            صفحات ذات صلة:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {kuwaitPages.map((page, idx) => (
              <Link
                key={idx}
                href={page.href}
                className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                {page.title}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-6">
            <Link
              href="/ar-kw"
              className="text-primary-600 hover:underline font-medium"
            >
              الصفحة الرئيسية العربية
            </Link>
            <Link
              href="/"
              className="text-primary-600 hover:underline font-medium"
            >
              الصفحة الرئيسية الإنجليزية
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
