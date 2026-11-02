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
      // Skip private routes, route groups, API routes, and static assets.
      if (
        entry.name.startsWith("_") ||
        entry.name.startsWith("(") ||
        entry.name.startsWith("[") ||
        entry.name === "api" ||
        entry.name === "fonts" ||
        entry.name === "admin" ||
        entry.name === "app" ||
        entry.name === "auth" ||
        (currentDir === "" &&
          ["ar-bh", "ar-jo", "ar-kw", "banks", "blog", "de", "fr", "uk", "us"].includes(entry.name))
      ) {
        continue;
      }

      const newPath = currentDir ? `${currentDir}/${entry.name}` : entry.name;
      routes.push(...getRoutes(baseDir, newPath));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      // If a page.tsx exists in the current directory, it's a route
      routes.push(currentDir);
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bankstatementtoexcelconverter.com";

  // Try to find the app directory, either in src/app or app/
  const srcAppDir = path.join(process.cwd(), "src", "app");
  const rootAppDir = path.join(process.cwd(), "app");

  const appDir = fs.existsSync(srcAppDir) ? srcAppDir : rootAppDir;

  const routes = getRoutes(appDir);

  return routes.map((route) => ({
    url: route === "" ? baseUrl : `${baseUrl}/${route.replace(/\\/g, "/")}`,
  }));
}
