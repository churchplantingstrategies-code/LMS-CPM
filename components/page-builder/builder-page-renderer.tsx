import Link from "next/link";
import { Award, BookOpen, CheckCircle, GripVertical, Pencil, Plus, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookCarousel } from "@/components/books/book-carousel";
import { BuilderPageRecord } from "@/types/page-builder";
import type { CSSProperties } from "react";

export type BuilderPreviewSelection = {
  tool: "text" | "image" | "card" | "carousel" | "buttons" | "icon-list" | "icon" | "image-box" | "page";
  targetId: string;
  label: string;
};

export function BuilderPageRenderer({
  page,
  preview = false,
  previewDevice = "desktop",
  activeTargetId,
  onSelectElement,
  onInlineTextChange,
  onReorderElement,
  onInsertSectionAt,
}: {
  page: BuilderPageRecord;
  preview?: boolean;
  previewDevice?: "desktop" | "tablet" | "mobile";
  activeTargetId?: string;
  onSelectElement?: (selection: BuilderPreviewSelection) => void;
  onInlineTextChange?: (targetId: string, value: string, fieldKey?: string) => void;
  onReorderElement?: (sourceTargetId: string, targetTargetId: string) => void;
  onInsertSectionAt?: (index: number) => void;
}) {
  const featureIcons = {
    BookOpen,
    TrendingUp,
    Users,
    Zap,
    Shield,
    Award,
  };

  const theme = page.theme;
  const bodyTextStyle: CSSProperties = { fontFamily: theme.bodyFontFamily, color: theme.textColor };
  const headingTextStyle: CSSProperties = { fontFamily: theme.headingFontFamily, color: theme.headingColor };
  const sectionSurfaceStyle: CSSProperties = { backgroundColor: theme.sectionBackgroundColor };
  const cardSurfaceStyle: CSSProperties = { backgroundColor: theme.cardBackgroundColor };
  const isMobilePreview = preview && previewDevice === "mobile";
  const isTabletPreview = preview && previewDevice === "tablet";

  return (
    <div className={preview ? "rounded-2xl border border-slate-800" : ""} style={{ backgroundColor: theme.pageBackgroundColor, ...bodyTextStyle }}>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-indigo-900 text-white">
        <div className="section-container py-16 md:py-24">
          <div className={isMobilePreview || isTabletPreview ? "grid gap-8" : "grid gap-8 lg:grid-cols-2 lg:items-center"}>
            <div>
              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="hero-badge" label="Hero Badge">
                {page.landingCopy.heroBadge ? (
                  <Badge className="mb-6 border-brand-600 bg-brand-700/50 text-brand-200">
                    <InlineText
                      preview={preview}
                      targetId="hero-badge"
                      value={page.landingCopy.heroBadge}
                      onInlineTextChange={onInlineTextChange}
                    />
                  </Badge>
                ) : null}
              </EditableNode>

              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="hero-title" label="Hero Title">
                <InlineText
                  as="h1"
                  className={isMobilePreview ? "text-3xl font-bold leading-tight" : "text-3xl font-bold leading-tight md:text-5xl"}
                  preview={preview}
                  targetId="hero-title"
                  value={page.hero.title}
                  onInlineTextChange={onInlineTextChange}
                  style={{ fontFamily: theme.headingFontFamily }}
                />
              </EditableNode>

              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="hero-subtitle" label="Hero Subtitle">
                <InlineText
                  as="p"
                  className={isMobilePreview ? "mt-4 max-w-2xl whitespace-pre-wrap text-base text-brand-100" : "mt-4 max-w-2xl whitespace-pre-wrap text-base text-brand-100 md:text-lg"}
                  preview={preview}
                  targetId="hero-subtitle"
                  value={page.hero.subtitle}
                  onInlineTextChange={onInlineTextChange}
                  multiline
                  style={{ fontFamily: theme.bodyFontFamily }}
                />
              </EditableNode>

              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="buttons" targetId="hero-buttons" label="Hero Buttons">
                <div className="mt-6 flex flex-wrap gap-3">
                  {page.hero.primaryButtonText ? (
                    <InlineButtonLink
                      preview={preview}
                      text={page.hero.primaryButtonText}
                      href={page.hero.primaryButtonUrl || "#"}
                      targetId="hero-buttons"
                      textFieldKey="primaryText"
                      urlFieldKey="primaryUrl"
                      onInlineTextChange={onInlineTextChange}
                      className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-gray-100"
                    />
                  ) : null}
                  {page.hero.secondaryButtonText ? (
                    <InlineButtonLink
                      preview={preview}
                      text={page.hero.secondaryButtonText}
                      href={page.hero.secondaryButtonUrl || "#"}
                      targetId="hero-buttons"
                      textFieldKey="secondaryText"
                      urlFieldKey="secondaryUrl"
                      onInlineTextChange={onInlineTextChange}
                      className="inline-flex items-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                    />
                  ) : null}
                </div>
              </EditableNode>

              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="hero-footnote" label="Hero Footnote">
                {page.landingCopy.heroFootnote ? (
                  <InlineText
                    as="p"
                    className="mt-6 text-sm text-brand-300"
                    preview={preview}
                    targetId="hero-footnote"
                    value={page.landingCopy.heroFootnote}
                    onInlineTextChange={onInlineTextChange}
                  />
                ) : null}
              </EditableNode>
            </div>

            {page.hero.imageUrl ? (
              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="image" targetId="hero-image" label="Hero Image">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-2">
                  <img src={page.hero.imageUrl} alt={page.hero.title} className="h-full w-full rounded-xl object-cover" />
                </div>
              </EditableNode>
            ) : null}
          </div>
        </div>
      </section>

      {page.stats.length > 0 ? (
        <section className="bg-brand-600 py-12 text-white">
          <div className={
            isMobilePreview
              ? "section-container grid grid-cols-2 gap-6 text-center"
              : "section-container grid grid-cols-2 gap-6 text-center md:grid-cols-4"
          }>
            {page.stats.map((item) => (
              <EditableNode key={item.id} preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} onReorderElement={onReorderElement} tool="card" targetId={`stat:${item.id}`} label={`Stat ${item.label}`} draggableNode>
                <div>
                  <InlineText
                    as="p"
                    className="text-3xl font-bold md:text-4xl"
                    preview={preview}
                    targetId={`stat:${item.id}`}
                    fieldKey="value"
                    value={item.value}
                    onInlineTextChange={onInlineTextChange}
                  />
                  <InlineText
                    as="p"
                    className="mt-1 text-sm text-brand-100 md:text-base"
                    preview={preview}
                    targetId={`stat:${item.id}`}
                    fieldKey="label"
                    value={item.label}
                    onInlineTextChange={onInlineTextChange}
                  />
                </div>
              </EditableNode>
            ))}
          </div>
        </section>
      ) : null}

      {page.features.length > 0 ? (
        <section className="py-14 md:py-20" style={sectionSurfaceStyle}>
          <div className="section-container">
            <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="features-heading" label="Features Heading">
              <div className="mb-10 text-center">
                {page.landingCopy.featuresBadge ? (
                  <Badge className="mb-4" variant="brand">
                    <InlineText preview={preview} targetId="features-heading" fieldKey="badge" value={page.landingCopy.featuresBadge} onInlineTextChange={onInlineTextChange} />
                  </Badge>
                ) : null}
                <InlineText as="h2" className="text-3xl font-bold" preview={preview} targetId="features-heading" fieldKey="title" value={page.landingCopy.featuresTitle} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                <InlineText as="p" className="mx-auto mt-3 max-w-2xl" preview={preview} targetId="features-heading" fieldKey="description" value={page.landingCopy.featuresDescription} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
              </div>
            </EditableNode>

            <div className={
              isMobilePreview
                ? "grid gap-5"
                : isTabletPreview
                  ? "grid gap-5 md:grid-cols-2"
                  : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            }>
              {page.features.map((feature) => {
                const Icon = featureIcons[feature.icon] ?? BookOpen;
                return (
                  <EditableNode key={feature.id} preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} onReorderElement={onReorderElement} tool="card" targetId={`feature:${feature.id}`} label={`Feature ${feature.title}`} draggableNode>
                    <Card className="border-0 shadow-sm card-hover" style={cardSurfaceStyle}>
                      <CardContent className="pt-6">
                        <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="icon" targetId={`feature-icon:${feature.id}`} label={`Feature Icon ${feature.title}`} nested>
                          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                            <Icon className="h-6 w-6" />
                          </div>
                        </EditableNode>
                        <InlineText as="h3" className="text-lg font-semibold" preview={preview} targetId={`feature:${feature.id}`} fieldKey="title" value={feature.title} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                        <InlineText as="p" className="mt-2 text-sm" preview={preview} targetId={`feature:${feature.id}`} fieldKey="description" value={feature.description} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
                      </CardContent>
                    </Card>
                  </EditableNode>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {page.steps.length > 0 ? (
        <section className="py-14 md:py-20" style={sectionSurfaceStyle}>
          <div className="section-container">
            <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="steps-heading" label="Steps Heading">
              <div className="mb-10 text-center">
                {page.landingCopy.stepsBadge ? (
                  <Badge className="mb-4" variant="brand">
                    <InlineText preview={preview} targetId="steps-heading" fieldKey="badge" value={page.landingCopy.stepsBadge} onInlineTextChange={onInlineTextChange} />
                  </Badge>
                ) : null}
                <InlineText as="h2" className="text-3xl font-bold" preview={preview} targetId="steps-heading" fieldKey="title" value={page.landingCopy.stepsTitle} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
              </div>
            </EditableNode>
            <div className={
              isMobilePreview
                ? "grid gap-5"
                : "grid gap-5 md:grid-cols-3"
            }>
              {page.steps.map((step, index) => (
                <EditableNode key={step.id} preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} onReorderElement={onReorderElement} tool="card" targetId={`step:${step.id}`} label={`Step ${step.title}`} draggableNode>
                  <article className="rounded-2xl border border-slate-200 p-5 text-center" style={cardSurfaceStyle}>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{index + 1}</span>
                    <InlineText as="h3" className="mt-4 text-lg font-semibold" preview={preview} targetId={`step:${step.id}`} fieldKey="title" value={step.title} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                    <InlineText as="p" className="mt-2 text-sm" preview={preview} targetId={`step:${step.id}`} fieldKey="description" value={step.description} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
                  </article>
                </EditableNode>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden py-24" style={sectionSurfaceStyle}>
        <div className="section-container">
          <div className={isMobilePreview || isTabletPreview ? "mb-12 flex flex-col gap-6" : "mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"}>
            <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="books-heading" label="Books Heading">
              <div className="max-w-2xl">
                {page.landingCopy.booksBadge ? (
                  <Badge className="mb-4" variant="brand">
                    <InlineText preview={preview} targetId="books-heading" fieldKey="badge" value={page.landingCopy.booksBadge} onInlineTextChange={onInlineTextChange} />
                  </Badge>
                ) : null}
                <InlineText as="h2" className={isMobilePreview ? "text-3xl font-bold" : "text-3xl font-bold md:text-4xl"} preview={preview} targetId="books-heading" fieldKey="title" value={page.landingCopy.booksTitle} onInlineTextChange={onInlineTextChange} multiline style={headingTextStyle} />
                <InlineText as="p" className="mt-4" preview={preview} targetId="books-heading" fieldKey="description" value={page.landingCopy.booksDescription} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
              </div>
            </EditableNode>

            <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="image-box" targetId="books-panel" label="Books Panel">
              <div className="rounded-3xl border border-amber-200 px-6 py-5 shadow-sm" style={cardSurfaceStyle}>
                <InlineText as="p" className="text-sm font-semibold uppercase tracking-[0.28em]" preview={preview} targetId="books-panel" fieldKey="eyebrow" value={page.landingCopy.booksPanelEyebrow} onInlineTextChange={onInlineTextChange} style={{ color: theme.accentColor }} />
                <InlineText as="p" className="mt-2 text-3xl font-bold" preview={preview} targetId="books-panel" fieldKey="title" value={page.landingCopy.booksPanelTitle} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                <InlineText as="p" className="mt-1 text-sm" preview={preview} targetId="books-panel" fieldKey="description" value={page.landingCopy.booksPanelDescription} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
              </div>
            </EditableNode>
          </div>

          <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="carousel" targetId="books-carousel" label="Books Carousel">
            <BookCarousel />
          </EditableNode>

          <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="buttons" targetId="books-buttons" label="Books Buttons">
            <div className={isMobilePreview ? "mt-10 flex flex-col gap-3" : "mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"}>
              {page.landingCopy.booksPrimaryButtonText ? (
                <InlineButtonLink
                  preview={preview}
                  text={page.landingCopy.booksPrimaryButtonText}
                  href={page.landingCopy.booksPrimaryButtonUrl || "#"}
                  targetId="books-buttons"
                  textFieldKey="primaryText"
                  urlFieldKey="primaryUrl"
                  onInlineTextChange={onInlineTextChange}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                />
              ) : null}
              {page.landingCopy.booksSecondaryButtonText ? (
                <InlineButtonLink
                  preview={preview}
                  text={page.landingCopy.booksSecondaryButtonText}
                  href={page.landingCopy.booksSecondaryButtonUrl || "#"}
                  targetId="books-buttons"
                  textFieldKey="secondaryText"
                  urlFieldKey="secondaryUrl"
                  onInlineTextChange={onInlineTextChange}
                  className="inline-flex items-center justify-center rounded-xl border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                />
              ) : null}
            </div>
          </EditableNode>
        </div>
      </section>

      {page.testimonials.length > 0 ? (
        <section className="py-14 md:py-20" style={sectionSurfaceStyle}>
          <div className="section-container">
            <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="testimonials-heading" label="Testimonials Heading">
              <div className="mb-10 text-center">
                {page.landingCopy.testimonialsBadge ? (
                  <Badge className="mb-4" variant="brand">
                    <InlineText preview={preview} targetId="testimonials-heading" fieldKey="badge" value={page.landingCopy.testimonialsBadge} onInlineTextChange={onInlineTextChange} />
                  </Badge>
                ) : null}
                <InlineText as="h2" className="text-3xl font-bold" preview={preview} targetId="testimonials-heading" fieldKey="title" value={page.landingCopy.testimonialsTitle} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
              </div>
            </EditableNode>
            <div className={isMobilePreview ? "grid gap-5" : "grid gap-5 md:grid-cols-3"}>
              {page.testimonials.map((item) => (
                <EditableNode key={item.id} preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} onReorderElement={onReorderElement} tool="card" targetId={`testimonial:${item.id}`} label={`Testimonial ${item.name}`} draggableNode>
                  <Card className="border-0 shadow-sm" style={cardSurfaceStyle}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index} className="text-amber-400">★</span>
                        ))}
                      </div>
                      <InlineText as="p" className="text-sm" preview={preview} targetId={`testimonial:${item.id}`} fieldKey="quote" value={item.quote} onInlineTextChange={onInlineTextChange} multiline withQuotes style={bodyTextStyle} />
                      <InlineText as="p" className="mt-4 text-sm font-semibold" preview={preview} targetId={`testimonial:${item.id}`} fieldKey="name" value={item.name} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                      <InlineText as="p" className="text-xs" preview={preview} targetId={`testimonial:${item.id}`} fieldKey="role" value={item.role} onInlineTextChange={onInlineTextChange} style={bodyTextStyle} />
                    </CardContent>
                  </Card>
                </EditableNode>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.plans.length > 0 ? (
        <section className="py-14 md:py-20" style={sectionSurfaceStyle}>
          <div className="section-container">
            <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="pricing-heading" label="Pricing Heading">
              <div className="mb-10 text-center">
                {page.landingCopy.pricingBadge ? (
                  <Badge className="mb-4" variant="brand">
                    <InlineText preview={preview} targetId="pricing-heading" fieldKey="badge" value={page.landingCopy.pricingBadge} onInlineTextChange={onInlineTextChange} />
                  </Badge>
                ) : null}
                <InlineText as="h2" className="text-3xl font-bold" preview={preview} targetId="pricing-heading" fieldKey="title" value={page.landingCopy.pricingTitle} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                <InlineText as="p" className="mt-3" preview={preview} targetId="pricing-heading" fieldKey="description" value={page.landingCopy.pricingDescription} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
              </div>
            </EditableNode>
            <div className={isMobilePreview ? "grid gap-5" : "grid gap-5 md:grid-cols-3"}>
              {page.plans.map((plan) => (
                <EditableNode key={plan.id} preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} onReorderElement={onReorderElement} tool="card" targetId={`plan:${plan.id}`} label={`Plan ${plan.name}`} draggableNode>
                  <article className={`rounded-2xl border p-5 ${plan.highlighted ? "border-brand-400" : "border-slate-200"}`} style={cardSurfaceStyle}>
                    {plan.highlighted ? (
                      <div className="mb-4 inline-flex rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950">
                        <InlineText preview={preview} targetId="pricing-heading" fieldKey="popularLabel" value={page.landingCopy.pricingPopularLabel} onInlineTextChange={onInlineTextChange} />
                      </div>
                    ) : null}
                    <InlineText as="h3" className="text-xl font-semibold" preview={preview} targetId={`plan:${plan.id}`} fieldKey="name" value={plan.name} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                    <p className="mt-2 text-3xl font-bold" style={headingTextStyle}>
                      $<InlineText as="span" className="inline" preview={preview} targetId={`plan:${plan.id}`} fieldKey="price" value={plan.price} onInlineTextChange={onInlineTextChange} />
                      <span className="ml-1 text-sm font-medium text-slate-500">/<InlineText as="span" className="inline" preview={preview} targetId={`plan:${plan.id}`} fieldKey="interval" value={plan.interval} onInlineTextChange={onInlineTextChange} /></span>
                    </p>
                    <InlineText as="p" className="mt-2 text-sm" preview={preview} targetId={`plan:${plan.id}`} fieldKey="description" value={plan.description} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
                    <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="icon-list" targetId={`plan-features:${plan.id}`} label={`Plan Features ${plan.name}`} nested>
                      <ul className="mt-4 space-y-2">
                        {plan.features
                          .split("\n")
                          .map((feature) => feature.trim())
                          .filter(Boolean)
                          .map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                              <CheckCircle className="mt-0.5 h-4 w-4 text-brand-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                      </ul>
                    </EditableNode>
                    {plan.ctaText ? (
                      <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="buttons" targetId={`plan-cta:${plan.id}`} label={`Plan CTA ${plan.name}`} nested>
                        <div className="mt-5">
                          <InlineButtonLink
                            preview={preview}
                            text={plan.ctaText}
                            href={plan.ctaUrl || "#"}
                            targetId={`plan-cta:${plan.id}`}
                            textFieldKey="text"
                            urlFieldKey="url"
                            onInlineTextChange={onInlineTextChange}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                          />
                        </div>
                      </EditableNode>
                    ) : null}
                  </article>
                </EditableNode>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-14 text-white md:py-20" style={{ backgroundColor: theme.accentColor }}>
        <div className="section-container text-center">
          <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="final-cta-text" label="Final CTA Text">
            <div>
                {page.finalCta.badge ? <InlineText as="p" className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-300" preview={preview} targetId="final-cta-text" fieldKey="badge" value={page.finalCta.badge} onInlineTextChange={onInlineTextChange} /> : null}
                <InlineText as="h2" className={isMobilePreview ? "mx-auto mt-3 max-w-3xl text-3xl font-bold" : "mx-auto mt-3 max-w-3xl text-3xl font-bold md:text-4xl"} preview={preview} targetId="final-cta-text" fieldKey="title" value={page.finalCta.title} onInlineTextChange={onInlineTextChange} multiline style={{ fontFamily: theme.headingFontFamily }} />
                <InlineText as="p" className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base" preview={preview} targetId="final-cta-text" fieldKey="description" value={page.finalCta.description} onInlineTextChange={onInlineTextChange} multiline />
            </div>
          </EditableNode>

          <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="buttons" targetId="final-cta-buttons" label="Final CTA Buttons">
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {page.finalCta.primaryButtonText ? (
                <InlineButtonLink
                  preview={preview}
                  text={page.finalCta.primaryButtonText}
                  href={page.finalCta.primaryButtonUrl || "#"}
                  targetId="final-cta-buttons"
                  textFieldKey="primaryText"
                  urlFieldKey="primaryUrl"
                  onInlineTextChange={onInlineTextChange}
                  className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200"
                />
              ) : null}
              {page.finalCta.secondaryButtonText ? (
                <InlineButtonLink
                  preview={preview}
                  text={page.finalCta.secondaryButtonText}
                  href={page.finalCta.secondaryButtonUrl || "#"}
                  targetId="final-cta-buttons"
                  textFieldKey="secondaryText"
                  urlFieldKey="secondaryUrl"
                  onInlineTextChange={onInlineTextChange}
                  className="inline-flex items-center rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                />
              ) : null}
            </div>
          </EditableNode>

          <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="text" targetId="final-cta-text" label="Final CTA Text">
            {page.finalCta.footnote ? <InlineText as="p" className="mt-6 text-sm text-brand-300" preview={preview} targetId="final-cta-text" fieldKey="footnote" value={page.finalCta.footnote} onInlineTextChange={onInlineTextChange} /> : null}
          </EditableNode>
        </div>
      </section>

      <section className="py-12 md:py-16" style={sectionSurfaceStyle}>
        <div className="section-container space-y-4">
          {preview && onInsertSectionAt ? <InsertSectionControl onClick={() => onInsertSectionAt(0)} /> : null}
          {page.sections.map((section, index) => (
            <div key={section.id} className="space-y-4">
              <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} onReorderElement={onReorderElement} tool="card" targetId={`section:${section.id}`} label={`Extra Block ${section.title || section.id}`} draggableNode>
                <article className="rounded-2xl border border-gray-200 p-6 shadow-sm" style={cardSurfaceStyle}>
                  <div className={isMobilePreview ? "grid gap-5" : "grid gap-5 md:grid-cols-[1fr_auto] md:items-start"}>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">{section.type}</p>
                      <InlineText as="h2" className="text-2xl font-bold" preview={preview} targetId={`section:${section.id}`} fieldKey="title" value={section.title} onInlineTextChange={onInlineTextChange} style={headingTextStyle} />
                      <InlineText as="p" className="mt-3 whitespace-pre-wrap" preview={preview} targetId={`section:${section.id}`} fieldKey="content" value={section.content} onInlineTextChange={onInlineTextChange} multiline style={bodyTextStyle} />
                      {section.buttonText ? (
                        <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="buttons" targetId={`section-button:${section.id}`} label={`Section Button ${section.title}`} nested>
                          <div className="mt-4">
                            <InlineButtonLink
                              preview={preview}
                              text={section.buttonText}
                              href={section.buttonUrl || "#"}
                              targetId={`section-button:${section.id}`}
                              textFieldKey="text"
                              urlFieldKey="url"
                              onInlineTextChange={onInlineTextChange}
                              className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                            />
                          </div>
                        </EditableNode>
                      ) : null}
                    </div>
                    {section.imageUrl ? (
                      <EditableNode preview={preview} activeTargetId={activeTargetId} onSelectElement={onSelectElement} tool="image" targetId={`section-image:${section.id}`} label={`Section Image ${section.title}`} nested>
                        <img src={section.imageUrl} alt={section.title} className="h-32 w-44 rounded-xl border object-cover" />
                      </EditableNode>
                    ) : null}
                  </div>
                </article>
              </EditableNode>
              {preview && onInsertSectionAt ? <InsertSectionControl onClick={() => onInsertSectionAt(index + 1)} /> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InlineText({
  as = "span",
  className,
  preview,
  targetId,
  value,
  onInlineTextChange,
  fieldKey,
  multiline = false,
  withQuotes = false,
  style,
}: {
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  preview: boolean;
  targetId: string;
  value: string;
  onInlineTextChange?: (targetId: string, value: string, fieldKey?: string) => void;
  fieldKey?: string;
  multiline?: boolean;
  withQuotes?: boolean;
  style?: CSSProperties;
}) {
  const Tag = as;
  const safeValue = value || "";

  if (!preview || !onInlineTextChange) {
    return <Tag className={className} style={style}>{withQuotes ? `"${safeValue}"` : safeValue}</Tag>;
  }

  return (
    <Tag
      className={`${className || ""} rounded px-1 focus:bg-brand-100/50 focus:outline-none`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.replace(/^"|"$/g, "") ?? "";
        if (nextValue !== safeValue) {
          onInlineTextChange(targetId, nextValue, fieldKey);
        }
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {withQuotes ? `"${safeValue}"` : safeValue}
    </Tag>
  );
}

function InlineButtonLink({
  preview,
  text,
  href,
  targetId,
  textFieldKey,
  urlFieldKey,
  onInlineTextChange,
  className,
}: {
  preview: boolean;
  text: string;
  href: string;
  targetId: string;
  textFieldKey: string;
  urlFieldKey: string;
  onInlineTextChange?: (targetId: string, value: string, fieldKey?: string) => void;
  className: string;
}) {
  if (!preview || !onInlineTextChange) {
    return <Link href={href || "#"} className={className}>{text}</Link>;
  }

  return (
    <span className="group/btn inline-flex items-center gap-2">
      <Link href={href || "#"} className={className} onClick={(event) => event.preventDefault()}>
        <span
          contentEditable
          suppressContentEditableWarning
          className="rounded px-1 focus:bg-white/20 focus:outline-none"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onBlur={(event) => {
            const nextValue = event.currentTarget.textContent ?? "";
            if (nextValue !== text) {
              onInlineTextChange(targetId, nextValue, textFieldKey);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        >
          {text}
        </span>
      </Link>
      <button
        type="button"
        className="rounded-full border border-slate-400/60 bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-100 opacity-0 transition group-hover/btn:opacity-100"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const next = window.prompt("Button URL", href || "") ?? href;
          if (next !== href) {
            onInlineTextChange(targetId, next, urlFieldKey);
          }
        }}
      >
        URL
      </button>
    </span>
  );
}

function InsertSectionControl({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
    >
      <Plus className="h-3.5 w-3.5" />
      Add Block Here
    </button>
  );
}

function EditableNode({
  children,
  preview,
  activeTargetId,
  onSelectElement,
  onReorderElement,
  tool,
  targetId,
  label,
  nested = false,
  draggableNode = false,
}: {
  children: React.ReactNode;
  preview: boolean;
  activeTargetId?: string;
  onSelectElement?: (selection: BuilderPreviewSelection) => void;
  onReorderElement?: (sourceTargetId: string, targetTargetId: string) => void;
  tool: BuilderPreviewSelection["tool"];
  targetId: string;
  label: string;
  nested?: boolean;
  draggableNode?: boolean;
}) {
  if (!preview || !onSelectElement) {
    return <>{children}</>;
  }

  const active = activeTargetId === targetId;
  const canReorder = preview && draggableNode && tool === "card" && Boolean(onReorderElement);

  function setDropState(element: HTMLDivElement | null, activeDrop: boolean) {
    if (!element) return;
    if (activeDrop) {
      element.dataset.dropActive = "true";
    } else {
      delete element.dataset.dropActive;
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={canReorder}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelectElement({ tool, targetId, label });
      }}
      onDragStart={(event) => {
        if (!canReorder) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/x-builder-target", targetId);
        event.currentTarget.dataset.dragSource = "true";
      }}
      onDragOver={(event) => {
        if (!canReorder) return;
        const sourceTargetId = event.dataTransfer.getData("application/x-builder-target");
        const sourceKind = sourceTargetId.split(":")[0];
        const targetKind = targetId.split(":")[0];
        if (!sourceTargetId || sourceKind !== targetKind || sourceTargetId === targetId) {
          setDropState(event.currentTarget as HTMLDivElement, false);
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropState(event.currentTarget as HTMLDivElement, true);
      }}
      onDragLeave={(event) => {
        if (!canReorder) return;
        setDropState(event.currentTarget as HTMLDivElement, false);
      }}
      onDrop={(event) => {
        if (!canReorder || !onReorderElement) return;
        event.preventDefault();
        event.stopPropagation();
        const sourceTargetId = event.dataTransfer.getData("application/x-builder-target");
        setDropState(event.currentTarget as HTMLDivElement, false);
        if (sourceTargetId && sourceTargetId !== targetId) {
          onReorderElement(sourceTargetId, targetId);
        }
      }}
      onDragEnd={(event) => {
        if (!canReorder) return;
        delete event.currentTarget.dataset.dragSource;
        setDropState(event.currentTarget as HTMLDivElement, false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelectElement({ tool, targetId, label });
        }
      }}
      className={`group relative data-[drop-active=true]:rounded-2xl data-[drop-active=true]:bg-brand-500/10 data-[drop-active=true]:ring-2 data-[drop-active=true]:ring-brand-400 ${nested ? "" : "my-1"}`}
    >
      {canReorder ? (
        <div className="pointer-events-none absolute inset-x-3 -top-2 z-20 hidden items-center justify-center rounded-full border border-brand-400 bg-brand-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white group-data-[drop-active=true]:flex">
          Drop To Reorder
        </div>
      ) : null}
      <div className={`pointer-events-none absolute inset-0 z-10 rounded-2xl border-2 border-dashed transition-opacity ${active ? "border-brand-400 opacity-100" : "border-brand-300/50 opacity-0 group-hover:opacity-100"}`} />
      <div className={`pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity ${active ? "border-brand-400/70 bg-slate-950/90 text-brand-100 opacity-100" : "border-slate-700 bg-slate-950/90 text-slate-200 opacity-0 group-hover:opacity-100"}`}>
        {label}
      </div>
      <div className={`pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-brand-400/70 bg-slate-950/90 px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </div>
      {canReorder ? (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200">
          <GripVertical className="h-3.5 w-3.5" /> Drag
        </div>
      ) : null}
      {children}
    </div>
  );
}
