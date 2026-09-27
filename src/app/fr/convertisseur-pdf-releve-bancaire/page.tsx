import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("help");

export default function Page() {
  return <FrenchLandingPage id="help" />;
}
