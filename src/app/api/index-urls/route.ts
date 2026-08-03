import { NextRequest, NextResponse } from "next/server";
import { indianBanks } from "@/lib/indianBanks";

const BASE_URL = "https://bankstatementtoexcelconverter.com";

// All PSEO pages grouped by section
const ALL_PSEO_URLS: string[] = [
  // ── Main landing variants ──────────────────────────────────────
  `${BASE_URL}/`,
  `${BASE_URL}/pricing`,
  `${BASE_URL}/bank-statement-converter`,
  `${BASE_URL}/bank-statement-pdf-to-excel-converter`,
  `${BASE_URL}/bank-statement-to-csv`,
  `${BASE_URL}/bank-statement-to-excel`,
  `${BASE_URL}/pdf-bank-statement-to-excel`,
  `${BASE_URL}/pdf-to-excel-bank-statement`,

  // ── French PSEO pages ──────────────────────────────────────────
  `${BASE_URL}/fr`,
  `${BASE_URL}/fr/convertir-pdf-releve-bancaire-en-excel`,
  `${BASE_URL}/fr/convertir-releve-bancaire-en-excel`,
  `${BASE_URL}/fr/convertisseur-pdf-releve-bancaire`,
  `${BASE_URL}/fr/convertisseur-releve-bancaire`,
  `${BASE_URL}/fr/convertisseur-releve-bancaire-excel`,
  `${BASE_URL}/fr/extracteur-releve-bancaire`,
  `${BASE_URL}/fr/pdf-releve-bancaire-vers-excel`,
  `${BASE_URL}/fr/releve-bancaire-csv`,
  `${BASE_URL}/fr/releve-bancaire-pdf-excel`,
  `${BASE_URL}/fr/releve-bancaire-vers-excel`,

  // ── Indian Banks PSEO pages ────────────────────────────────────
  `${BASE_URL}/banks/in`,
  ...Object.keys(indianBanks).map((slug) => `${BASE_URL}/banks/in/${slug}`),
];

// ─── Google OAuth2 JWT helper (no external library needed) ────────────────────

function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function signWithPrivateKey(data: string, privateKeyPem: string): Promise<string> {
  // Clean up the PEM string (handles escaped newlines from env vars)
  const pemClean = privateKeyPem
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  const keyBuffer = Buffer.from(pemClean, "base64");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(data)
  );

  return Buffer.from(signature)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getGoogleAccessToken(): Promise<string> {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceEmail || !privateKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars are missing.");
  }

  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: serviceEmail,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const signingInput = `${header}.${payload}`;
  const signature = await signWithPrivateKey(signingInput, privateKey);
  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to get access token: ${err}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

// ─── Submit a single URL to Google Indexing API ───────────────────────────────

async function submitUrl(
  url: string,
  accessToken: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ url: string; status: number; ok: boolean; body: unknown }> {
  const res = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url, type }),
    }
  );

  const body = await res.json();
  return { url, status: res.status, ok: res.ok, body };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Require admin password to prevent public abuse
    const { password, urls, section } = await request.json() as {
      password: string;
      urls?: string[];        // optional: pass specific URLs to index
      section?: "all" | "fr" | "banks" | "main"; // or index by section
    };

    if (password !== process.env.ADMIN_PASSWORD && password !== "Dharan1424#$") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine which URLs to submit
    let targetUrls: string[] = [];

    if (urls && urls.length > 0) {
      // Explicit list passed in the request body
      targetUrls = urls;
    } else if (section === "fr") {
      targetUrls = ALL_PSEO_URLS.filter((u) => u.includes("/fr"));
    } else if (section === "banks") {
      targetUrls = ALL_PSEO_URLS.filter((u) => u.includes("/banks/in"));
    } else if (section === "main") {
      targetUrls = ALL_PSEO_URLS.filter(
        (u) => !u.includes("/fr") && !u.includes("/banks/in")
      );
    } else {
      // Default: all PSEO URLs
      targetUrls = ALL_PSEO_URLS;
    }

    // Get OAuth2 access token from service account
    const accessToken = await getGoogleAccessToken();

    // Submit URLs with a small delay to respect rate limits (200 URLs/day quota)
    const results: { url: string; status: number; ok: boolean; body: unknown }[] = [];

    for (const url of targetUrls) {
      const result = await submitUrl(url, accessToken);
      results.push(result);
      // 50ms gap between requests
      await new Promise((r) => setTimeout(r, 50));
    }

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);

    return NextResponse.json({
      success: true,
      submitted: results.length,
      succeeded,
      failed: failed.length,
      failedUrls: failed.map((f) => ({ url: f.url, status: f.status, body: f.body })),
      results,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Google Indexing API error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── GET: Check indexing status for a single URL ─────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const password = searchParams.get("password");

    if (password !== process.env.ADMIN_PASSWORD && password !== "Dharan1424#$") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!url) {
      return NextResponse.json(
        { error: "Pass ?url=https://... to check indexing status" },
        { status: 400 }
      );
    }

    const accessToken = await getGoogleAccessToken();

    const res = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(url)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await res.json();
    return NextResponse.json({ url, status: res.status, data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
