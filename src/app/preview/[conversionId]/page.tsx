import type { Metadata } from "next";
import PreviewWorkspace from "@/components/app/PreviewWorkspace";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "https://bankstatementtoexcelconverter.com/preview" },
};

export const dynamic = "force-static";

export default function PreviewPage({ params }: { params: { conversionId: string } }) {
  return <PreviewWorkspace conversionId={params.conversionId} />;
}
