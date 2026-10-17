import "server-only";
import { SignJWT, importPKCS8 } from "jose";

const VERTEX_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";

export async function getVertexAccessToken(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Vertex credentials are not configured.");
  }
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(privateKey, "RS256");
  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/cloud-platform" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(serviceAccountEmail)
    .setAudience(VERTEX_TOKEN_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("Failed to authenticate with Vertex AI.");
  }
  const { access_token } = await tokenRes.json();
  return access_token as string;
}

export function vertexGenerateUrl(projectId: string, location: string, model: string): string {
  return `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
}
