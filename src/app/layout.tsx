import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://bankstatementtoexcelconverter.com"),
  title: {
    default: "Bank Statement to Excel Converter | StatementToExcel",
    template: "%s | StatementToExcel",
  },
  description:
    "Convert PDF bank statements into editable Excel spreadsheets instantly. Preview, edit and export to XLSX or CSV online. Free to use and secure.",
  keywords: [
    "bank statement to excel",
    "pdf to excel bank statement",
    "pdf bank statement to excel",
    "bank statement pdf to excel converter",
    "pdf to excel bank statement converter",
    "bank statement converter",
    "bank statement to csv",
    "convert bank statement to excel",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "StatementToExcel — Convert Bank Statements to Excel Instantly",
    description:
      "Convert PDF bank statements into editable Excel spreadsheets instantly. Preview, edit and export to XLSX or CSV online.",
    url: "https://bankstatementtoexcelconverter.com",
    siteName: "StatementToExcel",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StatementToExcel — Convert Bank Statements to Excel Instantly",
    description:
      "Convert PDF bank statements into editable Excel spreadsheets instantly. Preview, edit and export to XLSX or CSV online.",
  },
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bankstatementtoexcelconverter.com/#organization",
        "name": "StatementToExcel",
        "url": "https://bankstatementtoexcelconverter.com",
        "logo": "https://bankstatementtoexcelconverter.com/favicon.ico",
      },
      {
        "@type": "WebSite",
        "@id": "https://bankstatementtoexcelconverter.com/#website",
        "url": "https://bankstatementtoexcelconverter.com",
        "name": "StatementToExcel",
        "publisher": {
          "@id": "https://bankstatementtoexcelconverter.com/#organization",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://bankstatementtoexcelconverter.com/#software",
        "name": "StatementToExcel",
        "url": "https://bankstatementtoexcelconverter.com",
        "applicationCategory": "FinancialApplication",
        "operatingSystem": "All",
        "description": "Convert PDF bank statements into editable Excel spreadsheets instantly.",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "lowPrice": "0.00",
          "highPrice": "4.99",
          "offerCount": "2",
        },
        "publisher": {
          "@id": "https://bankstatementtoexcelconverter.com/#organization",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

