import { NextRequest, NextResponse } from "next/server";
import { updateBookOrderStatus } from "@/lib/book-orders";
import { verifyWebhookSignature } from "@/lib/paymongo";
import { db } from "@/lib/db";

async function upsertCompletedPayment({
  checkoutSessionId,
  userId,
  amount,
  currency,
  description,
  metadata,
}: {
  checkoutSessionId: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  const existing = await db.payment.findUnique({ where: { paymongoCheckoutSessionId: checkoutSessionId } });

  if (existing) {
    return db.payment.update({
      where: { paymongoCheckoutSessionId: checkoutSessionId },
      data: {
        status: "COMPLETED",
        amount,
        currency,
        description,
        metadata,
      },
    });
  }

  return db.payment.create({
    data: {
      userId,
      amount,
      currency,
      status: "COMPLETED",
      type: "ONE_TIME",
      paymongoCheckoutSessionId: checkoutSessionId,
      description,
      metadata,
    },
  });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-paymongo-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  // Verify webhook signature
  try {
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (err) {
    console.error("[PAYMONGO_WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.type) {
      // Handle checkout session completion
      case "checkout_session.success":
        await handleCheckoutSuccess(event.data);
        break;

      // Handle subscription billing updates
      case "subscription.created":
      case "subscription.updated":
        await handleSubscriptionUpsert(event.data);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCanceled(event.data);
        break;

      // Handle payment/billing events
      case "charge.succeeded":
        await handleChargeSucceeded(event.data);
        break;

      case "charge.failed":
        await handleChargeFailed(event.data);
        break;

      default:
        console.log(`[PAYMONGO_WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[PAYMONGO_WEBHOOK] Error handling ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSuccess(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.userId;
  const courseId = metadata.courseId;
  const bookOrderId = metadata.bookOrderId;
  const checkoutSessionId = data.id;

  if (!userId) return;

  // Store customer ID if available
  if (data.customer_id) {
    await db.subscription.updateMany({
      where: { userId, paymongoCustomerId: null },
      data: { paymongoCustomerId: data.customer_id },
    });
  }

  // One-time course purchase
  if (courseId) {
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!existing) {
      await db.enrollment.create({
        data: {
          userId,
          courseId,
          status: "ACTIVE",
          enrolledAt: new Date(),
        },
      });
    }

    await upsertCompletedPayment({
      checkoutSessionId,
      userId,
      amount: (data.amount ?? 0) / 100,
      currency: data.currency ?? "PHP",
      description: `Course purchase: ${courseId}`,
      metadata: {
        courseId,
      },
    });

    console.log(`[PAYMONGO_WEBHOOK] Course enrollment completed for user ${userId}`);
  }

  if (bookOrderId) {
    const order = await updateBookOrderStatus({
      orderId: bookOrderId,
      checkoutSessionId,
      status: "COMPLETED",
    });

    await upsertCompletedPayment({
      checkoutSessionId,
      userId,
      amount: order?.subtotal ?? (data.amount ?? 0) / 100,
      currency: order?.currency ?? data.currency ?? "PHP",
      description: order ? `Book order ${order.orderNumber}` : "Book order",
      metadata: {
        bookOrderId,
        items: order?.items ?? [],
      },
    });

    console.log(`[PAYMONGO_WEBHOOK] Book order completed for user ${userId}`);
  }
}

async function handleSubscriptionUpsert(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.userId;
  const planId = metadata.planId;
  const subscriptionId = data.id;

  if (!userId) return;

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    inactive: "CANCELED",
    past_due: "PAST_DUE",
    pending: "INCOMPLETE",
  };

  const subscriptionStatus = statusMap[data.status] ?? data.status;

  // Store or update customer ID
  if (data.customer_id) {
    await db.user.updateMany({
      where: { id: userId },
      data: { stripeCustomerId: data.customer_id }, // We'll keep using this field for backward compatibility
    });
  }

  // Upsert subscription
  await db.subscription.upsert({
    where: { paymongoSubscriptionId: subscriptionId },
    update: {
      status: subscriptionStatus as any,
      currentPeriodStart: new Date(data.billing_cycle_anchor * 1000),
      currentPeriodEnd: new Date(data.scheduled_deactivation_date
        ? data.scheduled_deactivation_date * 1000
        : Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days if not set
      paymongoCustomerId: data.customer_id,
    },
    create: {
      userId,
      planId: planId || (await getDefaultPlanId()),
      status: subscriptionStatus as any,
      paymongoSubscriptionId: subscriptionId,
      paymongoCustomerId: data.customer_id,
      currentPeriodStart: new Date(data.billing_cycle_anchor * 1000),
      currentPeriodEnd: new Date(data.scheduled_deactivation_date
        ? data.scheduled_deactivation_date * 1000
        : Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`[PAYMONGO_WEBHOOK] Subscription ${subscriptionStatus} for user ${userId}`);
}

async function handleSubscriptionCanceled(data: any) {
  const subscriptionId = data.id;

  await db.subscription.updateMany({
    where: { paymongoSubscriptionId: subscriptionId },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });

  console.log(`[PAYMONGO_WEBHOOK] Subscription canceled: ${subscriptionId}`);
}

async function handleChargeSucceeded(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.userId;
  const description = data.description || "Payment";

  if (!userId) return;

  if (metadata.courseId || metadata.bookOrderId || metadata.checkoutType === "BOOKS") {
    return;
  }

  await db.payment.create({
    data: {
      userId,
      amount: (data.amount ?? 0) / 100, // Convert from cents
      currency: data.currency ?? "PHP",
      status: "COMPLETED",
      type: "SUBSCRIPTION",
      paymongoCheckoutSessionId: data.id,
      description,
    },
  });

  console.log(`[PAYMONGO_WEBHOOK] Payment succeeded for user ${userId}`);
}

async function handleChargeFailed(data: any) {
  const metadata = data.metadata || {};
  const userId = metadata.userId;

  if (!userId) return;

  if (metadata.bookOrderId) {
    await updateBookOrderStatus({
      orderId: metadata.bookOrderId,
      status: "FAILED",
    });

    await db.payment.updateMany({
      where: { metadata: { path: ["bookOrderId"], equals: metadata.bookOrderId } },
      data: { status: "FAILED" },
    });

    console.log(`[PAYMONGO_WEBHOOK] Book order failed for user ${userId}`);
    return;
  }

  // Mark any associated subscription as past due
  const subscription = await db.subscription.findFirst({
    where: { userId },
  });

  if (subscription) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: "PAST_DUE" },
    });
  }

  console.log(`[PAYMONGO_WEBHOOK] Payment failed for user ${userId}`);
}

// Helper to get default plan if not specified
async function getDefaultPlanId(): Promise<string> {
  const defaultPlan = await db.plan.findFirst({
    where: { isActive: true, isPopular: true },
  });
  return defaultPlan?.id || "";
}
