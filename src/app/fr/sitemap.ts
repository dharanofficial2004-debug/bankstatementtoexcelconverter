import type { MetadataRoute } from "next";
import { frenchOrigin, frenchPages, frenchPath } from "@/lib/frenchSeo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified: deployment time is not the content modification date.
  return frenchPages.map((page) => ({ url: frenchOrigin + frenchPath(page) }));
}
