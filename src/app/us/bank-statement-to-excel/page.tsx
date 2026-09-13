import SeoGuide from "@/components/landing/SeoGuide";
import { getGuide, guideMetadata } from "@/lib/seoGuides";

export const metadata = guideMetadata("us");

export default function Page() {
  return <SeoGuide guide={getGuide("us")} />;
}
