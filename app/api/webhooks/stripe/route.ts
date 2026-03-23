import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }
      default:
        // Unhandled event type — log and ignore
        console.log(`[STRIPE_WEBHOOK] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error(`[STRIPE_WEBHOOK] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  const planId = session.metadata?.planId;

  if (!userId) return;

  // Update stripe customer id if not set
  if (session.customer) {
    await db.user.updateMany({
      where: { id: userId, stripeCustomerId: null },
      data: { stripeCustomerId: session.customer as string },
    });
  }

  // One-time course purchase
  if (courseId && session.mode === "payment") {
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

    await db.payment.create({
      data: {
        userId,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "usd",
        status: "COMPLETED",
        type: "ONE_TIME",
        stripePaymentIntentId: session.payment_intent as string,
        courseId,
      },
    });
  }

  // New subscription checkout
  if (planId && session.mode === "subscription" && session.subscription) {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    await upsertSubscription(userId, stripeSubscription, planId);
  }
}

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;
  if (!userId) return;

  await upsertSubscription(userId, subscription, planId);
}

async function upsertSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  planId?: string
) {
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;

  // Resolve plan from planId in metadata or by stripepriceId
  let resolvedPlanId = planId;
  if (!resolvedPlanId && priceId) {
    const plan = await db.plan.findFirst({ where: { stripePriceId: priceId } });
    resolvedPlanId = plan?.id;
  }

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    incomplete: "INCOMPLETE",
    trialing: "TRIALING",
    unpaid: "UNPAID",
    paused: "PAUSED",
  };

  const data = {
    userId,
    stripeSubscriptionId: subscription.id,
    status: statusMap[subscription.status] ?? "INCOMPLETE",
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    ...(resolvedPlanId ? { planId: resolvedPlanId } : {}),
  };

  await db.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: data,
    create: data,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "CANCELED", canceledAt: new Date() },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;

  const user = await db.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });
  if (!user) return;

  const subscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  await db.payment.create({
    data: {
      userId: user.id,
      amount: (invoice.amount_paid ?? 0) / 100,
      currency: invoice.currency ?? "usd",
      status: "COMPLETED",
      type: "SUBSCRIPTION",
      stripePaymentIntentId: invoice.payment_intent as string,
      subscriptionId: subscription?.id,
    },
  });
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: "PAST_DUE" },
  });
}
