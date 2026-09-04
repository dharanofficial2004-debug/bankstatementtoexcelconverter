import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/us/banks`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
