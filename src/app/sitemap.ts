import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { usBanks } from "@/lib/usBanks";

function getRoutes(baseDir: string, currentDir: string = ""): string[] {
  const routes: string[] = [];
  const fullPath = path.join(baseDir, currentDir);
  
  if (!fs.existsSync(fullPath)) return routes;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip private folders, route groups, api routes, static assets, and separated sitemap folders
      if (
        entry.name.startsWith("_") ||
        entry.name.startsWith("(") ||
        entry.name.startsWith("[") ||
        entry.name === "api" ||
        entry.name === "fonts" ||
        entry.name === "auth" ||
        (currentDir === "" && entry.name === "fr") ||
        (currentDir === "" && entry.name === "banks")
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
  const baseUrl = "https://bankstatementtoexcelconverter.com";
  const lastModified = new Date();

  // Try to find the app directory, either in src/app or app/
  const srcAppDir = path.join(process.cwd(), "src", "app");
  const rootAppDir = path.join(process.cwd(), "app");
  
  const appDir = fs.existsSync(srcAppDir) ? srcAppDir : rootAppDir;
  
  const dynamicRoutes = getRoutes(appDir);
  const usBankRoutes = [
    "/banks/us",
    ...Object.keys(usBanks).map((slug) => `/banks/us/${slug}`),
  ];
  
  const routes: MetadataRoute.Sitemap = [...dynamicRoutes, ...usBankRoutes].map((route) => {
    // Format the URL
    const normalizedRoute = route === "" ? "" : route.replace(/\\/g, "/");
    const url = normalizedRoute === "" ? baseUrl : `${baseUrl}${normalizedRoute}`;
    
    // Assign priorities based on route importance
    let priority = 0.9;
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" | "hourly" | "always" | "never" = "weekly";
    
    if (route === "") {
      priority = 1.0;
      changeFrequency = "daily";
    } else if (route === "pricing") {
      priority = 0.8;
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
