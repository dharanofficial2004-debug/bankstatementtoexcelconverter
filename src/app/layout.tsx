import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "StatementToExcel — Convert Bank Statements to Excel Instantly",
  description:
    "Upload any bank statement PDF. See transactions in a live editable spreadsheet like Google Sheets. Export to Excel or CSV in one click. Free to use.",
  keywords: [
    "bank statement to excel",
    "pdf to excel",
    "bank statement converter",
    "pdf converter",
    "HDFC statement to excel",
    "SBI statement to excel",
  ],
  openGraph: {
    title: "StatementToExcel — Convert Bank Statements to Excel Instantly",
    description:
      "Upload any bank PDF. Preview, edit, and export to Excel or CSV.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
