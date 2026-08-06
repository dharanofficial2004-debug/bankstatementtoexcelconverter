import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type PlanType = "lifetime" | "per_conversion";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export async function startPlanCheckout(
  plan: PlanType,
  handlers: {
    onProcessing: (processing: boolean) => void;
    onSuccess: () => void;
    onError: (message: string) => void;
  }
): Promise<{ needsAuth: boolean }> {
  const { onProcessing, onSuccess, onError } = handlers;

  if (!isSupabaseConfigured() || !supabase) {
    onError("Payments are not configured.");
    return { needsAuth: false };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { needsAuth: true };
  }

  onProcessing(true);

  try {
    const createOrderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ plan }),
    });

    const orderData = await createOrderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.error || "Failed to create payment order");
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "StatementToExcel",
      description: plan === "lifetime" ? "Lifetime Access (₹59)" : "Per Conversion Credit (₹19)",
      order_id: orderData.orderId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_record_id: orderData.paymentRecordId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess();
          } else {
            onError(verifyData.error || "Payment verification failed");
          }
        } catch (err) {
          onError(err instanceof Error ? err.message : "Payment verification failed");
        } finally {
          onProcessing(false);
        }
      },
      prefill: { email: session.user.email || "" },
      theme: { color: "#2563EB" },
      modal: {
        ondismiss: function () {
          onProcessing(false);
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new window.Razorpay(options);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rzp.on("payment.failed", function (response: any) {
      onError(response.error.description || "Payment failed");
      onProcessing(false);
    });
    rzp.open();

    return { needsAuth: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Payment initialization failed";
    onError(errorMsg);
    onProcessing(false);
    return { needsAuth: false };
  }
}
