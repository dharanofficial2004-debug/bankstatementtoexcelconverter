export default function ArBhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="ar" dir="rtl">
      {children}
    </div>
  );
}
