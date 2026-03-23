import axios from "axios";
import { readAdminSettings } from "./admin-settings";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

// Create PayMongo client with dynamic API key
export async function createPaymongoClient() {
  const settings = await readAdminSettings();
  const secretKey =
    settings.payment.paymongoSecretKey ||
    process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "PayMongo Secret Key not configured. Please configure it in admin settings or environment variables."
    );
  }

  const paymongoClient = axios.create({
    baseURL: PAYMONGO_API_BASE,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add Basic Auth middleware
  paymongoClient.interceptors.request.use((config) => {
    const encoded = Buffer.from(`${secretKey}:`).toString("base64");
    config.headers.Authorization = `Basic ${encoded}`;
    return config;
  });

  return paymongoClient;
}

export async function createPaymongoCustomer(
  email: string,
  name?: string | null
): Promise<string> {
  try {
    const paymongoClient = await createPaymongoClient();
    const response = await paymongoClient.post("/customers", {
      data: {
        email,
        first_name: name?.split(" ")[0] ?? email.split("@")[0],
        last_name: name?.split(" ").slice(1).join(" ") ?? "",
      },
    });
    return response.data.data.id;
  } catch (error) {
    console.error("[PAYMONGO] Error creating customer:", error);
    throw error;
  }
}

export async function createCheckoutSession({
  customerId,
  productId,
  amount, // amount in cents
  currency = "PHP",
  intervalCount = 1,
  interval = "month", // day, week, month, year
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string;
  productId: string;
  amount: number;
  currency?: string;
  intervalCount?: number;
  interval?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  try {
    const paymongoClient = await createPaymongoClient();
    // Create a billing subscription with PayMongo
    const response = await paymongoClient.post("/billing_subscriptions", {
      data: {
        customer_id: customerId,
        collection_method: "automatic",
        billing_cycle: {
          interval: interval as "day" | "week" | "month" | "year",
          interval_count: intervalCount,
        },
        line_items: [
          {
            amount: amount,
            currency: currency,
            description: metadata?.description ?? "Subscription",
            quantity: 1,
          },
        ],
        payment_method_allowed: ["card"],
        statement_descriptor: metadata?.description ?? "eDiscipleship",
        metadata: {
          userId: metadata?.userId ?? customerId,
          planId: metadata?.planId ?? productId,
          ...metadata,
        },
      },
    });

    const sessionId = response.data.data.id;
    const checkoutUrl = response.data.data.checkout_url || successUrl;

    return { checkoutUrl, sessionId };
  } catch (error) {
    console.error("[PAYMONGO] Error creating checkout session:", error);
    throw error;
  }
}

export async function createOneTimeCheckout({
  customerId,
  currency = "PHP",
  description = "Purchase",
  successUrl,
  cancelUrl,
  metadata,
  amount,
  lineItems,
}: {
  customerId: string;
  amount?: number;
  currency?: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  lineItems?: Array<{
    amount: number;
    currency?: string;
    name: string;
    quantity: number;
  }>;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  try {
    const paymongoClient = await createPaymongoClient();
    const resolvedLineItems = lineItems && lineItems.length > 0
      ? lineItems.map((item) => ({
          amount: item.amount,
          currency: item.currency ?? currency,
          name: item.name,
          quantity: item.quantity,
        }))
      : [
          {
            amount: amount ?? 0,
            currency,
            name: description,
            quantity: 1,
          },
        ];

    // Create one-time payment with PayMongo
    const response = await paymongoClient.post("/checkout_sessions", {
      data: {
        line_items: resolvedLineItems,
        payment_method_types: ["card"],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer: customerId ? { id: customerId } : undefined,
        metadata: {
          userId: metadata?.userId ?? customerId,
          courseId: metadata?.courseId,
          ...metadata,
        },
      },
    });

    const sessionId = response.data.data.id;
    const checkoutUrl = response.data.data.checkout_url;

    return { checkoutUrl, sessionId };
  } catch (error) {
    console.error("[PAYMONGO] Error creating one-time checkout:", error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    const paymongoClient = await createPaymongoClient();
    await paymongoClient.post(`/billing_subscriptions/${subscriptionId}/cancel`, {
      data: {},
    });
  } catch (error) {
    console.error("[PAYMONGO] Error canceling subscription:", error);
    throw error;
  }
}

export async function resumeSubscription(subscriptionId: string): Promise<void> {
  try {
    const paymongoClient = await createPaymongoClient();
    await paymongoClient.post(`/billing_subscriptions/${subscriptionId}/resume`, {
      data: {},
    });
  } catch (error) {
    console.error("[PAYMONGO] Error resuming subscription:", error);
    throw error;
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // PayMongo uses HMAC SHA256 for webhook verification
  const crypto = require("crypto");
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET!;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");

  return hash === signature;
}
