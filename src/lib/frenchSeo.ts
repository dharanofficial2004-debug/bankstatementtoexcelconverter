import type { Metadata } from "next";
import home from "@/content/fr/home.json";
import excel from "@/content/fr/excel.json";
import choice from "@/content/fr/choice.json";
import csv from "@/content/fr/csv.json";
import ocr from "@/content/fr/ocr.json";
import extract from "@/content/fr/extract.json";
import importGuide from "@/content/fr/import.json";
import multi from "@/content/fr/multi.json";
import check from "@/content/fr/check.json";
import cash from "@/content/fr/cash.json";
import help from "@/content/fr/help.json";

export const frenchPages = [home, excel, choice, csv, ocr, extract, importGuide, multi, check, cash, help];
export type FrenchPage = (typeof frenchPages)[number];
export const frenchOrigin = "https://bankstatementtoexcelconverter.com";
export function frenchPath(page: FrenchPage) { return `/fr${page.slug ? `/${page.slug}` : ""}`; }
export function getFrenchPage(id: string): FrenchPage {
  const page = frenchPages.find((item) => item.id === id);
  if (!page) throw new Error(`Unknown French content: ${id}`);
  return page;
}
export function frenchMetadata(id: string): Metadata {
  const page = getFrenchPage(id);
  const url = frenchOrigin + frenchPath(page);
  const images = [{ url: `${frenchOrigin}/images/fr-social.png`, width: 1200, height: 630, alt: "StatementToExcel — Du relevé PDF aux opérations vérifiables" }];
  return {
    title: { absolute: page.title },
    description: page.description,
    keywords: [],
    alternates: { canonical: url, languages: { fr: url } },
    robots: { index: true, follow: true },
    openGraph: { title: page.title, description: page.description, url, siteName: "StatementToExcel", locale: "fr_FR", type: "website", images },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: images.map((image) => image.url) },
  };
}

export const frenchRelated: Record<string, string[]> = {
  home: ["excel", "csv", "ocr", "choice", "extract", "import", "multi", "check", "cash", "help"],
  excel: ["csv", "ocr", "extract", "check"],
  choice: ["excel", "csv", "help"],
  csv: ["excel", "import", "extract"],
  ocr: ["excel", "help", "check"],
  extract: ["excel", "csv", "check"],
  import: ["excel", "csv", "cash"],
  multi: ["excel", "ocr", "check"],
  check: ["extract", "multi", "import"],
  cash: ["import", "check", "excel"],
  help: ["ocr", "multi", "csv"],
};
