// Stripe has been replaced by PayMongo - see lib/paymongo.ts
// This file is kept as a stub to prevent import errors

export const stripe = null;

export async function createOrRetrieveCustomer(userId: string, email: string, name?: string | null): Promise<string> {
  throw new Error("Stripe is disabled. Use PayMongo instead.");
}

export async function createCheckoutSession(params: any) {
  throw new Error("Stripe is disabled. Use PayMongo instead.");
}

export async function createOneTimeCheckout(params: any) {
  throw new Error("Stripe is disabled. Use PayMongo instead.");
}

export async function cancelSubscription(subscriptionId: string) {
  throw new Error("Stripe is disabled. Use PayMongo instead.");
}

export async function resumeSubscription(subscriptionId: string) {
  throw new Error("Stripe is disabled. Use PayMongo instead.");
}

export async function getSubscription(subscriptionId: string) {
  throw new Error("Stripe is disabled. Use PayMongo instead.");
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
