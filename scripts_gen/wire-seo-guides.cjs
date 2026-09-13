const fs = require('fs');
const path = require('path');
const catalog = require('../src/content/seo-guides/catalog.json');
for (const guide of catalog) {
  const directory = path.join(__dirname, '../src/app', guide.route);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'page.tsx'), `import SeoGuide from "@/components/landing/SeoGuide";
import { getGuide, guideMetadata } from "@/lib/seoGuides";

export const metadata = guideMetadata("${guide.id}");

export default function Page() {
  return <SeoGuide guide={getGuide("${guide.id}")} />;
}
`);
}
