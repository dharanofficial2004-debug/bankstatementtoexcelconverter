import type { Metadata } from "next";
import Script from "next/script";
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
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
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-D1BQKKX3CJ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D1BQKKX3CJ');
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

