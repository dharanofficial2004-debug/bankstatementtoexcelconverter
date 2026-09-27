import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("choice");

export default function Page() {
  return <FrenchLandingPage id="choice" />;
}
