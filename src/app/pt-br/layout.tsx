// Wraps all Brazilian Portuguese pages with lang="pt-BR" on the content
// root. The root layout is statically cached with lang="en" for CDN
// performance — locale sub-layouts override the language attribute here.
export default function PtBrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="pt-BR" dir="ltr">
      {children}
    </div>
  );
}
