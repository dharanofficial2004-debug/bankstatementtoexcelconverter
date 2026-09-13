import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { guideBaseUrl, type Guide } from "@/lib/seoGuides";

function Inline({ text }: { text: string }) {
  return <>{text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return link ? <Link className="text-primary-600 underline underline-offset-4 hover:text-primary-700 break-words" href={link[2]} key={index}>{link[1]}</Link> : part;
  })}</>;
}
function Body({ text }: { text: string }) {
  return <>{text.trim().split(/\n\s*\n/).map((block, index) => {
    if (block.startsWith("### ")) return <h3 key={index} className="text-xl font-semibold text-slate-900 mt-8 mb-4"><Inline text={block.slice(4)} /></h3>;
    if (block.startsWith("## ")) return <h2 key={index} className="text-2xl font-bold text-slate-900 mt-12 mb-4"><Inline text={block.slice(3)} /></h2>;
    if (block.startsWith("|")) {
      const rows = block.split("\n").filter((line) => !/^\|[\s:|\-]+\|$/.test(line)).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
      return <div key={index} className="overflow-x-auto my-6 rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{rows[0].map((cell, i) => <th scope="col" className="p-3 text-slate-900" key={i}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, i) => <tr className="border-t border-slate-200" key={i}>{row.map((cell, j) => <td className="p-3 text-slate-700" key={j}><Inline text={cell} /></td>)}</tr>)}</tbody></table></div>;
    }
    if (/^(\d+\. |\- )/.test(block)) {
      const ordered = /^\d/.test(block);
      const List = ordered ? "ol" : "ul";
      return <List key={index} className={`${ordered ? "list-decimal" : "list-disc"} pl-6 space-y-3 text-slate-700 leading-relaxed mb-6`}>{block.split("\n").map((line, i) => <li key={i}><Inline text={line.replace(/^(\d+\. |\- )/, "")} /></li>)}</List>;
    }
    return <p key={index} className="text-slate-700 leading-relaxed mb-5"><Inline text={block.replace(/\n/g, " ")} /></p>;
  })}</>;
}
export default function SeoGuide({ guide }: { guide: Guide }) {
  const isBlog = guide.route.startsWith("/blog/");
  const crumbs = [{ name: "Home", item: guideBaseUrl }, ...(isBlog ? [{ name: "Blog", item: `${guideBaseUrl}/blog` }] : []), { name: guide.h1, item: guideBaseUrl + guide.route }];
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: guide.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    ...(isBlog ? [{ "@context": "https://schema.org", "@type": "Article", headline: guide.h1, description: guide.description, inLanguage: "en", url: guideBaseUrl + guide.route, mainEntityOfPage: { "@type": "WebPage", "@id": guideBaseUrl + guide.route }, author: { "@type": "Organization", name: "StatementToExcel", url: guideBaseUrl }, publisher: { "@type": "Organization", name: "StatementToExcel", url: guideBaseUrl } }] : []),
  ];
  const Cta = () => <Link href="/app" className="btn-primary inline-flex items-center justify-center gap-2 text-center whitespace-normal">{guide.cta}<ArrowRight size={17} className="shrink-0" /></Link>;
  return <><Navbar /><main className="pt-20 bg-white"><header className="bg-slate-50 border-b border-slate-200 py-12 sm:py-16"><div className="max-w-3xl mx-auto px-4"><nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6"><ol className="flex flex-wrap gap-2">{crumbs.map((crumb, i) => <li key={crumb.item}>{i > 0 && <span aria-hidden="true" className="mr-2">/</span>}{i === crumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <Link href={i === 0 ? "/" : "/blog"}>{crumb.name}</Link>}</li>)}</ol></nav><h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">{guide.h1}</h1><p className="text-lg text-slate-600 leading-relaxed mb-8">{guide.hero}</p><div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 sm:p-6 flex flex-col items-start gap-4"><Cta /><Link href={guide.secondary.href} className="text-primary-600 underline underline-offset-4">{guide.secondary.label}</Link></div></div></header><article className="max-w-3xl mx-auto px-4 py-10 sm:py-14" data-seo-content><Body text={guide.body} /><section aria-labelledby="guide-faqs" className="mt-12"><h2 id="guide-faqs" className="text-2xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>{guide.faqs.map((faq) => <div key={faq.question} className="mb-7"><h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3><p className="text-slate-700 leading-relaxed">{faq.answer}</p></div>)}</section><div className="mt-12 rounded-2xl bg-primary-50 border border-primary-100 p-6"><p className="text-slate-700 mb-5">{guide.final}</p><Cta /></div></article></main><Footer />{schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}</>;
}
