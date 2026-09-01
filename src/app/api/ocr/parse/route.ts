import { NextRequest, NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

pdfjs.GlobalWorkerOptions.workerSrc = "";

async function pdfToImageBuffers(
  arrayBuffer: ArrayBuffer,
  scale = 2.0
): Promise<{ buffers: Buffer[]; pageCount: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pageCount: number = pdf.numPages;

  if (pageCount > 100) {
    throw new Error("File exceeds the 100-page limit. Please split the PDF and try again.");
  }

  const buffers: Buffer[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;
    buffers.push(canvas.toBuffer("image/png"));
  }

  return { buffers, pageCount };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const MAX_BYTES = 30 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "File exceeds the 30 MB limit." }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    let imageBuffers: Buffer[];
    let pageCount = 1;

    if (isPdf) {
      const result = await pdfToImageBuffers(arrayBuffer, 2.0);
      imageBuffers = result.buffers;
      pageCount = result.pageCount;
    } else {
      imageBuffers = [Buffer.from(arrayBuffer)];
    }

    console.log(`[Gemini Vision OCR] Processing ${pageCount} page(s) with Gemini Vision…`);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const fallbackModel = process.env.GEMINI_MODEL_FALLBACK || "gemini-3.1-flash-lite";

    const masterModelChain = Array.from(
      new Set([
        primaryModel,
        fallbackModel,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
      ].filter(Boolean))
    );

    const imageParts = imageBuffers.map((buf) => ({
      inlineData: {
        mimeType: "image/png",
        data: buf.toString("base64"),
      },
    }));

    const promptText = `You are an expert OCR engine for financial documents and bank statements.
Transcribe all text, transaction tables, dates, descriptions, debit amounts, credit amounts, and balance numbers from these bank statement page images.
CRITICAL RULES:
1. Preserve every number, currency symbol, and decimal point EXACTLY as shown in the image (e.g. 2.00, 15.50, 0.00). Do not drop zeros after decimals.
2. Maintain tabular line-by-line structure.
3. Transcribe all text completely without skipping any rows or columns.`;

    let extractedText = "";
    let attempts = 0;

    while (attempts < masterModelChain.length) {
      const currentModel = masterModelChain[attempts];
      attempts++;

      try {
        console.log(`[Gemini Vision OCR] Calling model ${currentModel} (Attempt ${attempts})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

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
                  parts: [{ text: promptText }, ...imageParts],
                },
              ],
              generationConfig: {
                temperature: 0.1,
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini Vision API returned status ${response.status}: ${errText}`);
        }

        const resData = await response.json();
        const candidates = resData.candidates || [];
        if (candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
          extractedText = candidates[0].content.parts.map((p: { text?: string }) => p.text || "").join("\n");
        }

        if (extractedText.trim()) {
          break; // Success!
        }
      } catch (err) {
        console.warn(`[Gemini Vision OCR] Model ${currentModel} failed:`, err);
        if (attempts >= masterModelChain.length) {
          throw err;
        }
      }
    }

    const trimmed = extractedText.trim();

    if (!trimmed) {
      return NextResponse.json(
        { success: false, error: "Gemini Vision could not extract text from this file. Please try uploading a clearer scan." },
        { status: 422 }
      );
    }

    console.log(`[Gemini Vision OCR] Completed. Total characters extracted: ${trimmed.length}`);

    return NextResponse.json({ success: true, text: trimmed, pages: pageCount });
  } catch (err) {
    console.error("[Gemini Vision OCR route] Error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred during OCR processing." },
      { status: 500 }
    );
  }
}
