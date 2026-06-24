import { NextRequest, NextResponse } from "next/server";
import { parseStatement } from "@/lib/parseStatement";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  console.log("\n--- UPLOAD API: Received POST request ---");
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("--- UPLOAD API WARNING: No file provided in form data ---");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`--- UPLOAD API: Processing file "${file.name}" (size: ${file.size} bytes, type: "${file.type}") ---`);

    if (file.type !== "application/pdf") {
      console.warn("--- UPLOAD API WARNING: Uploaded file is not a PDF ---");
      return NextResponse.json(
        { success: false, error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      console.warn("--- UPLOAD API WARNING: File size exceeds 10MB limit ---");
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Read file buffer
    console.log("--- UPLOAD API: Reading file into memory buffer... ---");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`--- UPLOAD API: Memory buffer successfully prepared (length: ${buffer.length} bytes) ---`);

    // Temporarily save the uploaded file for diagnostics
    try {
      fs.writeFileSync(path.join(process.cwd(), "uploaded_sample.pdf"), buffer);
      console.log("--- UPLOAD API DIAGNOSTICS: Successfully saved uploaded_sample.pdf ---");
    } catch (e) {
      console.error("--- UPLOAD API DIAGNOSTICS ERROR: Failed to save uploaded_sample.pdf:", e);
    }

    console.log("--- UPLOAD API: Invoking parseStatement... ---");
    const result = await parseStatement(buffer);

    if (!result.success) {
      console.warn("--- UPLOAD API: Parsing failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error || "Failed to parse PDF statement." },
        { status: 422 }
      );
    }

    console.log(`--- UPLOAD API SUCCESS: Successfully processed PDF. Returning ${result.transactions.length} transactions. ---`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("--- UPLOAD API ERROR: Unexpected server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing the PDF.",
      },
      { status: 500 }
    );
  }
}
