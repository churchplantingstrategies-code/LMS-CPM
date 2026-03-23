# eDiscipleship Setup Guide

## Quick Start

### 1. **Configure Environment Variables**

Copy the example file and configure it:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and fill in:

**Required:**
- `DATABASE_URL` — PostgreSQL connection string or SQLite path
- `NEXTAUTH_URL` — Your app URL (http://localhost:3000 for local dev)
- `NEXTAUTH_SECRET` — Random secret key for sessions

**PayMongo Payments (Required for transactions):**
- `PAYMONGO_SECRET_KEY`
- `PAYMONGO_PUBLIC_KEY`
- `PAYMONGO_WEBHOOK_SECRET`
- `PAYMONGO_PRODUCT_*` — Product IDs from PayMongo Dashboard

**Optional but Recommended:**
- Google OAuth credentials (for social login)
- Email service (SendGrid or SMTP)
- AWS S3 credentials (for file uploads)

### 2. **Set Up Database**

#### With PostgreSQL (Recommended):
```bash
# Make sure PostgreSQL is running, then:
npx prisma db push
```

#### With SQLite (Quick testing):
Change DATABASE_URL in .env.local to:
```
DATABASE_URL="file:./prisma/dev.db"
```
Then run:
```bash
npx prisma db push
```

### 3. **Start Development Server**

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000)

## Testing Without External Services

You can test the app with minimal setup:

1. **Database only** — Use SQLite
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. **Skip Google OAuth** — Leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` empty
   - Email/password login will still work

3. **Skip PayMongo** — Fill in dummy values
   - You won't be able to take actual payments, but the app will still load

4. **Skip Email** — Leave email vars empty
   - Email features will gracefully skip

## Key Files After Setup

- `.env.local` — Your local environment variables (DO NOT commit)
- `prisma/schema.prisma` — Database structure
- `lib/auth.ts` — NextAuth configuration
- `lib/paymongo.ts` — PayMongo payment integration

## Troubleshooting

### **"Cannot read properties of undefined (reading 'image')" Error**
✅ **Fixed** — Update session checks to use `if (!session?.user)` instead of `if (!session)`

### **"ClientFetchError: There was a problem with the server configuration"**
- [ ] Check `.env.local` is created and has `NEXTAUTH_SECRET`
- [ ] Verify database connection: `npx prisma db push`
- [ ] Check that all required environment variables are set

### **Database Connection Refused**
- [ ] Make sure PostgreSQL/SQLite is accessible
- [ ] Test connection: `npx prisma studio`

### **Prisma Type Errors**
- [ ] Run: `npx prisma generate`
- [ ] Check `types/next-auth.d.ts` exists

## Production Checklist

Before deploying:

1. Update `NEXTAUTH_URL` to production domain
2. Generate strong `NEXTAUTH_SECRET`: `openssl rand -base64 32`
3. Set actual PayMongo credentials
4. Configure production database
5. Set up email service (SendGrid, etc.)
6. Enable HTTPS
7. Configure webhook endpoints in PayMongo Dashboard

## API Endpoints

After setup, these endpoints are available:

- `POST /api/auth/callback/credentials` — Email/password login
- `POST /api/auth/register` — User registration
- `GET /api/auth/session` — Get current session
- `POST /api/checkout` — Create payment checkout
- `POST /api/enroll` — Enroll in courses
- `POST /api/progress` — Track lesson progress

## Support

For issues:
1. Check the error message on `http://localhost:3000/api/auth/error`
2. Review `lib/auth.ts` configuration
3. Check browser console for client-side errors
4. Review server logs from `npm run dev`

---

**Next Steps:** Create a few test accounts and explore the student dashboard!
