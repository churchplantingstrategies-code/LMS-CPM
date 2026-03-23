# Payment Configuration & Setup Guide

## Overview

All payments in eDiscipleship are configured through the **Admin Settings Panel** → **Payment Tab**. The PayMongo API keys entered here automatically flow through all payment operations across the platform.

## Payment Configuration Flow

```
Admin Settings (Payment Tab)
    ↓
PayMongo Public/Secret Keys configured
    ↓
readAdminSettings() reads config on demand
    ↓
createPaymongoClient() creates authenticated axios instance
    ↓
All payment operations use configured keys
    ├── Course Enrollments (/api/checkout?mode=payment)
    ├── Subscription Payments (/api/checkout?mode=subscription)
    ├── Book Purchases (/api/checkout?mode=books)
    └── Billing Portal (/api/billing/portal)
```

## How It Works

### 1. Admin Environment
Super Admin navigates to Admin Panel → Settings → **Payment Tab**
- Enters PayMongo Public Key (`pk_live_...`)
- Enters PayMongo Secret Key (`sk_live_...`)
- Saves settings (stored in `data/admin-settings.json`)

### 2. Runtime Configuration
When any payment operation is initiated:

```typescript
// 1. Payment endpoint called
POST /api/checkout { mode: "payment", courseId: "..." }

// 2. Endpoint requests admin settings
const settings = await readAdminSettings();

// 3. PayMongo client created with configured keys
const paymongoClient = await createPaymongoClient();
// Internally reads: settings.payment.paymongoSecretKey

// 4. All API calls use this client
await paymongoClient.post("/checkout_sessions", { ... })
```

### 3. All Payment Types Supported

| Payment Type | Endpoint | Flow |
|--------------|----------|------|
| **Course Purchase** | `/api/checkout` (mode=payment) | One-time checkout → Course enrollment |
| **Subscription** | `/api/checkout` (mode=subscription) | Recurring billing → Plan subscription |
| **Book Order** | `/api/checkout` (mode=books) | One-time checkout → Order creation |
| **Billing Portal** | `/api/billing/portal` | Customer management → PayMongo dashboard |

## Configuration Fallback Logic

The system uses a **fallback hierarchy**:

```typescript
// In lib/paymongo.ts
const secretKey = 
  settings.payment.paymongoSecretKey ||  // Priority 1: Admin Settings
  process.env.PAYMONGO_SECRET_KEY;       // Priority 2: Environment Variables
```

This means:
- ✅ **Admin Settings takes precedence** - Keys configured in the Payment tab are used first
- ✅ **Environment variables as fallback** - `.env.local` keys are used if admin settings are empty
- ✅ **Requires at least one source** - Error thrown if neither is configured

## API Keys Per Environment

### Development (.env.local)
```
PAYMONGO_SECRET_KEY=sk_test_xxxx
PAYMONGO_PUBLIC_KEY=pk_test_xxxx
```

### Production (Admin Settings)
After deployment:
1. Go to Admin Panel → Settings → Payment
2. Enter production API keys from PayMongo Dashboard
3. Click "Save Settings"
4. All payments immediately use production keys

**No** environment variable changes needed for production!

## Database & Data Flow

### Admin Settings Storage
- **Location**: `data/admin-settings.json`
- **Updated by**: Admin Panel Payment Setup form
- **Read by**: All payment endpoints before processing

### Payment Records
- **Location**: `prisma schema - Payment model`
- **Stores**: Payment transactions, status, session IDs
- **Used for**: Reconciliation, refunds, subscription management

## Testing the Configuration

### Test Scenario: Add PayMongo Keys

1. **Open Admin Settings**
   - Navigate to: Admin Panel → Settings
   - Click on: **Payment** tab

2. **Enter Test Keys** (from PayMongo Dashboard)
   ```
   Public Key: pk_live_test_key
   Secret Key: sk_live_test_key
   ```

3. **Save Settings**

4. **Test Payment Flow**
   - Go to: Student Dashboard → Courses
   - Enroll in course → "Buy Now"
   - Should redirect to PayMongo checkout
   - Uses **configured keys** from admin settings

### Test Scenario: Change Keys

1. **Update Keys in Admin Settings**
   - Change Public/Secret Keys
   - Click "Save Settings"

2. **Next payment immediately uses new keys**
   - No restart needed
   - No environment variable changes needed

## Webhook Configuration

PayMongo webhooks should be configured to POST to:

```
Production:  https://yourdomain.com/api/webhooks/paymongo
Development: Use ngrok or localtunnel for testing:
             https://your-ngrok-url.ngrok.io/api/webhooks/paymongo
```

**Webhook Endpoint**: `/api/webhooks/paymongo`
- Verifies PayMongo signature
- Processes checkout completion
- Creates enrollments/subscriptions
- Updates payment records

## Troubleshooting

### "PayMongo Secret Key not configured"
- ✅ Check Admin Panel → Payment tab
- ✅ Verify keys are saved
- ✅ Check `.env.local` as fallback

### Payments redirecting to wrong payment processor
- ✅ Verify Payment tab → Provider is set to "PayMongo"
- ✅ Check PayMongo keys are not empty
- ✅ Restart server if keys were just added
- ✅ Check browser console for API errors

### Webhook not processing
- ✅ Verify webhook URL in PayMongo Dashboard
- ✅ Ensure endpoint is publicly accessible
- ✅ Check webhook secret in environment variables
- ✅ View PayMongo Dashboard → Logs for rejection reason

## Security Considerations

⚠️ **Secret Keys**
- Never commit secret keys to git
- `.env.local` is gitignored and local-only
- Admin settings file is SUPER_ADMIN protected

🔒 **Access Control**
- Only ADMIN/SUPER_ADMIN can access payment settings
- Changes are logged in admin audit trail (for future implementation)
- Payment endpoint requires authenticated user

## Files Involved

| File | Purpose |
|------|---------|
| `lib/paymongo.ts` | PayMongo client factory + payment functions |
| `lib/admin-settings.ts` | Settings type definitions + read/write/sanitize |
| `components/admin/admin-settings-form.tsx` | Payment Setup UI form |
| `app/api/checkout/route.ts` | Checkout API (reads admin settings) |
| `app/api/billing/portal/route.ts` | Billing portal (reads admin settings) |
| `app/api/webhooks/paymongo/route.ts` | Webhook handler |
| `app/api/admin/settings/route.ts` | Admin settings API (GET/PUT) |
| `data/admin-settings.json` | Settings persistence |

## Summary

✅ All payments are **configured through Admin Settings**
✅ PayMongo keys automatically **flow to every payment operation**
✅ Changes are **immediate** - no restart needed
✅ Fallback to environment variables for development
✅ **Production-ready** - change keys anytime via admin panel
