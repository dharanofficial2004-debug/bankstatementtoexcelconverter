import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_record_id,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_record_id) {
      return NextResponse.json(
        { success: false, error: "Missing required verification fields." },
        { status: 400 }
      );
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!razorpayKeySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured on the server." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured on the server." },
        { status: 500 }
      );
    }

    // Authenticate user
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch");

      // Update payment status to failed
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      await supabaseAdmin
        .from("payments")
        .update({ payment_status: "signature_failed" })
        .eq("id", payment_record_id)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Signature valid — update payment record
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
      })
      .eq("id", payment_record_id)
      .eq("user_id", user.id)
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError) {
      console.error("Failed to update payment record:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment record." },
        { status: 500 }
      );
    }

    // Create conversion record
    const { data: paymentData } = await supabaseAdmin
      .from("payments")
      .select("filename, pages")
      .eq("id", payment_record_id)
      .single();

    if (paymentData) {
      await supabaseAdmin.from("conversions").insert({
        payment_id: payment_record_id,
        user_id: user.id,
        filename: paymentData.filename,
        pages: paymentData.pages,
        status: "pending",
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
