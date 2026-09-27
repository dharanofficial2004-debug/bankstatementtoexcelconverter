import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("extract");

export default function Page() {
  return <FrenchLandingPage id="extract" />;
}
