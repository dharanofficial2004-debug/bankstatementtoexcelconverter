import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/convert-bank-statement-pdf-to-excel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];
}
