import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    languages: {
      "fr": "https://bankstatementtoexcelconverter.com/fr",
      "en": "https://bankstatementtoexcelconverter.com",
    },
  },
};

export default function FrenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
