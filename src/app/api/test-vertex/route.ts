import { NextResponse } from "next/server";
import { getVertexAccessToken, parseStatementChunk } from "@/lib/vertexGemini";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Testing Vertex AI authentication...");
    
    // Test 1: Check if we can get access token
    const token = await getVertexAccessToken();
    console.log("✓ Access token obtained successfully");
    
    // Test 2: Try a simple API call
    const testText = "Date: 2024-01-01, Description: Test transaction, Debit: 100.00, Credit: 0.00, Balance: 900.00";
    const result = await parseStatementChunk(testText);
    console.log("✓ Vertex AI API call successful");
    
    return NextResponse.json({
      ok: true,
      message: "Vertex AI is working correctly",
      tokenLength: token.length,
      resultLength: result.text.length,
      usage: result.usage
    });
    
  } catch (error) {
    console.error("❌ Vertex AI test failed:", error);
    
    const err = error as Error & { body?: string };
    return NextResponse.json({
      ok: false,
      error: err.message,
      errorBody: err.body,
      stack: err.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}


