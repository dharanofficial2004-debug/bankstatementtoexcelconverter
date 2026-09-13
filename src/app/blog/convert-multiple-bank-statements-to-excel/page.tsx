import SeoGuide from "@/components/landing/SeoGuide";
import { getGuide, guideMetadata } from "@/lib/seoGuides";

export const metadata = guideMetadata("multiple");

export default function Page() {
  return <SeoGuide guide={getGuide("multiple")} />;
}
