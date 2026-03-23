export type BuilderPageStatus = "DRAFT" | "PUBLISHED";

export type BuilderSectionType = "TEXT" | "IMAGE" | "CTA";

export type BuilderFeatureIcon =
  | "BookOpen"
  | "TrendingUp"
  | "Users"
  | "Zap"
  | "Shield"
  | "Award";

export type BuilderPageSection = {
  id: string;
  type: BuilderSectionType;
  title: string;
  content: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
};

export type BuilderHeroBlock = {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  imageUrl: string;
};

export type BuilderStatItem = {
  id: string;
  value: string;
  label: string;
};

export type BuilderFeatureItem = {
  id: string;
  icon: BuilderFeatureIcon;
  title: string;
  description: string;
};

export type BuilderStepItem = {
  id: string;
  title: string;
  description: string;
};

export type BuilderTestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
};

export type BuilderPlanItem = {
  id: string;
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string;
  ctaText: string;
  ctaUrl: string;
  highlighted: boolean;
};

export type BuilderFinalCtaBlock = {
  badge: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  footnote: string;
};

export type BuilderThemeBlock = {
  bodyFontFamily: string;
  headingFontFamily: string;
  pageBackgroundColor: string;
  sectionBackgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
};

export type BuilderLandingCopyBlock = {
  heroBadge: string;
  heroFootnote: string;
  featuresBadge: string;
  featuresTitle: string;
  featuresDescription: string;
  stepsBadge: string;
  stepsTitle: string;
  booksBadge: string;
  booksTitle: string;
  booksDescription: string;
  booksPanelEyebrow: string;
  booksPanelTitle: string;
  booksPanelDescription: string;
  booksPrimaryButtonText: string;
  booksPrimaryButtonUrl: string;
  booksSecondaryButtonText: string;
  booksSecondaryButtonUrl: string;
  testimonialsBadge: string;
  testimonialsTitle: string;
  pricingBadge: string;
  pricingTitle: string;
  pricingDescription: string;
  pricingPopularLabel: string;
};

export type BuilderPageRecord = {
  id: string;
  name: string;
  slug: string;
  path: string;
  status: BuilderPageStatus;
  seoTitle: string;
  seoDescription: string;
  hero: BuilderHeroBlock;
  stats: BuilderStatItem[];
  features: BuilderFeatureItem[];
  steps: BuilderStepItem[];
  landingCopy: BuilderLandingCopyBlock;
  theme: BuilderThemeBlock;
  testimonials: BuilderTestimonialItem[];
  plans: BuilderPlanItem[];
  finalCta: BuilderFinalCtaBlock;
  sections: BuilderPageSection[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type BuilderStoreData = {
  pages: BuilderPageRecord[];
  updatedAt: string;
};
