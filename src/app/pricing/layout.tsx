import type { Metadata } from "next";
import { withPageSocialMetadata } from "@/lib/pageSocialMetadata";

export const metadata: Metadata = withPageSocialMetadata(
  {
    title: "Pricing",
    description:
      "See StatementToExcel pricing. Start with a free conversion, choose monthly unlimited access, or purchase lifetime access.",
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
