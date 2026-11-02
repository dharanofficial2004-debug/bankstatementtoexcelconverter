import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

function getRoutes(baseDir: string, currentDir: string = ""): string[] {
  const routes: string[] = [];
  const fullPath = path.join(baseDir, currentDir);

  if (!fs.existsSync(fullPath)) return routes;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (
        entry.name.startsWith("_") ||
        entry.name.startsWith("(") ||
        entry.name.startsWith("[") ||
        entry.name === "api" ||
        entry.name === "fonts" ||
        entry.name === "auth"
      ) {
        continue;
      }
      const newPath = currentDir ? `${currentDir}/${entry.name}` : entry.name;
      routes.push(...getRoutes(baseDir, newPath));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      routes.push(currentDir);
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com/ar-bh";

  const srcAppDir = path.join(process.cwd(), "src", "app", "ar-bh");
  const rootAppDir = path.join(process.cwd(), "app", "ar-bh");
  const appDir = fs.existsSync(srcAppDir) ? srcAppDir : rootAppDir;

  const dynamicRoutes = getRoutes(appDir);

  return dynamicRoutes.map((route) => ({
    url: route === "" ? baseUrl : `${baseUrl}/${route.replace(/\\/g, "/")}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));
}
