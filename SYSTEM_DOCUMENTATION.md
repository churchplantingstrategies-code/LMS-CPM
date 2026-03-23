# eDiscipleship 1.0 — Full System Documentation

> **Project:** eDiscipleship LMS — Full-Stack Learning Management System with Marketing Funnels  
> **Version:** 1.0.0  
> **Framework:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Prisma)  
> **Payment Gateway:** PayMongo (PHP currency)  
> **Last Updated:** March 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Folder Structure](#3-architecture--folder-structure)
4. [User Roles](#4-user-roles)
5. [Landing Page / Marketing Site](#5-landing-page--marketing-site)
6. [Authentication System](#6-authentication-system)
7. [Student Portal](#7-student-portal)
8. [Admin Panel (ADMIN Role)](#8-admin-panel-admin-role)
9. [Super Admin — Page Builder (SUPER_ADMIN Role)](#9-super-admin--page-builder-super_admin-role)
10. [Books & Bookstore System](#10-books--bookstore-system)
11. [Payment & Billing System](#11-payment--billing-system)
12. [CRM, Funnels & Email Automation](#12-crm-funnels--email-automation)
13. [Database Schema (Prisma)](#13-database-schema-prisma)
14. [API Routes Reference](#14-api-routes-reference)
15. [File-Based Data Stores](#15-file-based-data-stores)
16. [Page Builder System — Full Feature Reference](#16-page-builder-system--full-feature-reference)
17. [Email & Notification System](#17-email--notification-system)
18. [Media & File Storage](#18-media--file-storage)
19. [Environment Variables](#19-environment-variables)
20. [Running the Project](#20-running-the-project)

---

## 1. System Overview

eDiscipleship is a full-stack Learning Management System (LMS) designed for ministry organizations, churches, and discipleship networks. It combines:

- A **public marketing site** with dynamic landing pages, pricing, blog, and book storefront
- A **student learning portal** for course access, progress tracking, certificates, and book orders
- An **admin backend** for course management, billing, analytics, CRM, and automation
- A **Super Admin Page Builder** for visually editing landing pages without touching code

### Core Capabilities

| Area | Capability |
|---|---|
| Courses | Full LMS with modules, lessons, video, quizzes, assignments, progress tracking |
| Books | Digital bookstore with cart, PayMongo checkout, PDF receipts, order management |
| Subscriptions | PayMongo recurring billing with plan management |
| Certificates | Auto-issued on course completion with PDF generation |
| Marketing | Dynamic landing pages, pricing tiers, blog, lead capture |
| CRM | Lead tracking, funnels, email campaigns, automation triggers |
| Page Builder | WYSIWYG visual editor for landing pages (Super Admin only) |

---

## 2. Technology Stack

### Core Framework
| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2.16 | Full-stack framework (App Router) |
| `react` | 18.3.1 | UI rendering |
| `typescript` | — | Type safety |
| `tailwindcss` | — | Utility-first styling |

### Database & Auth
| Package | Purpose |
|---|---|
| `@prisma/client` + `prisma` | ORM → PostgreSQL database |
| `next-auth` v5 beta | Session-based authentication |
| `@auth/prisma-adapter` | NextAuth Prisma DB adapter |
| `bcryptjs` | Password hashing |
| `jose` | JWT token utilities |

### Payment & Email
| Package | Purpose |
|---|---|
| `axios` | HTTP client for PayMongo API calls |
| `nodemailer` | SMTP email sending |
| `@sendgrid/mail` | SendGrid email provider |

### UI & Components
| Package | Purpose |
|---|---|
| Radix UI primitives | Accessible unstyled component base |
| `lucide-react` | Icon set |
| `framer-motion` | Animations |
| `recharts` | Analytics charts (Revenue, Enrollment) |
| `react-hook-form` + `zod` | Form validation |
| `class-variance-authority` | Variant-based component styling |

### Storage & Media
| Package | Purpose |
|---|---|
| `@aws-sdk/client-s3` | S3 / Cloudflare R2 image uploads |
| `pdf-lib` | PDF certificate & receipt generation |
| `uuid` | Unique ID generation |

---

## 3. Architecture & Folder Structure

```
app/
├── (marketing)/          → Public marketing site (Navbar + Footer layout)
│   ├── page.tsx          → Home page (static fallback + Page Builder override)
│   ├── pricing/          → Pricing plans page
│   ├── blog/             → Blog listing + individual posts
│   ├── checkout/         → Book checkout page (public cart)
│   └── [...slug]/        → Dynamic Page Builder pages
│
├── (auth)/               → Authentication pages (split-panel layout)
│   ├── login/            → Login with credentials + Google OAuth
│   └── register/         → Registration with plan selection
│
├── (student)/            → Student portal (sidebar layout, auth-gated)
│   ├── dashboard/        → Student dashboard + billing sub-route
│   ├── courses/          → Course catalog + course detail + lesson player
│   ├── certificates/     → Certificate viewer + download
│   ├── discussions/      → Community discussions (enrolled courses)
│   ├── billing/          → Billing redirect → /dashboard/billing
│   ├── cart/             → Book checkout cart
│   ├── orders/           → Book order history
│   └── settings/         → Account profile settings
│
├── (admin)/              → Admin backend (dark sidebar layout, ADMIN+ gated)
│   └── admin/
│       ├── page.tsx      → Admin dashboard (live stats)
│       ├── courses/      → Course CRUD + course creator form
│       ├── students/     → Student list + subscription status
│       ├── books/        → Books catalog manager + orders
│       ├── analytics/    → Revenue & enrollment analytics (30-day)
│       ├── billing/      → Payment gateway config + invoice records
│       ├── payments/     → All payment transaction log
│       ├── subscriptions/→ Active subscription management
│       ├── certificates/ → Certificates overview
│       ├── discussions/  → Discussion moderation
│       ├── email/        → Email campaigns dashboard
│       ├── leads/        → Lead capture log
│       ├── funnels/      → Marketing funnel builder
│       ├── crm/          → Unified CRM (leads + funnels + automation)
│       ├── automation/   → Automation rule management
│       └── settings/
│           ├── page.tsx              → Admin settings form
│           └── page-builder/         → Page Builder list (SUPER_ADMIN only)
│               └── [pageId]/         → Redirects to /builder/[pageId]
│
├── (builder)/            → Standalone Page Builder editor
│   └── builder/[pageId]/ → Full-screen canvas editor (SUPER_ADMIN only)
│
└── api/
    ├── auth/             → NextAuth handlers + /register endpoint
    ├── courses/          → Public/admin course CRUD
    ├── enroll/           → Free course enrollment
    ├── progress/         → Lesson progress tracking
    ├── checkout/         → PayMongo checkout session creation
    ├── billing/portal/   → PayMongo billing portal redirect
    ├── books/            → Public book catalog
    ├── book-orders/      → Book order management + PDF receipts
    ├── student/          → Student-specific APIs (certificates)
    ├── admin/            → Admin-only APIs (courses, books, settings, page-builder)
    ├── webhooks/
    │   ├── paymongo/     → PayMongo webhook handler
    │   └── stripe/       → Legacy Stripe webhook (deprecated)
    ├── page-builder/     → Public page-by-path lookup
    ├── course-art/       → Dynamically generated SVG course thumbnails
    └── book-covers/      → Dynamically generated SVG book covers

components/
├── layout/               → Navbar, Footer, Admin/Student sidebars, mobile navs
├── admin/                → Admin-specific components (course form, books manager, page builder editor)
├── page-builder/         → Page Builder renderer component
├── books/                → Book carousel, cover image, cart, checkout button
├── courses/              → Lesson quiz panel
├── billing/              → Billing portal button
├── dashboard/            → Revenue & enrollment chart components
├── providers/            → Session provider wrapper
└── ui/                   → shadcn/ui primitive components

lib/
├── auth.ts               → NextAuth configuration (Credentials + Google)
├── db.ts                 → Prisma client singleton
├── paymongo.ts           → PayMongo API client (subscriptions, one-time, webhooks)
├── stripe.ts             → Legacy Stripe client (kept for backwards compat)
├── email.ts              → Nodemailer transporter + email templates
├── admin-settings.ts     → Admin settings file store (data/admin-settings.json)
├── book-store.ts         → Books CRUD file store (data/books-store.json)
├── book-orders.ts        → Book orders file store (data/book-orders.json)
├── page-builder-store.ts → Page Builder CRUD store (data/page-builder-pages.json)
├── media-storage.ts      → S3 / R2 / local file upload handler
├── demo-course.ts        → Demo course seeder
├── sample-books.ts       → Default book catalog seeder
└── utils.ts              → Shared utilities (cn, formatCurrency, formatDate, etc.)

types/
├── next-auth.d.ts        → Extended NextAuth session types (id, role)
├── books.ts              → BookRecord, BookStoreData, BookStoreSettings types
├── book-orders.ts        → BookOrderRecord, BookOrderItem types
└── page-builder.ts       → All Page Builder data types

data/                     → JSON flat-file storage (no DB required for these)
├── admin-settings.json   → Platform configuration
├── books-store.json      → Books catalog + store settings
├── book-orders.json      → All book orders
└── page-builder-pages.json → All Page Builder page records

prisma/
└── schema.prisma         → PostgreSQL schema (Users, Courses, Modules, Lessons, etc.)
```

---

## 4. User Roles

The system has three roles stored in the `User.role` field:

| Role | Access |
|---|---|
| `STUDENT` (default) | Student portal: dashboard, courses, certificates, discussions, cart, orders, billing |
| `ADMIN` | Everything STUDENT has + full admin backend: courses, books, analytics, billing, CRM |
| `SUPER_ADMIN` | Everything ADMIN has + Page Builder (create/edit/publish landing pages) |

### Role Enforcement
- `(admin)/layout.tsx` — server-side checks `session.user.role` and redirects non-admin users to `/dashboard`
- `(student)/layout.tsx` — redirects unauthenticated users to `/login`
- `(builder)/builder/[pageId]/page.tsx` — checks for `SUPER_ADMIN` role specifically
- All admin API routes validate `ADMIN` or `SUPER_ADMIN` before processing
- Page Builder API routes (`/api/admin/page-builder/*`) require `SUPER_ADMIN`

---

## 5. Landing Page / Marketing Site

**Route group:** `app/(marketing)/`  
**Layout:** `Navbar` (sticky, responsive) + `Footer` (multi-column)

### Pages

#### Home Page (`/`)
The home page has a dual-render strategy:
1. **Page Builder override** — if a published Page Builder record exists for path `/`, it renders via `BuilderPageRenderer`
2. **Static fallback** — if no published record exists, renders the hardcoded Next.js page

**Static home page sections:**
- Hero with headline, subtitle, and two CTAs
- Stats bar (students, courses, satisfaction)
- Features grid (6 cards: Rich Content, Progress Tracking, Community, Automation, Checkout, Certificates)
- How It Works (3 steps)
- Book Carousel (animated auto-scroll of published books)
- Testimonials
- Pricing preview (links to `/pricing`)
- Final CTA

#### Pricing Page (`/pricing`)
Three subscription tiers:
- **Starter** — ₱9/mo (or ₱7/mo yearly) — 20+ courses, basic features
- **Growth** — ₱29/mo (or ₱23/mo yearly) — Unlimited access, priority support, analytics _(highlighted)_
- **Pro** — ₱79/mo (or ₱63/mo yearly) — Team management, custom branding, API access

Each plan card links to `/register?plan=<slug>` to pre-select plan at signup.

#### Blog (`/blog`)
- Blog listing with categories, read time, author
- Individual post at `/blog/[slug]`
- Static data in `app/(marketing)/blog/data.ts`

#### Book Checkout (`/checkout`)
- Public checkout page for book purchases (no login required to browse)
- Auto-adds book to cart if `?book=<bookId>` or `?bookId=<bookId>` is in URL
- Uses `useBookCart` (localStorage-based cart)
- Authenticated users can proceed to PayMongo checkout; unauthenticated are prompted to log in

#### Dynamic Pages (`/[...slug]`)
Any URL path that matches a published Page Builder record renders that custom page. Uses `getPublishedBuilderPageByPath()` to look up by path.

### Navigation
- **Navbar** (`components/layout/navbar.tsx`): sticky, mobile hamburger, user avatar dropdown when logged in, shows appropriate links based on session role
- **Footer** (`components/layout/footer.tsx`): 5-column grid — Brand, Platform, Company, Legal; social links

---

## 6. Authentication System

**Provider:** NextAuth v5 (beta) with PrismaAdapter  
**Config:** `lib/auth.ts`

### Supported Sign-In Methods

| Method | File | Details |
|---|---|---|
| Email + Password | `CredentialsProvider` in `lib/auth.ts` | bcrypt hash comparison, last login updated |
| Google OAuth | `GoogleProvider` in `lib/auth.ts` | Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |

### Registration
- Route: `POST /api/auth/register`
- Validates with Zod: `name` (2-100), `email`, `password` (8-100)
- Hashes password with bcrypt (12 rounds)
- Checks for duplicate email → 409 if exists
- Optional `plan` query param stored for post-signup redirect

### Session Configuration
- JWT strategy
- Session includes: `user.id`, `user.role`, `user.name`, `user.email`, `user.image`
- Extended types in `types/next-auth.d.ts`

### Auth Layout
- Two-column layout: left brand panel (dark gradient) with quote + stats, right login/register form
- Responsive: brand panel hidden on mobile

---

## 7. Student Portal

**Route group:** `app/(student)/`  
**Layout:** White sidebar + top search bar with notification bell and cart link

### Pages

#### Dashboard (`/dashboard`)
- Greeting with enrolled courses (up to 6, active only)
- Per-course progress bar (lessons completed / total lessons)
- Recent lesson completions
- Certificate count
- Book Store showcase (3 featured books from storefront)
- Book Checkout Cart panel (cart items with quick-add suggestions)

#### Dashboard Billing (`/dashboard/billing`)
- Current subscription plan name, price, interval, and status badge
- Renewal date
- "Manage Billing" button → triggers PayMongo customer portal redirect
- Payment history table (last 20 completed payments)
- Book Checkout Cart panel

#### My Courses (`/courses`)
- All published courses with enrollment status
- Progress bars for enrolled courses
- Category filter
- Search field
- Course cards with level badge, lesson count, duration, and enrollment count
- Unenrolled courses show "Enroll Free" or "Enroll" based on price

#### Course Detail (`/courses/[courseId]`)
- Course header: title, description, level, language, category
- Progress ring
- Module + lesson accordion (locked lessons if not enrolled)
- Enrollment action button
- Certificate download if completed

#### Lesson Player (`/courses/[courseId]/lessons/[lessonId]`)
- Lesson title, description, video (embed or upload)
- Previous / Next lesson navigation
- Progress bar for course completion
- Tabs: Overview, Discussion, Resources, Quiz
- `LessonQuizPanel` — interactive quiz with scoring; passes mark triggers lesson completion API call
- Assignment display

#### Certificates (`/certificates`)
- Lists all completed enrollment certificates
- Certificate ID, course name, issued date, completion percentage
- Download and Share buttons (PDF via `pdf-lib`)

#### Discussions (`/discussions`)
- Shows all discussion threads for enrolled courses
- Pinned threads, reply count, author, time
- New Discussion button

#### Checkout Cart (`/cart`)
- Book cart with quantity controls (+/-)
- Remove items
- Order subtotal
- PayMongo checkout button
- Cart persisted in `localStorage` via `useBookCart` hook
- On `?purchase=success` — clears cart and shows success toast

#### Order History (`/orders`)
- Summary cards: Completed Orders, Books Purchased, Total Spent
- Order cards with items, status badge, date, PDF receipt download

#### Settings (`/settings`)
- Profile display (name, email)
- Placeholder for future account preferences

### Student Header
- Search bar (courses, lessons)
- Cart link with live item count badge
- Notification bell with unread indicator
- User avatar with sign-out option

---

## 8. Admin Panel (ADMIN Role)

**Route group:** `app/(admin)/`  
**Layout:** Dark slate sidebar + admin header  
**Access:** Role must be `ADMIN` or `SUPER_ADMIN`

### Dashboard (`/admin`)
Live stats pulled directly from Prisma:
- Total Students, Total Courses, Completion Rate, Dropout Rate
- Monthly Recurring Revenue
- Lesson Completion Rate
- Returning Users Rate
- Recent Payments table (last 8 completed)

### Courses (`/admin/courses`)
- Full course list with enrollment + module counts
- Tabs: Course List, Course Creator, Video Settings
- **Course Creator Form** (`components/admin/course-create-form.tsx`):
  - Nested structure: Course → Modules → Lessons
  - Per-lesson: title, description, content, video provider (Upload/YouTube/Vimeo/Cloudflare Stream), video URL, duration, free/paid toggle
  - Add/remove/reorder modules and lessons
  - Publishes immediately or saves as draft
  - POST to `/api/admin/courses`
- Demo Course button → creates the full "Foundations of Everyday Discipleship" seed course

### Students (`/admin/students`)
- Table: avatar, name, email, enrollment count, active subscription plan, join date, status badge
- All students with `STUDENT` role

### Books (`/admin/books`)
- Full books catalog management via `BooksAdminManager` component
- Tabs: Catalog, Analytics, Settings
- **Catalog tab**: CRUD operations for each book — edit title, author, price, format, category, description, status (DRAFT/PUBLISHED), inventory, featured flag
- **Cover Image Upload**: upload to S3/R2 or use auto-generated SVG cover
- **Analytics tab**: Per-book sales metrics — monthly/yearly sales and revenue
- **Settings tab**: Storefront settings (store name, currency, headline, return policy, shipping message, etc.)
- Link to Book Orders page

### Book Orders (`/admin/books/orders`)
- Full order table with search, status filter, date range filters
- Preset ranges: Today, Last 7 Days, Last 30 Days, This Month
- Order details: customer name/email, items, subtotal, status, date
- PDF receipt download per order
- Status updates automatically via PayMongo webhook

### Analytics (`/admin/analytics`)
30-day window metrics:
- Total Users / New Users (30d)
- Published Courses
- Total Enrollments / New (30d)
- Total Revenue / Revenue (30d)
- Total Leads / New (30d)
- Certificates Issued
- Revenue Area Chart (monthly)
- Enrollment Bar Chart (monthly)

### Billing Setup (`/admin/billing`)
- Gateway Configuration display (PayMongo, PHP, transaction count, total revenue)
- Subscription plans table (name, price, interval, PayMongo product ID)
- Recent invoice records (last 20 completed payments)

### Payments (`/admin/payments`)
- All payment transactions (last 100)
- Columns: user, course, amount, currency, type, status badge, date
- Status variants: SUCCEEDED (green), FAILED (red), PENDING (outline), REFUNDED (amber)
- Total revenue summary

### Subscriptions (`/admin/subscriptions`)
- All subscription records
- Active count + MRR calculation
- Columns: user, plan name, price/interval, status badge, start date
- Status variants: ACTIVE (green), TRIALING, PAST_DUE (amber), CANCELED (red)

### Certificates (`/admin/certificates`)
- Total certificates issued count

### Discussions (`/admin/discussions`)
- Total discussion thread count
- Moderation interface placeholder

### Email Campaigns (`/admin/email`)
- Campaign list: name, status badge, send count, created date
- Total contacts (lead count)
- New Campaign button → `/admin/email/new`

### Leads (`/admin/leads`)
- All captured leads
- Columns: name, email, source funnel, tags, converted status, captured date

### Funnels (`/admin/funnels`)
- Marketing funnel list with step count and lead count
- New Funnel button → `/admin/funnels/new`

### CRM (`/admin/crm`)
Tabs combined view:
- **Leads & Conversion** — lead table
- **Click Funnel & Landing Setup** — funnel table
- **Automations & Newsletter** — automation rules + campaigns

### Automation (`/admin/automation`)
- Automation rule list with trigger type, action, enabled/disabled status
- Trigger types: USER_REGISTERED, COURSE_ENROLLED, LESSON_COMPLETED, COURSE_COMPLETED, SUBSCRIPTION_STARTED, SUBSCRIPTION_CANCELED, PAYMENT_FAILED, LEAD_CAPTURED
- New Rule button → `/admin/automation/new`

### Settings (`/admin/settings`)
**Admin Settings Form** (`components/admin/admin-settings-form.tsx`) with tabs:

| Tab | Fields |
|---|---|
| Payment | Provider (PayMongo/Manual), Currency, Trial Days, Tax %, Manual Enrollment |
| Video | Default Provider, Allow Downloads, Max Upload Size, Transcode on Upload |
| Platform | Support Email, Enable Certificates, Enable Discussions |
| Integrations | PayMongo Secret Key, PayMongo Public Key, SMS Provider/Key, Email Provider/Key |
| Branding | Theme Mode (dark/light), Primary Color, Logo URL |
| Pages | Home Lead Form, Maintenance Mode, Custom Footer Text |

Settings stored in `data/admin-settings.json` via `lib/admin-settings.ts`.

---

## 9. Super Admin — Page Builder (SUPER_ADMIN Role)

**Access:** `SUPER_ADMIN` role only  
**Routes:**
- `/admin/settings/page-builder` — page list and management
- `/builder/[pageId]` — standalone full-screen editor

### Page List (`/admin/settings/page-builder`)
- Lists all Page Builder pages (DRAFT and PUBLISHED)
- Create new page with custom name and URL path
- Edit button → opens editor in new tab at `/builder/[pageId]`
- Delete page
- View live page link for published pages

### Editor (`/builder/[pageId]`)

The Page Builder Editor (`components/admin/page-builder-editor.tsx`) is a full client-side WYSIWYG editor running in a standalone page outside the admin layout.

#### Editor Layout
- **Top Bar**: page name, status badges, Undo/Redo buttons (with history counter), device preview switcher, Save, Publish
- **Left Sidebar**: Tools panel + Inspector panel (context-sensitive)
- **Center Canvas**: Live preview of the page with interactive overlays
- **Right (none)**: inspector is in left sidebar

#### Device Preview
Three device modes with accurate layout switching:
| Mode | Canvas Width | Layout Behavior |
|---|---|---|
| Desktop | Full width | All responsive grid breakpoints active |
| Tablet | 768px preview box | 2-column where desktop is 2-column |
| Mobile | 375px preview box | Single-column stacked layout everywhere |

The `previewDevice` prop is passed to `BuilderPageRenderer`, which uses `isMobilePreview` and `isTabletPreview` flags to conditionally swap Tailwind className strings with explicit mobile-appropriate layouts.

#### Editable Sections / Blocks (Inspector Panels)

When clicking an element on canvas, the sidebar inspector shows the relevant fields:

| Block | Editable Fields |
|---|---|
| Hero | Title, Subtitle, Primary Button Text/URL, Secondary Button Text/URL, Image URL |
| Stats | Each stat's Value and Label (editable as tiles — reorder via drag) |
| Features | Each feature's Title, Description, Icon (6 icon options) |
| How-It-Works (Steps) | Each step's Title and Description |
| Testimonials | Each testimonial's Quote, Author, Title, Avatar URL |
| Plans | Each plan's Name, Description, Price, Interval, CTA Text, CTA URL, Feature list |
| Final CTA | Heading, Subtext, Primary/Secondary Button Text and URL |
| Custom Sections | Title, Content (rich text), Image URL, Button Text, Button URL |
| Page Settings | SEO Title, SEO Description, Page Name, Page Path, Typography (fonts), Colors |

#### Inline Canvas Editing

All text in the preview is directly editable inline without switching to the sidebar:
- Click any text → becomes `contentEditable`, changes commit on blur
- **Inline Button Editing**: button labels are editable inline; hover shows a URL overlay button that opens a prompt to change the link destination
- No page refresh needed — state updates instantly in React

#### Drag-to-Reorder

Sections and card items support drag-and-drop reordering:
- HTML5 drag API within `EditableNode` wrapper
- Drag a section → visual drop zone activates (blue ring + `Drop To Reorder` pill)
- Drop repositions the item in the data array
- Only items of the same kind can be swapped

#### Insert Section Between Blocks

Between every pair of top-level sections, a dashed `+` button appears on hover. Click to insert a new custom section at that position.

#### Undo / Redo History

- **Stack size:** 60 states maximum
- **Implementation:** `useRef`-based stacks (not React state — avoids triggering autosave on undo)
- **Keyboard shortcuts:**
  - `Ctrl+Z` — Undo
  - `Ctrl+Shift+Z` — Redo
  - `Ctrl+Y` — Redo (alternate)
- Toolbar Undo/Redo buttons with disabled state when stack is empty

#### Autosave

- Draft pages: auto-saved after 1500ms debounce following any change
- Published pages: only manual save (to prevent accidental live overwrites)
- Autosave status shows in top bar: "Saving…" → "Saved"

#### Typography Controls (Page Settings Inspector)

In the Page Settings inspector panel:
- **Body Font Family** — CSS `font-family` string for all body text
- **Heading Font Family** — CSS `font-family` string for all headings

Changes apply live to the preview via inline styles.

#### Color Theme Controls (Page Settings Inspector)

Six color pickers, each with a color swatch + hex text input:
| Field | Applies To |
|---|---|
| Page Background | Outer wrapper background |
| Section Background | Section containers |
| Card Background | Feature/testimonial/plan cards |
| Body Text | All non-heading text |
| Heading Text | All heading elements |
| Accent | Accent badge, CTA backgrounds |

#### Theme Architecture

```typescript
export type BuilderThemeBlock = {
  bodyFontFamily: string;      // CSS font-family string
  headingFontFamily: string;   // CSS font-family string
  pageBackgroundColor: string; // hex color
  sectionBackgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
};
```

Themes are stored per-page in `data/page-builder-pages.json`, normalized by `normalizeTheme()` in `lib/page-builder-store.ts` with safe defaults. Old pages without a theme object are automatically upgraded on next read.

#### SEO Settings

In Page Settings inspector:
- SEO Title (used as `<title>` on published page)
- SEO Description (used as `<meta name="description">`)
- Page Name (internal label)
- URL Path (the route this page renders at, e.g., `/about`)

#### Save vs Publish

| Action | Behavior |
|---|---|
| Save | Updates page as DRAFT — not visible to public |
| Publish | Sets status to PUBLISHED — renders at configured path for all visitors |

---

## 10. Books & Bookstore System

The bookstore is a JSON file-based system — no database tables required.

### Data Storage

| File | Purpose |
|---|---|
| `data/books-store.json` | All book records + store settings |
| `data/book-orders.json` | All book order records |

### Book Record Fields

```typescript
type BookRecord = {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImageUrl?: string;   // S3/R2 URL or empty → uses auto-generated SVG cover
  price: number;            // in PHP centavos? (no, raw PHP amount)
  pages: number;
  format: "EBOOK" | "PAPERBACK" | "HARDCOVER" | "AUDIOBOOK";
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  inventory: number;
  monthlySales / yearlySales / totalSales: number;
  monthlyRevenue / yearlyRevenue / totalRevenue: number;
  // ...SEO and metadata fields
};
```

### Book Cover Images

Two sources, resolved automatically by `BookCoverImage` component:
1. **Uploaded cover** — `coverImageUrl` set to S3/R2 URL
2. **Auto-generated SVG** — `GET /book-covers/[bookId]` generates a branded cover SVG dynamically based on book title, author, and a hash-derived color palette

### Book Carousel

On the home page, `BookCarousel` (`components/books/book-carousel.tsx`) shows two infinite auto-scrolling rows of published books — one forward, one reverse. Books link to `/checkout?book=<id>`.

### Book Cart

Client-side cart using `localStorage`:
- **Key:** `ediscipleship-book-cart`
- **Hook:** `useBookCart()` — reads/writes localStorage, syncs across tabs via custom events
- **Operations:** `addBookToCart()`, `removeBookFromCart()`, `setBookQuantity()`, `clearBookCart()`
- `usePublicBooks()` hook fetches published books from `/api/books` (no-store cache)

### Book Checkout Flow

1. Student visits `/checkout?book=<id>` or `/cart`
2. Adjusts cart quantities
3. Clicks "Checkout" → `POST /api/checkout` with `mode: "books"` and items array
4. Server creates PayMongo checkout session (`createOneTimeCheckout()`)
5. Student redirects to PayMongo hosted checkout
6. On payment success → PayMongo fires webhook → `/api/webhooks/paymongo` updates order status to COMPLETED
7. Student lands on `/cart?purchase=success` → cart auto-clears

### PDF Receipts

`GET /api/book-orders/[orderId]/receipt` — generates a PDF using `pdf-lib`:
- Branded header with logo mark
- Order details, items table, subtotal
- Returns as `application/pdf` download

---

## 11. Payment & Billing System

### Payment Gateway: PayMongo

All payment processing uses PayMongo (`lib/paymongo.ts`). Stripe code exists in `lib/stripe.ts` as a legacy reference but is not active.

### PayMongo Client Functions

| Function | Purpose |
|---|---|
| `createPaymongoCustomer(email, name)` | Creates a PayMongo customer, returns `customerId` |
| `createCheckoutSession(...)` | Creates a subscription checkout session |
| `createOneTimeCheckout(...)` | Creates a one-time payment checkout (for books) |
| `verifyWebhookSignature(payload, sig, secret)` | HMAC SHA256 base64 signature verification |

### Checkout Modes

`POST /api/checkout` accepts three modes:

| Mode | Purpose |
|---|---|
| `subscription` | Create recurring subscription checkout for a plan |
| `payment` | One-time course payment |
| `books` | One-time book order checkout |

### Webhook Handler

`POST /api/webhooks/paymongo` receives and processes PayMongo webhook events:

| Event | Action |
|---|---|
| `checkout_session.payment.paid` | Upserts completed payment; if metadata contains book order → marks order COMPLETED; if subscription → creates/updates Subscription record |
| `payment.paid` | Updates payment record |
| Subscription events | Creates/updates Subscription table record |

### Subscription Plans

Plans are stored in the `Plan` Prisma model and referenced from `Subscription`. Admin can view plans in Billing → Payment Setup tab.

### Billing Portal (Student)

`POST /api/billing/portal` — creates a PayMongo customer portal URL for the student to manage their subscription directly via PayMongo dashboard.

---

## 12. CRM, Funnels & Email Automation

### Leads

- Captured via funnel landing pages or manual admin entry
- Stored in `Lead` Prisma model
- Fields: name, email, source funnel, tags, converted flag
- Viewable in `/admin/leads` and CRM tab

### Funnels

- `Funnel` model with `FunnelStep` children
- Funnels link courses via `FunnelCourse` junction model
- Admin builds at `/admin/funnels`

### Email Campaigns

- `EmailCampaign` with status: DRAFT, SCHEDULED, SENDING, SENT
- Target contacts from lead list
- Track send counts via `EmailLog` records
- Manage at `/admin/email`

### Automation Rules

- `AutomationRule` model with trigger events and actions
- Trigger events:
  - `USER_REGISTERED`
  - `COURSE_ENROLLED`
  - `LESSON_COMPLETED`
  - `COURSE_COMPLETED`
  - `SUBSCRIPTION_STARTED`
  - `SUBSCRIPTION_CANCELED`
  - `PAYMENT_FAILED`
  - `LEAD_CAPTURED`
- Manage rules at `/admin/automation`

---

## 13. Database Schema (Prisma)

PostgreSQL database via Prisma ORM. Key models:

### Auth Models
- **`User`** — id, name, email, passwordHash, role (STUDENT/ADMIN/SUPER_ADMIN), bio, phone, timezone, isActive, lastLoginAt
- **`Account`** — OAuth provider accounts (Google, etc.)
- **`Session`** — NextAuth DB sessions
- **`VerificationToken`** — Email verification tokens

### Course Models
- **`Course`** — title, slug, description, price, isPublished, isFeatured, level, category, tags, duration
- **`Module`** — title, order, isPublished, belongs to Course
- **`Lesson`** — title, slug, content, videoUrl, videoProvider, duration, order, isFree, belongs to Module
- **`Enrollment`** — userId + courseId, status (ACTIVE/COMPLETED/SUSPENDED/EXPIRED), progress float, completedAt
- **`LessonProgress`** — userId + lessonId, completed bool, watchedSeconds, quizAnswers

### Assessment Models
- **`Assignment`** — title, description, belongs to Lesson
- **`Submission`** — content, grade, belongs to Assignment + User

### Community
- **`Discussion`** — title, content, isPinned, courseId, userId
- **`Reply`** — content, discussionId, userId

### Certificates
- **`Certificate`** — userId, courseId, issuedAt, certificateUrl

### Commerce Models
- **`Plan`** — name, price, interval, features, paymongoProductId
- **`Subscription`** — userId, planId, status, paymongoCustomerId, paymongoSubscriptionId, periodStart/End
- **`Payment`** — userId, amount, currency, status, type (ONE_TIME/SUBSCRIPTION), paymongoCheckoutSessionId

### CRM Models
- **`Lead`** — email, name, source, tags, isConverted, funnelId, userId
- **`Funnel`** — name, description + FunnelStep children + FunnelCourse junction
- **`EmailCampaign`** — subject, body, status + EmailLog children
- **`AutomationRule`** — trigger, action, isEnabled

### Analytics
- **`AnalyticsEvent`** — userId, type, metadata, createdAt

---

## 14. API Routes Reference

### Public Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/courses` | Published course list (paginated, search, category filter) |
| GET | `/api/courses/[courseId]` | Single course detail with modules and lessons |
| GET | `/api/books` | Published book catalog + store settings |
| GET | `/api/page-builder?path=<path>` | Get published Page Builder page by path |
| GET | `/api/course-art/[courseSlug]?scene=<scene>` | SVG course thumbnail generator |
| GET | `/api/book-covers/[bookId]` | SVG book cover generator |

### Auth Routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| POST | `/api/auth/register` | New user registration |

### Student Routes (authenticated)

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/enroll` | Check enrollment / enroll in free course |
| POST | `/api/progress` | Mark lesson complete / update watch time |
| GET | `/api/student/certificates` | Student's completed certificates |
| POST | `/api/checkout` | Create PayMongo checkout session |
| POST | `/api/billing/portal` | Get PayMongo billing portal URL |
| GET | `/api/book-orders/[orderId]/receipt` | Download PDF receipt |

### Admin Routes (ADMIN/SUPER_ADMIN)

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/admin/courses` | List all courses / create course |
| GET/PUT | `/api/admin/courses/[courseId]` | Course detail / update |
| GET | `/api/admin/courses/demo` | Seed demo course |
| GET/POST | `/api/admin/settings` | Admin settings read/write |
| GET/POST | `/api/admin/books` | Books catalog + metrics |
| PATCH/DELETE | `/api/admin/books/[bookId]` | Update/delete book |
| POST | `/api/admin/books/upload` | Upload book cover image |
| GET | `/api/admin/book-orders` | All book orders |
| PATCH | `/api/admin/book-orders/[orderId]` | Update order status |

### Super Admin Routes (SUPER_ADMIN only)

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/admin/page-builder` | List pages / create page |
| GET/PATCH/DELETE | `/api/admin/page-builder/[pageId]` | Page detail / update / delete |

### Webhook Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/webhooks/paymongo` | PayMongo event handling |
| POST | `/api/webhooks/stripe` | Legacy Stripe events (deprecated) |

---

## 15. File-Based Data Stores

Four JSON flat-file stores provide persistence without database dependencies:

### `data/admin-settings.json`
Platform configuration — payment gateway, video defaults, integrations, branding.  
Managed by `lib/admin-settings.ts` → `readAdminSettings()` / `writeAdminSettings()`.

### `data/books-store.json`
Complete book catalog + storefront settings.  
Managed by `lib/book-store.ts` → `readBookStore()` / `updateBook()` / `createBookDraft()` / `deleteBook()`.

### `data/book-orders.json`
All book purchase orders.  
Managed by `lib/book-orders.ts` → `createBookOrder()` / `updateBookOrderStatus()` / `listAllBookOrders()`.

### `data/page-builder-pages.json`
All Page Builder page records including all content blocks, sections, theme, and SEO data.  
Managed by `lib/page-builder-store.ts` → `listAllBuilderPages()` / `createBuilderPage()` / `updateBuilderPage()` / `deleteBuilderPage()` / `getPublishedBuilderPageByPath()`.

All file stores:
- Auto-create the `data/` directory if missing
- Apply `sanitize*()` / `normalize*()` functions on read to ensure type safety
- Return sensible defaults if the file does not exist yet

---

## 16. Page Builder System — Full Feature Reference

The Page Builder is the most complex subsystem in eDiscipleship. It is a WYSIWYG visual editor accessible only to Super Admins.

### Architecture

| Layer | File | Role |
|---|---|---|
| Types | `types/page-builder.ts` | All data interfaces |
| Store | `lib/page-builder-store.ts` | File-based CRUD + normalization |
| Renderer | `components/page-builder/builder-page-renderer.tsx` | Presentational + editable overlays |
| Editor | `components/admin/page-builder-editor.tsx` | State management + inspector sidebar |
| Pages List | `components/admin/page-builder-pages-list.tsx` | Admin UI for managing pages |

### Page Data Structure

```typescript
type BuilderPageRecord = {
  id: string;
  name: string;           // Internal label
  slug: string;           // URL-safe identifier
  path: string;           // Public URL path (e.g., "/about")
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
  hero: BuilderHeroBlock;
  stats: BuilderStatItem[];
  features: BuilderFeatureItem[];
  steps: BuilderStepItem[];
  testimonials: BuilderTestimonialItem[];
  plans: BuilderPlanItem[];
  finalCta: BuilderFinalCtaBlock;
  landingCopy: BuilderLandingCopyBlock;
  sections: BuilderPageSection[];   // Custom free-form sections
  theme: BuilderThemeBlock;         // Typography + colors
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
```

### All Features Added This Session

#### 1. Inline Button Editing

Before: buttons on canvas were static links.  
After: `InlineButtonLink` component wraps every button pair:
- Button label is a `contentEditable` span — click to edit text inline
- On hover, a "URL" overlay button appears — click to open `window.prompt` and change the link destination
- Wired for: Hero buttons, Books section buttons, Final CTA buttons, Plan CTA buttons, Custom section buttons

#### 2. Drag-Drop Visual Feedback

Enhanced `EditableNode` wrapper:
- During drag-over: `data-drop-active="true"` is set on the drop target
- CSS responds: blue ring highlight + light blue background tint
- A "Drop To Reorder" floating pill label appears inside the active drop zone
- On drag-end or drag-leave: visual state clears cleanly

#### 3. Undo / Redo History

- **Stack size:** 60 states max (older states discarded)
- **Storage:** `useRef` — never triggers re-renders, never triggers autosave
- **Keyboard shortcuts:** `Ctrl+Z` undo · `Ctrl+Shift+Z` redo · `Ctrl+Y` redo
- **Toolbar buttons:** Undo and Redo with disabled state when stack is empty
- **History counter:** shows current stack position

#### 4. Typography Font Controls

In Page Settings inspector:
- Body Font Family field (CSS string, e.g., `'DM Sans', sans-serif`)
- Heading Font Family field (CSS string, e.g., `'Space Grotesk', sans-serif`)
- Applied as `fontFamily` inline style to all text nodes in preview

#### 5. Color Theme Controls

Six `ColorField` components (color picker + hex input):
- Page Background Color
- Section Background Color
- Card Background Color
- Body Text Color
- Heading Text Color
- Accent Color

Applied via inline styles to all rendered surfaces in the preview.

#### 6. Device-Accurate Preview

Mobile and Tablet preview modes now accurately reflect how the page looks on real devices:
- `previewDevice` prop passed from editor to renderer
- `isMobilePreview` and `isTabletPreview` flags override Tailwind responsive classNames
- All grid/flex layouts switch to explicit single-column or two-column layouts
- Breakpoint list covered: hero grid, stats grid, features grid, steps grid, books heading/buttons, testimonials grid, plans grid, extra sections grid

### Default Page Content

New pages are seeded with a full default content set including:
- Hero with placeholder title, subtitle, and two buttons
- 4 default stats
- 6 default features (with icons)
- 3 How-It-Works steps
- 2 testimonials
- 3 pricing plans
- Final CTA block
- Default theme (dark background `#0b1220`, white sections, blue accent `#2563eb`, DM Sans + Space Grotesk fonts)

---

## 17. Email & Notification System

**Provider:** Nodemailer (SMTP) with SendGrid support  
**Config:** `lib/email.ts`

### Email Templates

| Template | Trigger |
|---|---|
| `welcomeEmailTemplate(name)` | User registration |
| `courseEnrollmentTemplate(name, courseTitle)` | New enrollment |
| `passwordResetTemplate(name, resetUrl)` | Password reset request |
| `certificateEmailTemplate(name, courseTitle, certUrl)` | Course completion |

### SendGrid Integration

Set `SENDGRID_API_KEY` in environment — Nodemailer will use the SendGrid SMTP bridge automatically.

### Custom SMTP

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` for any custom SMTP provider.

---

## 18. Media & File Storage

**Handler:** `lib/media-storage.ts`  
**Priority:** Cloudflare R2 → AWS S3 → Local filesystem fallback

### Storage Providers

| Provider | Env Vars Required |
|---|---|
| Cloudflare R2 | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL` |
| AWS S3 | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` |
| Local | `public/uploads/` directory (fallback, dev only) |

### Book Cover Upload

`POST /api/admin/books/upload` — accepts `multipart/form-data` with `file` field:
- Validates image MIME type
- Max size: 5MB
- Sanitizes file name (UUID suffix)
- Uploads to highest-priority available provider
- Returns `{ url, provider }`

---

## 19. Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ediscipleship"

# NextAuth
NEXTAUTH_SECRET="your-secret-32-chars+"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# PayMongo
PAYMONGO_SECRET_KEY="sk_test_..."
PAYMONGO_PUBLIC_KEY="pk_test_..."
PAYMONGO_WEBHOOK_SECRET="whsk_..."

# Email (SMTP or SendGrid)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="..."
SENDGRID_API_KEY="SG...."        # alternative to SMTP_PASS
EMAIL_FROM="noreply@ediscipleship.com"
EMAIL_FROM_NAME="eDiscipleship"

# Media Storage (optional — pick one)
R2_ENDPOINT="https://<account>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="ediscipleship-media"
R2_PUBLIC_URL="https://media.ediscipleship.com"

AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="ediscipleship-media"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 20. Running the Project

### Prerequisites

- Node.js 18+
- PostgreSQL database running
- `.env.local` file configured (see above)

### Commands

```bash
# Install dependencies
npm install

# Push Prisma schema to DB
npm run db:push

# Seed demo course (optional)
npx ts-node scripts/seed-demo-course.ts

# Create admin user (optional bootstrap script)
node scripts/bootstrap-admin.js

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (DB GUI)
npm run db:studio
```

### First-Time Setup Checklist

- [ ] Configure `.env.local` with `DATABASE_URL` and `NEXTAUTH_SECRET`
- [ ] Run `npm run db:push` to create all tables
- [ ] Run `node scripts/bootstrap-admin.js` to create the first SUPER_ADMIN account
- [ ] Log in at `/login` with the bootstrap credentials
- [ ] Visit `/admin/settings` to configure PayMongo keys and email provider
- [ ] Visit `/admin/courses` → "Create Demo Course" to seed sample content
- [ ] Visit `/admin/books` to verify the default book catalog is loaded
- [ ] Visit `/admin/settings/page-builder` (as SUPER_ADMIN) to manage landing pages
- [ ] Configure PayMongo webhook to point to `https://yourdomain.com/api/webhooks/paymongo`

### Docker

A `docker-compose.yml` is included for running the full stack with PostgreSQL:

```bash
docker-compose up -d
```

---

## Appendix: Key Design Decisions

| Decision | Reason |
|---|---|
| JSON flat files for books/orders/pages | No schema migrations needed for non-relational configs; easy to edit and back up |
| `useRef` for undo/redo stacks | Avoids triggering React re-renders and autosave effects on undo operations |
| `previewDevice` prop on renderer | Tailwind breakpoints are viewport-based, not container-based; needs explicit override |
| PayMongo over Stripe | Philippine peso (PHP) native support; local payment methods (GCash, Maya) |
| NextAuth v5 beta | Cleaner session API, better App Router compatibility |
| `contentEditable` for inline editing | Native browser editing; no external rich-text library dependency |
| Auto-generated SVG thumbnails | No CDN required for default state; book/course covers look good immediately |

---

*Documentation generated: March 2026 | eDiscipleship v1.0.0*
