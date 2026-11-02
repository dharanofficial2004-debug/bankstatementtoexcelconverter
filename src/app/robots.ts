import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/preview/", "/auth/", "/api/"],
    },
    sitemap: [
      "https://www.bankstatementtoexcelconverter.com/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/blog/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/fr/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/de/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/ar-jo/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/ar-bh/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/ar-kw/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/us/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/uk/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/banks/in/sitemap.xml",
      "https://www.bankstatementtoexcelconverter.com/banks/us/sitemap.xml",
    ],
  };
}
