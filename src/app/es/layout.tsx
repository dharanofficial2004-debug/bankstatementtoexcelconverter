export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  // The root document owns the <html> element; this scopes the locale to every
  // Spanish page without changing the existing site's global layout.
  return <div lang="es" dir="ltr">{children}</div>;
}
