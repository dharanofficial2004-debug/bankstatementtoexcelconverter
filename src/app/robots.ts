import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/auth/", "/api/"],
    },
    sitemap: [
      "https://bankstatementtoexcelconverter.com/sitemap.xml",
      "https://bankstatementtoexcelconverter.com/fr/sitemap.xml",
      "https://bankstatementtoexcelconverter.com/banks/in/sitemap.xml",
      "https://bankstatementtoexcelconverter.com/banks/us/sitemap.xml",
    ],
  };
}
