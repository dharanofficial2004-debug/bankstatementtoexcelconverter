import "server-only";
import crypto from "crypto";
import { SignJWT, importPKCS8 } from "jose";
import { supabaseAdmin } from "./supabaseServer";

export const VERTEX_MODEL = "gemini-2.5-flash-lite";
export const VERTEX_LOCATION = "global";
export const PRICING_VERSION = "gemini-2.5-flash-lite:2026-06-01";

export async function getVertexAccessToken(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("vertex_unconfigured");
  }
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n").replace(/\\r/g, "").trim();
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(privateKey, "RS256");
  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/cloud-platform" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(serviceAccountEmail)
    .setAudience("https://oauth2.googleapis.com/token")
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
  if (!tokenRes.ok) throw new Error("vertex_token_failed");
  const { access_token } = await tokenRes.json();
  return access_token as string;
}

export function estimateCostUsd(inputTokens: number | null, outputTokens: number | null): number | null {
  if (inputTokens == null && outputTokens == null) return null;
  const input = inputTokens ?? 0;
  const output = outputTokens ?? 0;
  return (input / 1_000_000) * 0.10 + (output / 1_000_000) * 0.40;
}

export interface GeminiCallResult {
  text: string;
  usage: {
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
    cached_tokens: number | null;
    thinking_tokens: number | null;
    raw: unknown;
  };
  providerResponseId: string | null;
  finishReason: string | null;
}

const PARSE_PROMPT = `[ignoring loop detection]
You are a passive text parser. Organize the statement text into the JSON schema. Do not modify, re-calculate, scale, or assume decimal positions. If a row reads '2.00', the amount field MUST be 2.00.
If a Cheque Number is present, extract it. Otherwise leave cheque_number as "".
For category, classify when confident; if unsure set category to null. If description contains UPI, category is UPI.
Do not invent transactions. If a value is unreadable, omit it rather than guessing.
OUTPUT STRICTLY VALID JSON ONLY.`;

export async function parseStatementChunk(text: string): Promise<GeminiCallResult> {
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
  if (!project) throw new Error("vertex_unconfigured");
  const accessToken = await getVertexAccessToken();
  const vertexUrl = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  const callStart = Date.now();
  console.log("\n┌─────────────────────────────────────────────");
  console.log(`│ 🤖 GEMINI API CALL`);
  console.log(`│ Model   : ${VERTEX_MODEL}`);
  console.log(`│ Location: ${VERTEX_LOCATION}`);
  console.log(`│ Input   : ${text.length.toLocaleString()} chars`);
  console.log(`│ Time    : ${new Date().toISOString()}`);
  console.log("└─────────────────────────────────────────────");

  try {
    const response = await fetch(vertexUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${PARSE_PROMPT}\n\nExtract transactions from this bank statement:\n\n${text}` }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              bank_name: { type: "STRING" },
              currency_symbol: { type: "STRING" },
              uncertainty: { type: "BOOLEAN" },
              notices: { type: "ARRAY", items: { type: "STRING" } },
              transactions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    date: { type: "STRING" },
                    description: { type: "STRING" },
                    debit: { type: "NUMBER" },
                    credit: { type: "NUMBER" },
                    balance: { type: "NUMBER" },
                    cheque_number: { type: "STRING" },
                    category: { type: "STRING", nullable: true },
                    uncertain: { type: "BOOLEAN" },
                  },
                  required: ["date", "description", "debit", "credit", "balance"],
                },
              },
            },
            required: ["bank_name", "currency_symbol", "transactions"],
          },
        },
      }),
    });

    const durationMs = Date.now() - callStart;

    if (!response.ok) {
      const errText = await response.text();
      console.log("\n┌─────────────────────────────────────────────");
      console.log(`│ ❌ GEMINI API ERROR`);
      console.log(`│ Status  : ${response.status} ${response.statusText}`);
      console.log(`│ Duration: ${durationMs}ms`);
      console.log(`│ Body    : ${errText.slice(0, 200)}`);
      console.log("└─────────────────────────────────────────────\n");
      const err = new Error(`vertex_http_${response.status}`);
      (err as Error & { body?: string }).body = errText.slice(0, 300);
      throw err;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) throw new Error("vertex_empty");

    const meta = data.usageMetadata || {};
    const input = typeof meta.promptTokenCount === "number" ? meta.promptTokenCount : null;
    const output = typeof meta.candidatesTokenCount === "number" ? meta.candidatesTokenCount : null;
    const total =
      typeof meta.totalTokenCount === "number"
        ? meta.totalTokenCount
        : input != null && output != null
          ? input + output
          : null;
    const cached = typeof meta.cachedContentTokenCount === "number" ? meta.cachedContentTokenCount : null;
    const thinking = typeof meta.thoughtsTokenCount === "number" ? meta.thoughtsTokenCount : null;
    const finishReason = data.candidates?.[0]?.finishReason || null;
    const costUsd = estimateCostUsd(input, output);

    // Parse response to count transactions
    let txCount = 0;
    try { txCount = (JSON.parse(content)?.transactions?.length) ?? 0; } catch { /* ignore */ }

    console.log("\n┌─────────────────────────────────────────────");
    console.log(`│ ✅ GEMINI API RESPONSE`);
    console.log(`│ Duration     : ${durationMs}ms`);
    console.log(`│ Finish reason: ${finishReason}`);
    console.log(`│ ─── Tokens ───────────────────────────────`);
    console.log(`│ Input tokens : ${input ?? "n/a"}`);
    console.log(`│ Output tokens: ${output ?? "n/a"}`);
    console.log(`│ Total tokens : ${total ?? "n/a"}`);
    if (cached)   console.log(`│ Cached tokens: ${cached}`);
    if (thinking) console.log(`│ Think tokens : ${thinking}`);
    console.log(`│ ─── Result ───────────────────────────────`);
    console.log(`│ Transactions : ${txCount}`);
    console.log(`│ Output chars : ${content.length.toLocaleString()}`);
    console.log(`│ Est. cost    : $${costUsd?.toFixed(6) ?? "n/a"}`);
    console.log("└─────────────────────────────────────────────\n");

    return {
      text: content,
      usage: {
        input_tokens: input,
        output_tokens: output,
        total_tokens: total,
        cached_tokens: cached,
        thinking_tokens: thinking,
        raw: meta,
      },
      providerResponseId: data.responseId || data.candidates?.[0]?.index != null ? String(data.responseId || "") : null,
      finishReason,
    };
  } catch (err) {
    const durationMs = Date.now() - callStart;
    if ((err as Error).message !== "vertex_empty" && !(err as Error).message.startsWith("vertex_http_")) {
      console.log("\n┌─────────────────────────────────────────────");
      console.log(`│ ❌ GEMINI API EXCEPTION`);
      console.log(`│ Duration: ${durationMs}ms`);
      console.log(`│ Error   : ${(err as Error).message}`);
      console.log("└─────────────────────────────────────────────\n");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function recordAttempt(row: Record<string, unknown>): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from("gemini_attempts").insert(row).select("id").single();
  if (error) {
    console.error("[gemini_attempts] insert failed");
    return null;
  }
  return data?.id ?? null;
}

export async function completeAttempt(id: string | null, patch: Record<string, unknown>) {
  if (!supabaseAdmin || !id) return;
  await supabaseAdmin.from("gemini_attempts").update(patch).eq("id", id);
}

export function newIdempotencyKey(jobId: string, chunkSeq: number, attempt: number) {
  return crypto.createHash("sha256").update(`${jobId}:${chunkSeq}:${attempt}`).digest("hex").slice(0, 32);
}
