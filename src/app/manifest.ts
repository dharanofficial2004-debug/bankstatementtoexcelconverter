import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StatementToExcel",
    short_name: "StatementToExcel",
    description: "Convert PDF bank statements into editable Excel spreadsheets instantly. Preview, edit and export to XLSX or CSV online.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
