import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getAffitorServer, validAffitorClickId } from "@/lib/affitor-server";

export const runtime = "nodejs";

// Razorpay retries non-2xx responses. Affitor deduplicates by payment ID.
export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_AFFITOR_WEBHOOK_SECRET;
  const affitor = getAffitorServer();
  if (!secret || !affitor) return NextResponse.json({ error: "Tracking is not configured" }, { status: 503 });
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  if (!/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(expected, Buffer.from(signature, "hex"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    if (!["payment.captured", "refund.processed", "payment.dispute.created"].includes(event.event)) {
      return NextResponse.json({ received: true });
    }
    const paymentId = event.event === "refund.processed"
      ? event.payload?.refund?.entity?.payment_id
      : event.event === "payment.dispute.created"
        ? event.payload?.dispute?.entity?.payment_id
        : event.payload?.payment?.entity?.id;
    if (typeof paymentId !== "string" || !/^pay_[a-zA-Z0-9]+$/.test(paymentId)) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    const headers = { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` };
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers, signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!paymentResponse.ok) throw new Error("Payment lookup failed");
    const payment = await paymentResponse.json();
    if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0 || typeof payment.currency !== "string") {
      throw new Error("Invalid payment amount");
    }
    if (typeof payment.order_id !== "string" || !/^order_[a-zA-Z0-9]+$/.test(payment.order_id)) {
      throw new Error("Invalid order");
    }
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${payment.order_id}`, {
      headers, signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!orderResponse.ok) throw new Error("Order lookup failed");
    const order = await orderResponse.json();
    const customerKey = order.notes?.user_id;
    if (typeof customerKey !== "string" || !customerKey) return NextResponse.json({ received: true });
    if (!["captured", "refunded"].includes(payment.status)) throw new Error("Payment not captured");

    // Ensure the original sale exists even if refund and capture deliveries arrive out of order.
    const sale = await affitor.trackSale({
      customerExternalId: customerKey,
      clickId: validAffitorClickId(order.notes?.affitor_click_id),
      amount: payment.amount,
      currency: payment.currency.toLowerCase(),
      invoiceId: paymentId,
    });
    if (!sale.ok) throw new Error("Sale tracking failed");
    const disputed = event.event === "payment.dispute.created";
    if (disputed || payment.amount_refunded > 0) {
      const refund = await affitor.trackRefund({
        invoiceId: paymentId,
        // Use the cumulative refunded amount so retries never double-count partial refunds.
        refundAmountCents: disputed ? undefined : payment.amount_refunded,
        refundReason: disputed ? "Payment disputed" : "Payment refunded",
      });
      if (!refund.ok) throw new Error("Refund tracking failed");
    }
    return NextResponse.json({ received: true });
  } catch {
    // Return a retryable failure without exposing provider responses or secrets.
    console.error("Affitor webhook processing failed");
    return NextResponse.json({ error: "Tracking temporarily unavailable" }, { status: 502 });
  }
}
