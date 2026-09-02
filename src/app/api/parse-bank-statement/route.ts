import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

    // ==== GEMINI (Multi-Model Dynamic Fallback Chain) ====
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModelPrimary = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const geminiModelFallback = process.env.GEMINI_MODEL_FALLBACK || "gemini-3.1-flash-lite";

    if (!geminiApiKey) {
      console.error("Gemini API Key is missing");
      return NextResponse.json(
        { success: false, error: "Gemini API Key is not configured on the server." },
        { status: 500 }
      );
    }

    const systemPrompt = `[ignoring loop detection]
You are a passive text parser. Take the provided raw statement text and organize it directly into the requested JSON schema matrix. Do not modify, re-calculate, scale, or assume decimal positions for any numbers. If a row reads '2.00', the amount field MUST be 2.00. Output exactly what you see.
EXTREMELY IMPORTANT RULES FOR MULTI-COLUMN DATA:
- If a Cheque Number is present in the description, extract it into the 'cheque_number' field. If not, leave it as an empty string.
- If a UPI Reference Number is present in the description, extract it into the 'upi_reference' field. If not, leave it as an empty string.
- Do not hallucinate. If you are unsure of the category or reference, leave the fields empty.
- OUTPUT STRICTLY VALID JSON ONLY. Do not include any conversational text, greetings, or explanations. Do not wrap the output in markdown blocks (e.g., no \`\`\`json). The very first character of your response must be { and the last character must be }.`;

    const userPrompt = `Extract transactions from this bank statement:\n\n${text}`;

    let parsedResponse = null;
    let attempts = 0;
    
    // Master fallback chain across all active Gemini Text-out models
    const masterModelChain = [
      geminiModelPrimary,
      geminiModelFallback,
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
    ];

    // Remove duplicates while preserving order
    const modelsToTry = Array.from(new Set(masterModelChain.filter(Boolean)));

    while (attempts < modelsToTry.length) {
      const currentModel = modelsToTry[attempts];
      attempts++;
      try {
        console.log(`Calling Gemini API (Attempt ${attempts}, model: ${currentModel})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s max per attempt

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": geminiApiKey,
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
                          upi_reference: { type: "STRING", description: "UPI Reference Number if available. Leave empty if none." }
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
          throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!content) {
          throw new Error("Empty response content from Gemini");
        }

        // Calculate and log stats
        const inputWords = (systemPrompt + " " + userPrompt).split(/\s+/).filter(Boolean).length;
        const outputWords = content.split(/\s+/).filter(Boolean).length;
        const inputTokens: number = data.usageMetadata?.promptTokenCount || 0;
        const outputTokens: number = data.usageMetadata?.candidatesTokenCount || 0;
        const model = currentModel;

        console.log(`Gemini API Usage Stats (Attempt ${attempts}):`);
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
              model,
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
          upi_reference?: string;
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
                // Balance increased -> Credit
                creditVal = amount;
                debitVal = 0;
              } else if (diff < -0.005) {
                // Balance decreased -> Debit
                debitVal = amount;
                creditVal = 0;
              }
            } else {
              // If no opening balance was matched, we use the first transaction's balance as starting point
              // for subsequent rows, but default to AI classification for the very first row.
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
            upi_reference: tx.upi_reference ? String(tx.upi_reference) : "",
          };
        });

        break; // Successfully parsed
      } catch (err) {
        console.warn(`Attempt ${attempts} failed (model: ${currentModel}):`, err);
        const isRateLimit = err instanceof Error && err.message.includes("429");
        const isOverloaded = err instanceof Error && (err.message.includes("503") || err.message.includes("overloaded"));
        const isTimeout = err instanceof Error && err.name === "AbortError";
        const isNotFound = err instanceof Error && (err.message.includes("404") || err.message.includes("not available"));
        const shouldRetry = isRateLimit || isOverloaded || isTimeout || isNotFound;

        if (attempts >= modelsToTry.length) {
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
        if (shouldRetry) {
          console.warn(`Model ${currentModel} failed (${isRateLimit ? "429 rate limit" : isNotFound ? "404 deprecated" : isTimeout ? "timeout" : "503 overloaded"}), switching to fallback model ${modelsToTry[attempts]}...`);
        }
      }
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
