import { MetadataRoute } from "next";
import { indianBanks } from "@/lib/indianBanks";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bankstatementtoexcelconverter.com/banks/in";
  const lastModified = new Date();

  // Root banks index
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Add all indian bank URLs
  const bankRoutes = Object.keys(indianBanks).map((bankSlug) => ({
    url: `${baseUrl}/${bankSlug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...bankRoutes];
}
