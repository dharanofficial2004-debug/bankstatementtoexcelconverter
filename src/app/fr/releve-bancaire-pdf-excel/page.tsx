import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("check");

export default function Page() {
  return <FrenchLandingPage id="check" />;
}
