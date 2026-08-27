import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

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
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isPtBr = pathname.startsWith("/pt-br");
  const lang = isPtBr ? "pt-BR" : "en";
  const dir = "ltr";

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
    <html lang={lang} dir={dir}>
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
              gtag('config', 'G-D1BQKKX3CJ', {
                send_page_view: true,
                allow_google_signals: true,
                allow_ad_personalization_signals: true
              });
            `,
          }}
        />
        <Script
          id="traffic-source-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (sessionStorage.getItem('traffic_source')) return;
                  var ref = document.referrer.toLowerCase();
                  var params = new URLSearchParams(window.location.search);
                  var utmSource = (params.get('utm_source') || '').toLowerCase();
                  var utmMedium = (params.get('utm_medium') || '').toLowerCase();
                  var source = 'direct';
                  if (utmSource) {
                    if (utmMedium === 'cpc' || utmMedium === 'paid') source = 'paid_search';
                    else if (utmSource === 'youtube' || utmMedium === 'video') source = 'youtube';
                    else if (['facebook','instagram','twitter','linkedin','pinterest','tiktok'].indexOf(utmSource) > -1) source = 'social';
                    else if (utmMedium === 'email') source = 'email';
                    else source = 'utm_' + utmSource;
                  } else if (ref) {
                    if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\./.test(ref)) source = 'organic_search';
                    else if (/youtube\.com/.test(ref)) source = 'youtube';
                    else if (/facebook\.|instagram\.|twitter\.|t\.co|linkedin\.|pinterest\.|tiktok\./.test(ref)) source = 'social';
                    else if (/chatgpt\.|perplexity\.|gemini\.|claude\.|copilot\.|you\.com|phind\./.test(ref)) source = 'ai_tools';
                    else source = 'referral';
                  }
                  sessionStorage.setItem('traffic_source', source);
                  if (typeof gtag === 'function') {
                    gtag('set', 'user_properties', { traffic_source: source });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xeys6ehquc");
            `,
          }}
        />
      </head>
      <body className={`antialiased ${inter.variable} ${jetbrainsMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

