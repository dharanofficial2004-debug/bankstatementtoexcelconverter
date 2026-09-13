import { MetadataRoute } from "next";
import catalog from "@/content/seo-guides/catalog.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bankstatementtoexcelconverter.com";
  const lastModified = new Date();

  return [
    ...catalog.filter((guide) => guide.route.startsWith("/blog/") && guide.id !== "pdf-excel").map((guide) => ({
      url: `https://www.bankstatementtoexcelconverter.com${guide.route}`, lastModified, changeFrequency: "monthly" as const, priority: 0.75,
    })),
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.bankstatementtoexcelconverter.com/blog/convert-bank-statement-pdf-to-excel",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/how-to-download-icici-bank-statement-in-excel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/how-to-download-canara-bank-statement-in-excel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/how-to-download-hdfc-bank-statement-in-excel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/how-to-download-union-bank-statement-in-excel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/how-to-download-kotak-bank-statement-in-excel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];
}
