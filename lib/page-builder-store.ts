import { promises as fs } from "fs";
import path from "path";
import {
  BuilderFeatureIcon,
  BuilderPageRecord,
  BuilderPageSection,
  BuilderPageStatus,
  BuilderSectionType,
  BuilderStoreData,
} from "@/types/page-builder";

const DATA_PATH = path.join(process.cwd(), "data", "page-builder-pages.json");

function nowIso() {
  return new Date().toISOString();
}

async function ensureDirExists(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePath(value: string) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const compacted = withSlash.replace(/\/+/g, "/");
  return compacted.endsWith("/") ? compacted.slice(0, -1) : compacted;
}

function normalizeStatus(value: unknown): BuilderPageStatus {
  return value === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
}

function normalizeSectionType(value: unknown): BuilderSectionType {
  return value === "IMAGE" || value === "CTA" ? value : "TEXT";
}

function emptySection(section?: Partial<BuilderPageSection>): BuilderPageSection {
  return {
    id: section?.id || `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: normalizeSectionType(section?.type),
    title: String(section?.title ?? "Section Title").trim(),
    content: String(section?.content ?? "").trim(),
    imageUrl: String(section?.imageUrl ?? "").trim(),
    buttonText: String(section?.buttonText ?? "").trim(),
    buttonUrl: String(section?.buttonUrl ?? "").trim(),
  };
}

function normalizeFeatureIcon(value: unknown): BuilderFeatureIcon {
  const icon = String(value ?? "");
  if (icon === "TrendingUp" || icon === "Users" || icon === "Zap" || icon === "Shield" || icon === "Award") {
    return icon;
  }
  return "BookOpen";
}

function normalizeStats(input?: BuilderPageRecord["stats"]): BuilderPageRecord["stats"] {
  if (!input || input.length === 0) {
    return [
      { id: "stat-1", value: "10,000+", label: "Active Learners" },
      { id: "stat-2", value: "150+", label: "Courses Available" },
      { id: "stat-3", value: "98%", label: "Student Satisfaction" },
      { id: "stat-4", value: "500+", label: "Lessons Completed Daily" },
    ];
  }

  return input.map((item, index) => ({
    id: item.id || `stat-${index + 1}`,
    value: String(item.value ?? "").trim(),
    label: String(item.label ?? "").trim(),
  }));
}

function normalizeFeatures(input?: BuilderPageRecord["features"]): BuilderPageRecord["features"] {
  if (!input || input.length === 0) {
    return [
      {
        id: "feature-1",
        icon: "BookOpen",
        title: "Rich Course Content",
        description: "Video lessons, PDFs, assignments, and quizzes — all in one platform.",
      },
      {
        id: "feature-2",
        icon: "TrendingUp",
        title: "Progress Tracking",
        description: "Track your learning journey with detailed analytics and completion certificates.",
      },
      {
        id: "feature-3",
        icon: "Users",
        title: "Community Discussions",
        description: "Engage with instructors and fellow learners through threaded discussions.",
      },
      {
        id: "feature-4",
        icon: "Zap",
        title: "Smart Automation",
        description: "Automated email sequences, drip campaigns, and marketing funnels.",
      },
      {
        id: "feature-5",
        icon: "Shield",
        title: "Flexible Checkout",
        description: "Recurring subscriptions plus one-time checkout carts for books, resources, and special offers.",
      },
      {
        id: "feature-6",
        icon: "Award",
        title: "Certificates",
        description: "Issue branded completion certificates that students can share.",
      },
    ];
  }

  return input.map((item, index) => ({
    id: item.id || `feature-${index + 1}`,
    icon: normalizeFeatureIcon(item.icon),
    title: String(item.title ?? "").trim(),
    description: String(item.description ?? "").trim(),
  }));
}

function normalizeSteps(input?: BuilderPageRecord["steps"]): BuilderPageRecord["steps"] {
  if (!input || input.length === 0) {
    return [
      { id: "step-1", title: "Create Your Account", description: "Sign up free in less than 60 seconds." },
      { id: "step-2", title: "Choose Your Courses", description: "Enroll in the courses for your growth journey." },
      { id: "step-3", title: "Learn and Grow", description: "Complete lessons and track your progress." },
    ];
  }

  return input.map((item, index) => ({
    id: item.id || `step-${index + 1}`,
    title: String(item.title ?? "").trim(),
    description: String(item.description ?? "").trim(),
  }));
}

function normalizeTestimonials(input?: BuilderPageRecord["testimonials"]): BuilderPageRecord["testimonials"] {
  if (!input || input.length === 0) {
    return [
      {
        id: "testi-1",
        name: "Sarah Johnson",
        role: "Ministry Leader",
        quote: "Church Planting Movement transformed how I lead my community. The courses are practical, deep, and life-changing.",
      },
      {
        id: "testi-2",
        name: "Michael Chen",
        role: "Church Pastor",
        quote: "The platform is incredibly intuitive. My entire congregation uses it for discipleship training.",
      },
      {
        id: "testi-3",
        name: "Rachel Williams",
        role: "Youth Director",
        quote: "As a youth leader, I needed engaging content. Church Planting Movement delivers that and so much more.",
      },
    ];
  }

  return input.map((item, index) => ({
    id: item.id || `testi-${index + 1}`,
    name: String(item.name ?? "").trim(),
    role: String(item.role ?? "").trim(),
    quote: String(item.quote ?? "").trim(),
  }));
}

function normalizePlans(input?: BuilderPageRecord["plans"]): BuilderPageRecord["plans"] {
  if (!input || input.length === 0) {
    return [
      {
        id: "plan-1",
        name: "Starter",
        price: "9",
        interval: "month",
        description: "Perfect for individuals beginning their journey",
        features: "Access 20 courses\nProgress tracking\nCommunity access\nCertificate of completion",
        ctaText: "Start Free Trial",
        ctaUrl: "/register?plan=starter",
        highlighted: false,
      },
      {
        id: "plan-2",
        name: "Growth",
        price: "29",
        interval: "month",
        description: "For dedicated learners who want everything",
        features: "Unlimited courses\nAdvanced analytics\nPriority support\nDownloadable resources\nGroup discussions\nMonthly live Q&A",
        ctaText: "Start Free Trial",
        ctaUrl: "/register?plan=growth",
        highlighted: true,
      },
      {
        id: "plan-3",
        name: "Pro",
        price: "79",
        interval: "month",
        description: "For teams, churches and organizations",
        features: "Everything in Growth\nUp to 50 team members\nCustom branding\nAPI access\nDedicated account manager\nWhite-label certificates",
        ctaText: "Contact Sales",
        ctaUrl: "/contact",
        highlighted: false,
      },
    ];
  }

  return input.map((item, index) => ({
    id: item.id || `plan-${index + 1}`,
    name: String(item.name ?? "").trim(),
    price: String(item.price ?? "").trim(),
    interval: String(item.interval ?? "").trim(),
    description: String(item.description ?? "").trim(),
    features: String(item.features ?? "").trim(),
    ctaText: String(item.ctaText ?? "").trim(),
    ctaUrl: String(item.ctaUrl ?? "").trim(),
    highlighted: Boolean(item.highlighted),
  }));
}

function normalizeFinalCta(input?: Partial<BuilderPageRecord["finalCta"]>): BuilderPageRecord["finalCta"] {
  return {
    badge: String(input?.badge ?? "").trim(),
    title: String(input?.title ?? "Ready to transform your journey?").trim(),
    description: String(input?.description ?? "Join thousands of learners who are growing in faith, leadership, and purpose.").trim(),
    primaryButtonText: String(input?.primaryButtonText ?? "Get Started Free").trim(),
    primaryButtonUrl: String(input?.primaryButtonUrl ?? "/register").trim(),
    secondaryButtonText: String(input?.secondaryButtonText ?? "See All Plans").trim(),
    secondaryButtonUrl: String(input?.secondaryButtonUrl ?? "/pricing").trim(),
    footnote: String(input?.footnote ?? "14-day free trial · No credit card required").trim(),
  };
}

function normalizeLandingCopy(input?: Partial<BuilderPageRecord["landingCopy"]>): BuilderPageRecord["landingCopy"] {
  return {
    heroBadge: String(input?.heroBadge ?? "Now with AI-powered learning paths").trim(),
    heroFootnote: String(input?.heroFootnote ?? "14-day free trial · No credit card required · Cancel anytime").trim(),
    featuresBadge: String(input?.featuresBadge ?? "Features").trim(),
    featuresTitle: String(input?.featuresTitle ?? "Everything you need to grow your community").trim(),
    featuresDescription: String(input?.featuresDescription ?? "A complete platform with all the tools for teaching, engaging, and monetizing your discipleship ministry.").trim(),
    stepsBadge: String(input?.stepsBadge ?? "How It Works").trim(),
    stepsTitle: String(input?.stepsTitle ?? "Get started in 3 simple steps").trim(),
    booksBadge: String(input?.booksBadge ?? "Book Store").trim(),
    booksTitle: String(input?.booksTitle ?? "Add books to a separate checkout cart, not just subscriptions.").trim(),
    booksDescription: String(input?.booksDescription ?? "Showcase one-time digital book purchases on the landing page with visible sample pricing. Each title opens a checkout flow that feeds the same cart students can access from their dashboard.").trim(),
    booksPanelEyebrow: String(input?.booksPanelEyebrow ?? "Storefront demo").trim(),
    booksPanelTitle: String(input?.booksPanelTitle ?? "Live published books").trim(),
    booksPanelDescription: String(input?.booksPanelDescription ?? "Animated carousel, admin-managed catalog, direct checkout entry").trim(),
    booksPrimaryButtonText: String(input?.booksPrimaryButtonText ?? "Explore Book Checkout").trim(),
    booksPrimaryButtonUrl: String(input?.booksPrimaryButtonUrl ?? "/checkout").trim(),
    booksSecondaryButtonText: String(input?.booksSecondaryButtonText ?? "See Student Cart Experience").trim(),
    booksSecondaryButtonUrl: String(input?.booksSecondaryButtonUrl ?? "/dashboard").trim(),
    testimonialsBadge: String(input?.testimonialsBadge ?? "Testimonials").trim(),
    testimonialsTitle: String(input?.testimonialsTitle ?? "Loved by thousands of learners").trim(),
    pricingBadge: String(input?.pricingBadge ?? "Pricing").trim(),
    pricingTitle: String(input?.pricingTitle ?? "Simple, transparent pricing").trim(),
    pricingDescription: String(input?.pricingDescription ?? "Start free. Upgrade when you're ready. Cancel anytime.").trim(),
    pricingPopularLabel: String(input?.pricingPopularLabel ?? "Most Popular").trim(),
  };
}

function normalizeTheme(input?: BuilderPageRecord["theme"]): BuilderPageRecord["theme"] {
  return {
    bodyFontFamily: String(input?.bodyFontFamily ?? "'DM Sans', ui-sans-serif, system-ui, sans-serif").trim(),
    headingFontFamily: String(input?.headingFontFamily ?? "'Space Grotesk', 'DM Sans', ui-sans-serif, system-ui, sans-serif").trim(),
    pageBackgroundColor: String(input?.pageBackgroundColor ?? "#0b1220").trim(),
    sectionBackgroundColor: String(input?.sectionBackgroundColor ?? "#ffffff").trim(),
    cardBackgroundColor: String(input?.cardBackgroundColor ?? "#ffffff").trim(),
    textColor: String(input?.textColor ?? "#334155").trim(),
    headingColor: String(input?.headingColor ?? "#0f172a").trim(),
    accentColor: String(input?.accentColor ?? "#2563eb").trim(),
  };
}

function defaultPages(): BuilderPageRecord[] {
  const timestamp = nowIso();
  return [
    {
      id: "page-home",
      name: "Home Page",
      slug: "home-page",
      path: "/",
      status: "DRAFT",
      seoTitle: "Church Planting Movement Home",
      seoDescription: "Edit this homepage from Super Admin Page Builder.",
      hero: {
        title: "Learn. Grow. Transform.",
        subtitle: "Use the Page Builder to edit homepage text, images, and calls to action in real time.",
        primaryButtonText: "Start for Free",
        primaryButtonUrl: "/register",
        secondaryButtonText: "Browse Courses",
        secondaryButtonUrl: "/courses",
        imageUrl: "/course-art/foundations-of-everyday-discipleship?scene=hero",
      },
      stats: normalizeStats(),
      features: normalizeFeatures(),
      steps: normalizeSteps(),
      landingCopy: normalizeLandingCopy(),
      theme: normalizeTheme(),
      testimonials: normalizeTestimonials(),
      plans: normalizePlans(),
      finalCta: normalizeFinalCta(),
      sections: [
        emptySection({
          id: "home-text-1",
          type: "TEXT",
          title: "Built for ministries and teams",
          content: "Edit this content under Admin > Settings > Page Builder.",
        }),
        emptySection({
          id: "home-cta-1",
          type: "CTA",
          title: "Invite visitors to act",
          content: "Use Save for draft updates and Publish to push live.",
          buttonText: "Open Pricing",
          buttonUrl: "/pricing",
        }),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: null,
    },
    {
      id: "page-newsletter",
      name: "Newsletter Page",
      slug: "newsletter-page",
      path: "/newsletter",
      status: "DRAFT",
      seoTitle: "Newsletter",
      seoDescription: "Collect subscribers and announcements.",
      hero: {
        title: "Newsletter",
        subtitle: "Publish updates and collect email subscribers.",
        primaryButtonText: "Subscribe",
        primaryButtonUrl: "#",
        secondaryButtonText: "Back Home",
        secondaryButtonUrl: "/",
        imageUrl: "",
      },
      stats: [],
      features: [],
      steps: [],
      landingCopy: normalizeLandingCopy({
        booksTitle: "Promote your newsletter offer",
        booksDescription: "Customize this page for newsletter growth or lead capture.",
      }),
      theme: normalizeTheme(),
      testimonials: [],
      plans: [],
      finalCta: normalizeFinalCta({
        badge: "Newsletter",
        title: "Grow your email community",
        description: "Build your audience with a clear value proposition.",
      }),
      sections: [emptySection({ id: "newsletter-text", type: "TEXT", title: "Stay Updated", content: "Share your latest ministry updates here." })],
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: null,
    },
    {
      id: "page-lead",
      name: "Lead Page",
      slug: "lead-page",
      path: "/lead",
      status: "DRAFT",
      seoTitle: "Lead Generation",
      seoDescription: "Capture lead information from custom funnels.",
      hero: {
        title: "Lead Page",
        subtitle: "Create lead pages for campaigns and funnels.",
        primaryButtonText: "Get Started",
        primaryButtonUrl: "/register",
        secondaryButtonText: "Contact",
        secondaryButtonUrl: "/contact",
        imageUrl: "",
      },
      stats: [],
      features: [],
      steps: [],
      landingCopy: normalizeLandingCopy({
        booksTitle: "Promote your lead magnet",
        booksDescription: "Customize this page for focused lead conversion.",
      }),
      theme: normalizeTheme(),
      testimonials: [],
      plans: [],
      finalCta: normalizeFinalCta({
        badge: "Campaign",
        title: "Capture qualified leads",
        description: "Build focused conversion pages in minutes.",
      }),
      sections: [emptySection({ id: "lead-text", type: "TEXT", title: "Lead Capture", content: "Describe your offer and add a contact flow." })],
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: null,
    },
  ];
}

function sanitizePage(input: Partial<BuilderPageRecord>, existing?: BuilderPageRecord): BuilderPageRecord {
  const timestamp = nowIso();
  const base: BuilderPageRecord =
    existing ?? {
      id: `page-${Date.now()}`,
      name: "Untitled Page",
      slug: "untitled-page",
      path: "/untitled-page",
      status: "DRAFT",
      seoTitle: "",
      seoDescription: "",
      hero: {
        title: "Page Title",
        subtitle: "Add your page subtitle.",
        primaryButtonText: "Primary Action",
        primaryButtonUrl: "/",
        secondaryButtonText: "Secondary Action",
        secondaryButtonUrl: "/",
        imageUrl: "",
      },
      stats: [],
      features: [],
      steps: [],
      landingCopy: normalizeLandingCopy(),
      theme: normalizeTheme(),
      testimonials: [],
      plans: [],
      finalCta: normalizeFinalCta(),
      sections: [emptySection()],
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: null,
    };

  const nextName = String(input.name ?? base.name).trim() || base.name;
  const nextPath = normalizePath(String(input.path ?? base.path));
  const nextStatus = normalizeStatus(input.status ?? base.status);

  const next: BuilderPageRecord = {
    ...base,
    ...input,
    name: nextName,
    slug: toSlug(String(input.slug ?? base.slug).trim() || nextName) || base.slug,
    path: nextPath,
    status: nextStatus,
    seoTitle: String(input.seoTitle ?? base.seoTitle).trim(),
    seoDescription: String(input.seoDescription ?? base.seoDescription).trim(),
    hero: {
      title: String(input.hero?.title ?? base.hero.title).trim(),
      subtitle: String(input.hero?.subtitle ?? base.hero.subtitle).trim(),
      primaryButtonText: String(input.hero?.primaryButtonText ?? base.hero.primaryButtonText).trim(),
      primaryButtonUrl: String(input.hero?.primaryButtonUrl ?? base.hero.primaryButtonUrl).trim(),
      secondaryButtonText: String(input.hero?.secondaryButtonText ?? base.hero.secondaryButtonText).trim(),
      secondaryButtonUrl: String(input.hero?.secondaryButtonUrl ?? base.hero.secondaryButtonUrl).trim(),
      imageUrl: String(input.hero?.imageUrl ?? base.hero.imageUrl).trim(),
    },
    stats: normalizeStats(input.stats ?? base.stats),
    features: normalizeFeatures(input.features ?? base.features),
    steps: normalizeSteps(input.steps ?? base.steps),
    landingCopy: normalizeLandingCopy(input.landingCopy ?? base.landingCopy),
    theme: normalizeTheme(input.theme ?? base.theme),
    testimonials: normalizeTestimonials(input.testimonials ?? base.testimonials),
    plans: normalizePlans(input.plans ?? base.plans),
    finalCta: normalizeFinalCta(input.finalCta ?? base.finalCta),
    sections: (input.sections ?? base.sections).map((section) => emptySection(section)),
    updatedAt: timestamp,
    publishedAt: nextStatus === "PUBLISHED" ? String(input.publishedAt ?? base.publishedAt ?? timestamp) : null,
  };

  return next;
}

function sanitizeStore(input?: Partial<BuilderStoreData>): BuilderStoreData {
  const pages = (input?.pages && input.pages.length > 0 ? input.pages : defaultPages()).map((page) => sanitizePage(page));
  return {
    pages,
    updatedAt: nowIso(),
  };
}

export async function readPageBuilderStore(): Promise<BuilderStoreData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<BuilderStoreData>;
    return sanitizeStore(parsed);
  } catch {
    const seed = sanitizeStore();
    await writePageBuilderStore(seed);
    return seed;
  }
}

export async function writePageBuilderStore(next: Partial<BuilderStoreData>): Promise<BuilderStoreData> {
  const payload = sanitizeStore(next);
  await ensureDirExists(DATA_PATH);
  await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

function assertUniquePath(pages: BuilderPageRecord[], pathValue: string, ignoreId?: string) {
  const duplicate = pages.find((page) => page.path === pathValue && page.id !== ignoreId);
  if (duplicate) {
    throw new Error(`A page with path \"${pathValue}\" already exists.`);
  }
}

