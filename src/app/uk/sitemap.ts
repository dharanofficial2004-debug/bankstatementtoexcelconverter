import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com";

  return [
    {
      url: `${baseUrl}/uk/banks`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
