import { NextRequest, NextResponse } from "next/server";

// Stripe webhooks have been replaced by PayMongo - see app/api/webhooks/paymongo/route.ts
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Stripe webhooks are disabled. Use PayMongo webhook endpoint instead." },
    { status: 410 }
  );
}
