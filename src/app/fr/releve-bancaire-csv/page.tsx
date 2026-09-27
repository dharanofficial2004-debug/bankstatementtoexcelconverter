import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("csv");

export default function Page() {
  return <FrenchLandingPage id="csv" />;
}
