import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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

    // ==== GEMINI (current) ====
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModelPrimary = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const geminiModelFallback = process.env.GEMINI_MODEL_FALLBACK || "gemini-3.5-flash-lite";

    if (!geminiApiKey) {
      console.error("Gemini API Key is missing");
      return NextResponse.json(
        { success: false, error: "Gemini API Key is not configured on the server." },
        { status: 500 }
      );
    }

    // ==== OPENAI (commented out — kept for future use) ====
    // const apiKey = process.env.OPENAI_API_KEY;
    // const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
    // // "gpt-4.1-mini";
    //
    // if (!apiKey) {
    //   console.error("OpenAI API Key is missing");
    //   return NextResponse.json(
    //     { success: false, error: "OpenAI API Key is not configured on the server." },
    //     { status: 500 }
    //   );
    // }

    const systemPrompt = `You are a bank statement extraction engine.

Your job is to convert raw bank statement text into structured transaction data.

Rules:

Return ONLY valid JSON.
No markdown.
No explanations.
No comments.
No code blocks.

Extract every transaction.

Output format:

{
"transactions": [
{
"date": "YYYY-MM-DD",
"description": "Transaction description",
"debit": 0,
"credit": 0,
"balance": 0
}
]
}`;

    const userPrompt = `Extract transactions from this bank statement:\n\n${text}`;

    let parsedResponse = null;
    let attempts = 0;
    const modelsToTry = [geminiModelPrimary, geminiModelFallback];

    while (attempts < modelsToTry.length) {
      const currentModel = modelsToTry[attempts];
      attempts++;
      try {
        console.log(`Calling Gemini API (Attempt ${attempts}, model: ${currentModel})...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": geminiApiKey,
            },
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
              },
            }),
          }
        );

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
        let cleanedContent = content;
        if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent
            .replace(/^```(?:json)?\n?/, "")
            .replace(/\n?```$/, "")
            .trim();
        }

        parsedResponse = JSON.parse(cleanedContent);

        if (!parsedResponse.transactions || !Array.isArray(parsedResponse.transactions)) {
          throw new Error("Missing 'transactions' array in JSON response");
        }

        interface RawTransactionInput {
          date?: string | number;
          description?: string;
          debit?: string | number;
          credit?: string | number;
          balance?: string | number;
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
          };
        });

        break; // Successfully parsed
      } catch (err) {
        console.warn(`Attempt ${attempts} failed (model: ${currentModel}):`, err);
        const is503 = err instanceof Error && err.message.includes("503");
        if (attempts >= modelsToTry.length) {
          return NextResponse.json(
            {
              success: false,
              error: is503
                ? "Our AI service is currently busy. Please try again in a moment."
                : "We could not fully parse this statement. Please upload another file.",
            },
            { status: 422 }
          );
        }
        // If 503, log and try next model
        if (is503) {
          console.warn(`Model ${currentModel} returned 503, trying fallback model ${modelsToTry[attempts]}...`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      bank_detected: "Parsed with AI",
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
