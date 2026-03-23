# PayMongo Migration Guide

## Changes Made

### 1. Environment Variables (`.env.example`)
- ❌ Removed: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`
- ✅ Added: `PAYMONGO_SECRET_KEY`, `PAYMONGO_PUBLIC_KEY`, `PAYMONGO_WEBHOOK_SECRET`, `PAYMONGO_PRODUCT_*`

### 2. Payment Library (`lib/paymongo.ts`)
- Created new PayMongo client library
- Functions:
  - `createPaymongoCustomer()` - Create customer in PayMongo
  - `createCheckoutSession()` - Create subscription checkout
  - `createOneTimeCheckout()` - Create one-time payment checkout
  - `cancelSubscription()` - Cancel active subscription
  - `resumeSubscription()` - Resume canceled subscription
  - `verifyWebhookSignature()` - Verify PayMongo webhook signature

### 3. Database Schema (`prisma/schema.prisma`)
- Renamed fields for consistency:
  - `stripePriceId` → `paymongoProductId`
  - `stripeSubscriptionId` → `paymongoSubscriptionId`
  - `stripeCustomerId` → `paymongoCustomerId`
  - `stripePaymentIntentId` → `paymongoCheckoutSessionId`
  - `stripeInvoiceId` → `paymongoInvoiceId`
- Updated default currency to "PHP" (PayMongo's primary currency)

**Run migration:**
```bash
npx prisma migrate dev --name paymongo_migration
```

### 4. API Routes Updated

#### `/api/checkout` - Create Checkout Sessions
- Updated to use `createPaymongoCustomer()` and `createCheckoutSession()`/`createOneTimeCheckout()`
- Supports both subscription and one-time course purchases
- Returns checkout URL from PayMongo

#### `/api/billing/portal` - Customer Portal
- Simplified to redirect to PayMongo customer portal
- **Note:** PayMongo doesn't have a native self-service portal yet, so this redirects to the dashboard

#### `/api/webhooks/paymongo` - ✨ NEW
- Handles PayMongo webhook events:
  - `checkout_session.success` - Process successful checkouts
  - `subscription.created|updated` - Create/update subscriptions
  - `subscription.cancelled` - Handle cancellations
  - `charge.succeeded|failed` - Process charges

**Configure webhook:**
1. Go to [PayMongo Dashboard](https://dashboard.paymongo.com/developers/webhooks)
2. Create new webhook pointing to: `https://yourdomain.com/api/webhooks/paymongo`
3. Subscribe to events: `checkout_session.success`, `subscription.*`, `charge.*`
4. Copy webhook signing secret to `PAYMONGO_WEBHOOK_SECRET`

### 5. Dependencies (`package.json`)
- ❌ Removed: `stripe`, `@stripe/stripe-js`
- ✅ Added: `axios`

```bash
npm install
```

## Setup Instructions

### 1. Get PayMongo Credentials
1. Create account at [paymongo.com](https://paymongo.com)
2. Go to [Developer Settings](https://dashboard.paymongo.com/developers/api_keys)
3. Copy Secret Key and Public Key
4. Add to `.env.local`:
   ```
   PAYMONGO_SECRET_KEY=sk_live_...
   PAYMONGO_PUBLIC_KEY=pk_live_...
   ```

### 2. Create Products
1. In PayMongo Dashboard, create products for each plan:
   - Starter Plan
   - Growth Plan
   - Pro Plan
2. Copy product IDs to `.env.local`:
   ```
   PAYMONGO_PRODUCT_STARTER=...
   PAYMONGO_PRODUCT_GROWTH=...
   PAYMONGO_PRODUCT_PRO=...
   ```

### 3. Configure Webhook
1. In PayMongo Dashboard → Webhooks → Add Webhook
2. Set URL: `https://yourdomain.com/api/webhooks/paymongo`
3. Subscribe to:
   - `checkout_session.success`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `charge.succeeded`
   - `charge.failed`
4. Copy webhook signing secret to `PAYMONGO_WEBHOOK_SECRET`

### 4. Update Database
```bash
npx prisma db push
```

### 5. Run Application
```bash
npm install
npm run dev
```

## Migration from Stripe to PayMongo

### Key Differences:

| Feature | Stripe | PayMongo |
|---------|--------|----------|
| **Regions** | Global | Philippines-focused |
| **Payment Methods** | Card, Apple Pay, Google Pay, etc. | Card (GCash, etc. via additional setup) |
| **Subscriptions** | Native billing | Billing subscriptions with custom logic |
| **Recurring Billing** | Automatic invoicing | Manual or webhook-based |
| **Currency** | Multiple | PHP primary |
| **Customer Portal** | Built-in self-service portal | Dashboard only |
| **Testing** | Test mode | Live mode (testing with test cards) |

### Testing Payment Flow:

In PayMongo, use test card details:
- **Card Number:** 4100 0000 0000 0001
- **Expiry:** 12/25
- **CVC:** 123

## Files to Clean Up

Delete old Stripe webhook handler (no longer used):
```bash
rm app/api/webhooks/stripe/route.ts
```

You can keep `lib/stripe.ts` as a reference, or delete it:
```bash
rm lib/stripe.ts
```

## Troubleshooting

### Webhook Signature Verification Fails
- Ensure `PAYMONGO_WEBHOOK_SECRET` is correctly set from PayMongo Dashboard
- Check payload is being sent as raw text, not JSON-decoded

### Checkout Returns 404
- Verify `PAYMONGO_PRODUCT_*` IDs are set in `.env.local`
- Check PayMongo Dashboard to confirm products are created and active

### Subscription Not Activating After Payment
- Ensure webhook is properly configured in PayMongo Dashboard
- Check webhook logs in PayMongo Dashboard for delivery status
- Verify `PAYMONGO_WEBHOOK_SECRET` matches in your code

## Additional Resources

- [PayMongo API Documentation](https://developers.paymongo.com)
- [PayMongo Webhooks Guide](https://developers.paymongo.com/reference#webhooks)
- [PayMongo Billing Documentation](https://developers.paymongo.com/reference#billing-subscriptions)
