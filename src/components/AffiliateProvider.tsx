"use client";

import { AffitorProvider } from "@affitor/sdk/react";

export default function AffiliateProvider({ children }: { children: React.ReactNode }) {
  return <AffitorProvider programId="1155">{children}</AffitorProvider>;
}
