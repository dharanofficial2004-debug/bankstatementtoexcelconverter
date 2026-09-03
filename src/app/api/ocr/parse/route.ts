import { NextRequest, NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";
import { SignJWT, importPKCS8 } from "jose";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

pdfjs.GlobalWorkerOptions.workerSrc = "";

const VERTEX_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
const VERTEX_MODEL = "gemini-2.5-flash-lite";
const VERTEX_LOCATION = "global";

async function getVertexAccessToken(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in environment.");
  }
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
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

    console.log(`[Gemini Vision OCR] Calling Vertex AI model ${VERTEX_MODEL}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
      throw new Error(`Vertex AI returned status ${response.status}: ${errText}`);
    }

    const resData = await response.json();
    const candidates = resData.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
      extractedText = candidates[0].content.parts.map((p: { text?: string }) => p.text || "").join("\n");
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
