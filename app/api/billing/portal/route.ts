import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For PayMongo, we'll redirect to the PayMongo customer portal
    // You need to set up a customer portal URL in PayMongo settings
    const subscription = await db.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    if (!subscription?.paymongoCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // PayMongo customer portal URL (configure in your PayMongo dashboard settings)
    const portalUrl = new URL("https://dashboard.paymongo.com");
    portalUrl.searchParams.append("customer_id", subscription.paymongoCustomerId);

    return NextResponse.json({ url: portalUrl.toString() });
  } catch (error) {
    console.error("[BILLING_PORTAL_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
