import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type PlanType = "lifetime" | "monthly" | "per_conversion";

const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in a browser."));
  }

  if (typeof window.Razorpay === "function") {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SCRIPT;
      script.async = true;
      script.onload = () => {
        if (typeof window.Razorpay === "function") {
          resolve();
        } else {
          reject(new Error("Razorpay checkout loaded but could not be initialized."));
        }
      };
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay checkout. Check your connection and try again."));
      };
      document.body.appendChild(script);
    }).catch((error: unknown) => {
      razorpayScriptPromise = null;
      throw error;
    });
  }

  return razorpayScriptPromise;
}

export async function startPlanCheckout(
  plan: PlanType,
  handlers: {
    onProcessing: (processing: boolean) => void;
    onSubscriptionCreated?: () => void;
    onSuccess: (details?: { subscriptionActive?: boolean; subscriptionStatus?: string }) => void;
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
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      throw new Error("Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
    }

    await loadRazorpay();

    const isMonthly = plan === "monthly";
    const createOrderRes = await fetch(
      isMonthly ? "/api/payment/create-subscription" : "/api/payment/create-order",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(isMonthly ? {} : { plan }),
      }
    );

    const orderData = await createOrderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.error || "Failed to create payment order");
    }
    if (isMonthly && typeof orderData.subscriptionId !== "string") {
      throw new Error("Failed to create a monthly subscription.");
    }
    if (isMonthly) handlers.onSubscriptionCreated?.();

    const options: Record<string, unknown> = {
      key: razorpayKeyId,
      name: "StatementToExcel",
      description:
        plan === "lifetime"
          ? "Lifetime Access ($109)"
          : isMonthly
            ? "Monthly Unlimited ($59/month)"
            : "Per Conversion Credit ($2)",
      prefill: { email: session.user.email || "" },
      theme: { color: "#2563EB" },
      modal: {
        ondismiss: function () {
          onProcessing(false);
        },
      },
      handler: async function (response: {
        razorpay_order_id?: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) {
        try {
          const verifyRes = await fetch(
            isMonthly ? "/api/payment/verify-subscription" : "/api/payment/verify",
            {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(
              isMonthly
                ? {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }
                : {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    payment_record_id: orderData.paymentRecordId,
                  }
            ),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess({
              subscriptionActive: isMonthly && verifyData.active === true,
              subscriptionStatus:
                isMonthly && typeof verifyData.subscriptionStatus === "string"
                  ? verifyData.subscriptionStatus
                  : undefined,
            });
          } else {
            onError(verifyData.error || "Payment verification failed");
          }
        } catch (err) {
          onError(err instanceof Error ? err.message : "Payment verification failed");
        } finally {
          onProcessing(false);
        }
      },
    };
    if (isMonthly) {
      options.subscription_id = orderData.subscriptionId;
    } else {
      options.amount = orderData.amount;
      options.currency = orderData.currency;
      options.order_id = orderData.orderId;
    }

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
