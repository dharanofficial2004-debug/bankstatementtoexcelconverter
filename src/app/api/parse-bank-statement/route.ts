import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { SignJWT, importPKCS8 } from "jose";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VERTEX_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
const VERTEX_MODEL = "gemini-2.5-flash-lite";
const VERTEX_LOCATION = "global";

async function getVertexAccessToken(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in environment.");
  }
  // Normalize the private key — handle both literal \n and already-newlined strings
  const privateKey = privateKeyRaw
    .replace(/\\n/g, "\n")   // literal \n → real newline
    .replace(/\\r/g, "")     // strip any \r
    .trim();

  console.log("[Vertex Auth] key starts with:", privateKey.substring(0, 40));
  console.log("[Vertex Auth] key includes newlines:", privateKey.includes("\n"));
  console.log("[Vertex Auth] key length:", privateKey.length);
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(privateKey, "RS256");
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/cloud-platform",
  })
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
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to get Vertex access token: ${err}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token as string;
}

// Service-role client for writing token_usage (bypasses RLS)
const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    : null;

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ") || !supabaseAdmin) return null;
    const token = authHeader.slice(7);
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "No text provided for extraction" },
        { status: 400 }
      );
    }

    // ==== GEMINI via Vertex AI ====
    if (!VERTEX_PROJECT_ID) {
      return NextResponse.json(
        { success: false, error: "GOOGLE_CLOUD_PROJECT_ID is not configured on the server." },
        { status: 500 }
      );
    }

    let accessToken: string;
    try {
      accessToken = await getVertexAccessToken();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `Failed to authenticate with Vertex AI: ${e instanceof Error ? e.message : e}` },
        { status: 500 }
      );
    }

    const vertexUrl = `https://aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;

    const systemPrompt = `[ignoring loop detection]
