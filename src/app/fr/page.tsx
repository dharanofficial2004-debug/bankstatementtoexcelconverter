import FrenchLandingPage from "@/components/french/FrenchLandingPage";
import { frenchMetadata } from "@/lib/frenchSeo";

export const metadata = frenchMetadata("home");

export default function Page() {
  return <FrenchLandingPage id="home" />;
}
