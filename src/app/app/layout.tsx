import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://bankstatementtoexcelconverter.com/app",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
