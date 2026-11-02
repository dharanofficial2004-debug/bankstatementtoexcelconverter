import type { Metadata } from "next";

const siteUrl = "https://www.bankstatementtoexcelconverter.com";

export function withPageSocialMetadata(
  metadata: Metadata,
  pathname: string,
  locale = "en_US",
): Metadata {
  if (
    typeof metadata.title !== "string" ||
    typeof metadata.description !== "string"
  ) {
    throw new Error("Page social metadata requires a title and description.");
  }

  const url = new URL(pathname, siteUrl).toString();
  const image = `${siteUrl}/opengraph-image`;

  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url,
      siteName: "StatementToExcel",
      locale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [image],
    },
  };
}
