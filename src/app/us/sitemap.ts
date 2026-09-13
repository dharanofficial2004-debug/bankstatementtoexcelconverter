import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bankstatementtoexcelconverter.com";
  const lastModified = new Date();

  return [
    {
      url: "https://www.bankstatementtoexcelconverter.com/us/bank-statement-to-excel",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/us/banks`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
