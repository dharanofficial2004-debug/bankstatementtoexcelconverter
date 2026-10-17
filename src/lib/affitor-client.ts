"use client";

import { loadAffitor } from "@affitor/sdk";

// Analytics failures must never prevent account creation or login.
export async function trackAffiliateSignup(customerKey: string, email: string, accessToken?: string) {
  try {
    const affitor = await loadAffitor("1155");
    await affitor?.signup(customerKey, email);
    if (accessToken) {
      await fetch("/api/affiliate/lead", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  } catch {
    // Do not log customer details or credentials.
  }
}
