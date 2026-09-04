export default function ArJoLayout({
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
