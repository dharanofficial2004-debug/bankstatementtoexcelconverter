import type { ReactNode } from "react";

// A server-rendered language boundary covers all French content without making
// the shared root layout dynamic or changing the application routes.
export default function FrenchLayout({ children }: { children: ReactNode }) {
  return <div lang="fr">{children}</div>;
}