export async function listAllBuilderPages() {
  const store = await readPageBuilderStore();
  return store.pages.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function createBuilderPage(input?: Partial<BuilderPageRecord>) {
  const store = await readPageBuilderStore();
  const timestamp = Date.now();
  const created = sanitizePage({
    id: `page-${timestamp}`,
    name: `New Page ${store.pages.length + 1}`,
    slug: `new-page-${timestamp}`,
    path: `/new-page-${timestamp}`,
    status: "DRAFT",
    sections: [emptySection()],
    ...input,
  });

  assertUniquePath(store.pages, created.path);
  const saved = await writePageBuilderStore({ ...store, pages: [...store.pages, created] });
  return saved.pages.find((page) => page.id === created.id) ?? created;
}

export async function updateBuilderPage(pageId: string, input: Partial<BuilderPageRecord>) {
  const store = await readPageBuilderStore();
  const existing = store.pages.find((page) => page.id === pageId);
  if (!existing) return null;

  const next = sanitizePage(input, existing);
  assertUniquePath(store.pages, next.path, pageId);

  const saved = await writePageBuilderStore({
    ...store,
    pages: store.pages.map((page) => (page.id === pageId ? next : page)),
  });

  return saved.pages.find((page) => page.id === pageId) ?? null;
}

export async function deleteBuilderPage(pageId: string) {
  const store = await readPageBuilderStore();
  const nextPages = store.pages.filter((page) => page.id !== pageId);
  if (nextPages.length === store.pages.length) return false;
  await writePageBuilderStore({ ...store, pages: nextPages });
  return true;
}

export async function getPublishedBuilderPageByPath(pathname: string) {
  const store = await readPageBuilderStore();
  const normalized = normalizePath(pathname);
  return store.pages.find((page) => page.status === "PUBLISHED" && page.path === normalized) ?? null;
}
