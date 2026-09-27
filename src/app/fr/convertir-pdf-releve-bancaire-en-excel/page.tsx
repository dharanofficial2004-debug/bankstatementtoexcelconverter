import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("ocr");

export default function Page() {
  return <FrenchLandingPage id="ocr" />;
}
