import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import catalog from "@/content/seo-guides/catalog.json";

export const guideCatalog = catalog;
export const guideBaseUrl = "https://www.bankstatementtoexcelconverter.com";
export function getGuide(id: string) {
  const entry = catalog.find((guide) => guide.id === id);
  if (!entry) throw new Error(`Unknown guide: ${id}`);
  const markdown = fs.readFileSync(path.join(process.cwd(), "src/content/seo-guides", `${id}.md`), "utf8");
  const [body, faqText] = markdown.split("## Frequently asked questions");
  const faqs = (faqText || "").split(/^### /m).filter((part) => part.trim()).map((part) => {
    const [question, ...answer] = part.trim().split("\n");
    return { question, answer: answer.join(" ").trim() };
  });
  return { ...entry, body, faqs };
}
export type Guide = ReturnType<typeof getGuide>;
export function guideMetadata(id: string): Metadata {
  const guide = catalog.find((entry) => entry.id === id)!;
  const url = guideBaseUrl + guide.route;
  return {
    title: { absolute: guide.title }, description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, siteName: "StatementToExcel", locale: "en_US", type: guide.route.startsWith("/blog/") ? "article" : "website" },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
  };
}
