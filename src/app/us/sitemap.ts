import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com";

  return [
    {
      url: "https://www.bankstatementtoexcelconverter.com/us/bank-statement-to-excel",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/us/banks`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
