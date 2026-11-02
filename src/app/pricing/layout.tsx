import type { Metadata } from "next";
import { withPageSocialMetadata } from "@/lib/pageSocialMetadata";

export const metadata: Metadata = withPageSocialMetadata(
  {
    title: "Pricing",
    description:
      "See StatementToExcel pricing. Preview bank statement conversions for free, then choose pay-per-conversion or a lifetime plan.",
    alternates: {
      canonical: "https://www.bankstatementtoexcelconverter.com/pricing",
    },
  },
  "/pricing",
);

export default function PricingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
