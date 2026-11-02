import { MetadataRoute } from "next";
import { indianBanks } from "@/lib/indianBanks";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com/banks/in";

  // Root banks index
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Add all indian bank URLs
  const bankRoutes = Object.keys(indianBanks).map((bankSlug) => ({
    url: `${baseUrl}/${bankSlug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...bankRoutes];
}