You are a passive text parser. Take the provided raw statement text and organize it directly into the requested JSON schema matrix. Do not modify, re-calculate, scale, or assume decimal positions for any numbers. If a row reads '2.00', the amount field MUST be 2.00. Output exactly what you see.
EXTREMELY IMPORTANT RULES FOR MULTI-COLUMN DATA:
- If a Cheque Number is present in the description, extract it into the 'cheque_number' field. If not, leave it as an empty string.
- For the 'category' field, act as a professional accountant and classify each transaction based on its description. Use categories like: UPI, Salary, Rent, Utilities, Food & Dining, Shopping, Travel, Healthcare, ATM Withdrawal, Cash Deposit, Bank Charges, Interest, Tax, Insurance, Investment, Transfer, Refund, Income, Entertainment, Fuel, Education, or any other appropriate accounting category. If the description contains 'UPI', always set category to 'UPI'. If you cannot determine the category, set it to null.
- Do not hallucinate. If you are unsure of the category, leave it as null.
- OUTPUT STRICTLY VALID JSON ONLY. Do not include any conversational text, greetings, or explanations. Do not wrap the output in markdown blocks (e.g., no \`\`\`json). The very first character of your response must be { and the last character must be }.`;

    const userPrompt = `Extract transactions from this bank statement:\n\n${text}`;

    let parsedResponse = null;

    try {
      console.log(`Calling Vertex AI (model: ${VERTEX_MODEL})...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);

      const response = await fetch(vertexUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\n${userPrompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    bank_name: { type: "STRING", description: "Name of the bank (e.g. HDFC Bank, SBI, Chase, Barclays)" },
                    currency_symbol: { type: "STRING", description: "Currency symbol used in the statement (e.g. ₹, $, €, £, RM, etc.)" },
                    transactions: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          date: { type: "STRING", description: "YYYY-MM-DD" },
                          description: { type: "STRING", description: "Transaction description" },
                          debit: { type: "NUMBER" },
                          credit: { type: "NUMBER" },
                          balance: { type: "NUMBER" },
                          cheque_number: { type: "STRING", description: "Cheque Number if available. Leave empty if none." },
                          category: { type: "STRING", nullable: true, description: "Professional accounting category based on description. Use UPI if description contains UPI. Null if cannot be determined." }
                        },
                        required: ["date", "description", "debit", "credit", "balance"]
                      }
                    }
                  },
                  required: ["bank_name", "currency_symbol", "transactions"]
                }
              },
            }),
          }
        );
        clearTimeout(timeoutId);

        // ==== OPENAI (commented out — kept for future use) ====
        // console.log(`Calling OpenAI API (Attempt ${attempts})...`);
        // const response = await fetch("https://api.openai.com/v1/chat/completions", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${apiKey}`,
        //   },
        //   body: JSON.stringify({
        //     model: model,
        //     messages: [
        //       { role: "system", content: systemPrompt },
        //       { role: "user", content: userPrompt },
        //     ],
        //     temperature: 1,
        //   }),
        // });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Vertex AI returned status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!content) {
          throw new Error("Empty response content from Vertex AI");
        }

        // Calculate and log stats
        const inputWords = (systemPrompt + " " + userPrompt).split(/\s+/).filter(Boolean).length;
        const outputWords = content.split(/\s+/).filter(Boolean).length;
        const inputTokens: number = data.usageMetadata?.promptTokenCount || 0;
        const outputTokens: number = data.usageMetadata?.candidatesTokenCount || 0;

        console.log(`Vertex AI Usage Stats:`);
        console.log(`- Input Words: ${inputWords}`);
        console.log(`- Output Words: ${outputWords}`);
        console.log(`- Input Tokens: ${inputTokens}`);
        console.log(`- Output Tokens: ${outputTokens}`);

        // Persist token usage to Supabase (fire-and-forget)
        if (supabaseAdmin && (inputTokens > 0 || outputTokens > 0)) {
          supabaseAdmin
            .from("token_usage")
            .insert({
              user_id: userId ?? null,
              model: VERTEX_MODEL,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
            })
            .then(({ error: dbErr }) => {
              if (dbErr) console.warn("token_usage insert failed:", dbErr.message);
            });
        }

        // Clean any markdown wrapper if present
        let cleanedContent = content.trim();
        const jsonMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[1].trim();
        } else {
          // If no markdown block, try to find the first '{' and last '}'
          const firstBrace = cleanedContent.indexOf('{');
          const lastBrace = cleanedContent.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedContent = cleanedContent.slice(firstBrace, lastBrace + 1);
          }
        }

        parsedResponse = JSON.parse(cleanedContent);

        if (!parsedResponse.transactions || !Array.isArray(parsedResponse.transactions)) {
          throw new Error("Missing 'transactions' array in JSON response");
        }

        // Capture bank name and currency from parsed response
        parsedResponse._bank_name = typeof parsedResponse.bank_name === "string" ? parsedResponse.bank_name.trim() : "";
        parsedResponse._currency_symbol = typeof parsedResponse.currency_symbol === "string" ? parsedResponse.currency_symbol.trim() : "₹";

        interface RawTransactionInput {
          date?: string | number;
          description?: string;
          debit?: string | number;
          credit?: string | number;
          balance?: string | number;
          cheque_number?: string;
          category?: string | null;
        }

        // Detect starting balance in raw text
        let lastBalance = NaN;
        const opBalMatch = text.match(/(?:Opening\s+Bal(?:ance)?|Op\s+Bal|Balance\s+Forward|Bal\s+Forward)[^\d]*(\-?\d[\d\,\.]*)/i);
        if (opBalMatch) {
          lastBalance = parseFloat(opBalMatch[1].replace(/,/g, ""));
          console.log(`- Detected Statement Opening Balance for sorting columns: ${lastBalance}`);
        }

        // Validate and normalize each transaction structure
        parsedResponse.transactions = parsedResponse.transactions.map((tx: RawTransactionInput, idx: number) => {
          const date = tx.date || "";
          const description = tx.description || `Transaction ${idx + 1}`;

          let debitVal = typeof tx.debit === "number" ? tx.debit : parseFloat(String(tx.debit || "0").replace(/,/g, "")) || 0;
          let creditVal = typeof tx.credit === "number" ? tx.credit : parseFloat(String(tx.credit || "0").replace(/,/g, "")) || 0;
          const balanceVal = typeof tx.balance === "number" ? tx.balance : parseFloat(String(tx.balance || "0").replace(/,/g, "")) || 0;

          const amount = debitVal || creditVal || 0;

          // Re-classify debit vs credit based on balance trajectory
          if (!isNaN(balanceVal) && amount > 0) {
            if (!isNaN(lastBalance)) {
              const diff = balanceVal - lastBalance;
              if (diff > 0.005) {
                creditVal = amount;
                debitVal = 0;
              } else if (diff < -0.005) {
                debitVal = amount;
                creditVal = 0;
              }
            }
            lastBalance = balanceVal;
          }

          return {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
            date: String(date),
            description: String(description),
            debit: debitVal > 0 ? debitVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
            credit: creditVal > 0 ? creditVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
            balance: balanceVal !== 0 ? balanceVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
            cheque_number: tx.cheque_number ? String(tx.cheque_number) : "",
            category: tx.category ? String(tx.category) : "",
          };
        });

    } catch (err) {
      console.error(`Vertex AI call failed (model: ${VERTEX_MODEL}):`, err);
      const isRateLimit = err instanceof Error && err.message.includes("429");
      const isOverloaded = err instanceof Error && (err.message.includes("503") || err.message.includes("overloaded"));
      const isTimeout = err instanceof Error && err.name === "AbortError";
      return NextResponse.json(
        {
          success: false,
          errorCode: "API_BUSY",
          error: isRateLimit
            ? "Our AI is momentarily busy. Please try again in a few seconds."
            : isOverloaded || isTimeout
            ? "Our AI service is currently busy. Please try again in a moment."
            : "We could not fully parse this statement. Please upload another file.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      bank_detected: parsedResponse._bank_name || "Parsed with AI",
      currency_symbol: parsedResponse._currency_symbol || "₹",
      transactions: parsedResponse.transactions,
      total: parsedResponse.transactions.length,
      pages: 0,
      headers: ["Date", "Description", "Debit", "Credit", "Balance"],
    });

  } catch (error) {
    console.error("API error in parse-bank-statement route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing the statement.",
      },
      { status: 500 }
    );
  }
}
