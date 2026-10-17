import "server-only";
import Affitor from "@affitor/sdk/server";

export function getAffitorServer() {
  const apiKey = process.env.AFFITOR_API_KEY;
  if (!apiKey) return null;
  return new Affitor({
    apiKey,
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
  });
}

export function validAffitorClickId(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,200}$/.test(value) ? value : undefined;
}
