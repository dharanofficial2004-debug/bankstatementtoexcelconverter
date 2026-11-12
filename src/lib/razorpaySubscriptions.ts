import crypto from "crypto";

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  has_scheduled_changes?: boolean;
  notes?: Record<string, unknown> | unknown[];
}

export interface RazorpayPlan {
  id: string;
  period: string;
  interval: number;
  item: {
    amount: number;
    currency: string;
  };
}

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured on the server.");
  }
  return {
    keyId,
    authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    keySecret,
  };
}

export function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}

export function unixTimestampToIso(timestamp: number | null | undefined): string | null {
  return typeof timestamp === "number" && Number.isFinite(timestamp)
    ? new Date(timestamp * 1000).toISOString()
    : null;
}

export async function fetchRazorpaySubscription(
  subscriptionId: string,
  authorization: string
): Promise<RazorpaySubscription> {
  const response = await fetch(
    `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { headers: { Authorization: authorization }, cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(`Razorpay subscription lookup failed with status ${response.status}.`);
  }
  return response.json() as Promise<RazorpaySubscription>;
}

export async function fetchRazorpayPlan(
  planId: string,
  authorization: string
): Promise<RazorpayPlan> {
  const response = await fetch(
    `https://api.razorpay.com/v1/plans/${encodeURIComponent(planId)}`,
    { headers: { Authorization: authorization }, cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(`Razorpay plan lookup failed with status ${response.status}.`);
  }
  return response.json() as Promise<RazorpayPlan>;
}
