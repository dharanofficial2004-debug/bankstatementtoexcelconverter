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
  const baseUrl = "https://bankstatementtoexcelconverter.com/ar-kw";
  const lastModified = new Date();

  const srcAppDir = path.join(process.cwd(), "src", "app", "ar-kw");
  const rootAppDir = path.join(process.cwd(), "app", "ar-kw");

  const appDir = fs.existsSync(srcAppDir) ? srcAppDir : rootAppDir;

  const dynamicRoutes = getRoutes(appDir);

  const routes: MetadataRoute.Sitemap = dynamicRoutes.map((route) => {
    const url = route === "" ? baseUrl : `${baseUrl}/${route.replace(/\\/g, "/")}`;

    let priority = 0.9;
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" | "hourly" | "always" | "never" = "weekly";

    if (route === "") {
      priority = 1.0;
      changeFrequency = "daily";
    }

    return {
      url,
      lastModified,
      changeFrequency,
      priority,
    };
  });

  return routes;
}
