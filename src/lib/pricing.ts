export type PlanType = "free" | "lifetime" | "payg";

export const LIFETIME_PRICE_INR = 8300;         // ≈ $100 USD — used by Razorpay (INR only)
export const PER_CONVERSION_PRICE_INR = 166;    // ≈ $2 USD  — used by Razorpay (INR only)

// Display-only USD prices (shown to users in the UI)
export const LIFETIME_PRICE_USD = 100;
export const PER_CONVERSION_PRICE_USD = 2;

export const LIFETIME_OFFER_LIMIT = 10;

export const PLAN_NAMES: Record<PlanType, string> = {
  free: "Free",
  lifetime: "Lifetime",
  payg: "Pay per Conversion",
};

export function inrToPaisa(amountINR: number): number {
  return Math.round(amountINR * 100);
}

/** @deprecated — kept for legacy compatibility, do not use in UI */
export function formatINR(amountINR: number): string {
  return `₹${amountINR.toLocaleString("en-IN")}`;
}

export function formatUSD(amountUSD: number): string {
  return `$${amountUSD.toLocaleString("en-US")}`;
}

export interface DocumentMetrics {
  pages: number;
  words: number;
  characters: number;
}

export interface PricingTier {
  minScore: number;
  maxScore: number;
  priceUSD: number;
}

export interface PricingResult {
  pageScore: number;
  wordScore: number;
  characterScore: number;
  sizeScore: number;
  documentSize: string;
  priceUSD: number;
}

export const PRICING_TABLE: PricingTier[] = [
  { minScore: 1, maxScore: 10, priceUSD: 2 },
  { minScore: 11, maxScore: 20, priceUSD: 3 },
  { minScore: 21, maxScore: 30, priceUSD: 4 },
  { minScore: 31, maxScore: 40, priceUSD: 5 },
  { minScore: 41, maxScore: 50, priceUSD: 6 },
  { minScore: 51, maxScore: 60, priceUSD: 7 },
  { minScore: 61, maxScore: 80, priceUSD: 9 },
  { minScore: 81, maxScore: Infinity, priceUSD: 12 },
];

export function calculateSizeScore(metrics: DocumentMetrics): {
  pageScore: number;
  wordScore: number;
  characterScore: number;
  sizeScore: number;
} {
  const pageScore = metrics.pages;
  const wordScore = Math.ceil(metrics.words / 300);
  const characterScore = Math.ceil(metrics.characters / 1500);
  const sizeScore = Math.max(pageScore, wordScore, characterScore);

  return { pageScore, wordScore, characterScore, sizeScore };
}

export function getDocumentSizeLabel(sizeScore: number): string {
  if (sizeScore <= 5) return "Small Document";
  if (sizeScore <= 15) return "Medium Document";
  if (sizeScore <= 30) return "Large Document";
  if (sizeScore <= 50) return "Very Large Document";
  return "Extra Large Document";
}

export function getPrice(metrics: DocumentMetrics): PricingResult {
  const scores = calculateSizeScore(metrics);
  const tier = PRICING_TABLE.find(
    (t) => scores.sizeScore >= t.minScore && scores.sizeScore <= t.maxScore
  );
  const priceUSD = tier ? tier.priceUSD : PRICING_TABLE[PRICING_TABLE.length - 1].priceUSD;
  const documentSize = getDocumentSizeLabel(scores.sizeScore);

  return {
    ...scores,
    documentSize,
    priceUSD,
  };
}

export function priceToSmallestUnit(priceUSD: number): number {
  return Math.round(priceUSD * 100);
}
