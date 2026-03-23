# eDiscipleship1.0 - Quick Start Guide

Your project is fully scaffolded and ready to run locally! Follow these steps:

## ✅ What's Already Done

- ✅ All dependencies installed (584 packages)
- ✅ Environment file created (`.env.local`)
- ✅ NextAuth configuration with optional Google OAuth
- ✅ PayMongo payment system fully integrated
- ✅ Prisma schema with complete database models (20+ tables)
- ✅ All API routes and endpoints created
- ✅ Admin dashboard with 9+ management pages
- ✅ Student dashboard with course catalog and billing

## 🚀 Next Steps (3 min setup)

### Step 1: Start PostgreSQL Database

**Option A: Using Docker (Easiest)**
```bash
# Make sure Docker Desktop is running first
docker-compose up -d

# Verify PostgreSQL is running
docker ps
```

**Option B: Manual PostgreSQL Installation**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings (user: `postgres`, password: `postgres`)
3. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE ediscipleship;"
   ```

### Step 2: Initialize Database Schema

```bash
npx prisma db push
```

This will:
- Connect to your PostgreSQL database
- Create all 20+ tables from the schema
- Generate Prisma Client

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 🧪 Testing the App

### Create Your First Account
1. Go to http://localhost:3000
2. Click "Sign Up" or "Login"
3. Use email/password (Google OAuth is optional)
4. Default credentials for testing:
   - Email: `admin@example.com`
   - Password: `password123` (create your own account)

### Test Admin Panel
- After login, visit: http://localhost:3000/admin
- View dashboard with mock data
- Explore: Courses, Students, Subscriptions, Payments, Analytics

### Test Student Dashboard
- After login, visit: http://localhost:3000/student/dashboard
- Browse available courses
- Check billing and subscription info

## 📋 Environment Configuration

Your `.env.local` already has:
- ✅ Database: PostgreSQL connection string
- ✅ NextAuth: Secret key configured
- ✅ PayMongo: Test credentials (for checkout testing)
- ❌ Google OAuth: Optional (leave empty to skip)
- ❌ Email service: Optional (for sending notifications)

To enable optional features, update `.env.local`:

### Google OAuth (Optional)
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
[Get credentials from Google Cloud Console](https://console.cloud.google.com)

### Email Notifications (Optional)
```bash
SENDGRID_API_KEY="your-sendgrid-key"
# OR configure SMTP:
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
```

## 🐛 Troubleshooting

### "Cannot connect to PostgreSQL"
- **Docker**: Run `docker-compose up -d` and wait 10 seconds
- **Manual**: Make sure PostgreSQL service is running
- **Connection string**: Verify `DATABASE_URL` in `.env.local`

### "Prisma error: P3008"
```bash
# Reset database (clears all data):
npx prisma migrate reset
npx prisma db push
```

### "NextAuth secret not set"
- ✅ Already configured in `.env.local`
- If you see warnings, the app still works

### Port 3000 already in use
```bash
# Run on different port:
npm run dev -- -p 3001
```

### npm install issues
```bash
# Clear cache and reinstall:
npm cache clean --force
npm install
```

## 📦 What's Included

### Features:
- **Authentication**: Email/password + optional Google OAuth
- **Student Dashboard**: Course catalog, lesson player, progress tracking
- **Admin Panel**: Course management, student tracking, analytics, email campaigns
- **Payment**: PayMongo integration with subscriptions and one-time purchases
- **Marketing**: Landing page with pricing, lead capture funnels
- **Email**: Nodemailer configured for sending notifications
- **Analytics**: Charts and metrics on revenue, enrollments, course progress

### Database Models:
- User, Account, Session, VerificationToken (NextAuth)
- Plan, Subscription, Payment (Billing)
- Course, Module, Lesson, Quiz, Submission (Learning)
- Enrollment, StudentProgress, StudentAnswer (Student data)
- Funnel, Lead, EmailCampaign, AutomationRule (Marketing)
- FileAsset (Media management)

### Tech Stack:
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js v5 beta
- **UI**: Radix UI, shadcn/ui components, Recharts
- **Email**: Nodemailer
- **Payment**: PayMongo

## 🎯 Next Features to Implement

After getting the app running, you can:

1. **Seed Sample Data**: Add sample courses, instructors, and students
   ```bash
   npx prisma db seed
   ```
   (Create `prisma/seed.ts` with sample data)

2. **Connect PayMongo**: Get real API keys from [PayMongo Dashboard](https://dashboard.paymongo.com)

3. **Set up webhooks**: Configure PayMongo webhook to your production URL

4. **Add more courses**: Use admin panel to create courses with lessons

5. **Customize branding**: Update logo, colors, and brand name in components

## 📞 Need Help?

Check these files for more details:
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [PAYMONGO_MIGRATION.md](./PAYMONGO_MIGRATION.md) - Payment system documentation
- [.env.local.example](./.env.local.example) - All configuration options

---

**You're all set! Run `npm run dev` to start building.** 🚀
