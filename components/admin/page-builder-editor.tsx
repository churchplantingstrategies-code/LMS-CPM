"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CaseSensitive,
  GalleryVerticalEnd,
  GripVertical,
  Image as ImageIcon,
  ImagePlus,
  LayoutGrid,
  List,
  LucideIcon,
  Monitor,
  MousePointerClick,
  RotateCcw,
  RotateCw,
  Save,
  Send,
  Smartphone,
  Sparkles,
  SquareStack,
  Tablet,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  BuilderPageRenderer,
  type BuilderPreviewSelection,
} from "@/components/page-builder/builder-page-renderer";
import {
  BuilderFeatureIcon,
  BuilderPageRecord,
  BuilderPageSection,
  BuilderSectionType,
} from "@/types/page-builder";

type DeviceMode = "desktop" | "tablet" | "mobile";
type ElementTool =
  | "text"
  | "image"
  | "card"
  | "carousel"
  | "buttons"
  | "icon-list"
  | "icon"
  | "image-box"
  | "page";

type ApiPageResponse = {
  page: BuilderPageRecord;
};

type ElementTile = {
  id: ElementTool;
  label: string;
  Icon: LucideIcon;
};

const elementTiles: ElementTile[] = [
  { id: "text", label: "Text", Icon: CaseSensitive },
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "card", label: "Card", Icon: LayoutGrid },
  { id: "carousel", label: "Carousel", Icon: GalleryVerticalEnd },
  { id: "buttons", label: "Buttons", Icon: MousePointerClick },
  { id: "icon-list", label: "Icon List", Icon: List },
  { id: "icon", label: "Icon", Icon: Sparkles },
  { id: "image-box", label: "Image Box", Icon: ImagePlus },
  { id: "page", label: "Page", Icon: SquareStack },
];

const previewWidthClass: Record<DeviceMode, string> = {
  desktop: "w-full",
  tablet: "mx-auto w-[920px] max-w-full",
  mobile: "mx-auto w-[430px] max-w-full",
};

const featureIcons: BuilderFeatureIcon[] = ["BookOpen", "TrendingUp", "Users", "Zap", "Shield", "Award"];

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function reorderById<T extends { id: string }>(items: T[], sourceId: string, targetId: string) {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

function reorderTools(items: ElementTool[], source: ElementTool, target: ElementTool) {
  const sourceIndex = items.indexOf(source);
  const targetIndex = items.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

function parseTargetId(targetId: string) {
  const [kind, value] = targetId.split(":");
  return { kind, value };
}

function createNewSection() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: `section-${suffix}`,
    type: "TEXT" as BuilderSectionType,
    title: "New Block Title",
    content: "Add your content here.",
    imageUrl: "",
    buttonText: "",
    buttonUrl: "",
  };
}

export function PageBuilderEditor({ pageId }: { pageId: string }) {
  const [draft, setDraft] = useState<BuilderPageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [paletteOrder, setPaletteOrder] = useState<ElementTool[]>(elementTiles.map((tile) => tile.id));
  const [draggedPalette, setDraggedPalette] = useState<ElementTool | null>(null);
  const [dragOverPalette, setDragOverPalette] = useState<ElementTool | null>(null);
  const [selectedElement, setSelectedElement] = useState<BuilderPreviewSelection>({
    tool: "text",
    targetId: "hero-title",
    label: "Hero Title",
  });
  const lastSavedSnapshot = useRef<string>("");
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const historySnapshotRef = useRef<string>("");
  const suppressHistoryRef = useRef(false);
  const [historyTick, setHistoryTick] = useState(0);

  const draftSnapshot = useMemo(() => (draft ? JSON.stringify(draft) : ""), [draft]);
  const hasUnsavedChanges = Boolean(draft) && draftSnapshot !== lastSavedSnapshot.current;

  useEffect(() => {
    async function loadPage() {
      const response = await fetch(`/api/admin/page-builder/${pageId}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load page.");
      }

      const payload = (await response.json()) as ApiPageResponse;
      setDraft(payload.page);
      const snapshot = JSON.stringify(payload.page);
      lastSavedSnapshot.current = snapshot;
      historySnapshotRef.current = snapshot;
      undoStackRef.current = [];
      redoStackRef.current = [];
      setHistoryTick((tick) => tick + 1);
    }

    loadPage()
      .catch((error) => {
        toast({
          title: "Load failed",
          description: error instanceof Error ? error.message : "Unable to load page.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [pageId]);

  function updateDraft(next: Partial<BuilderPageRecord>) {
    if (!draft) return;
    setDraft({ ...draft, ...next });
  }

  function updateHero<K extends keyof BuilderPageRecord["hero"]>(key: K, value: BuilderPageRecord["hero"][K]) {
    if (!draft) return;
    setDraft({ ...draft, hero: { ...draft.hero, [key]: value } });
  }

  function updateLandingCopy<K extends keyof BuilderPageRecord["landingCopy"]>(key: K, value: BuilderPageRecord["landingCopy"][K]) {
    if (!draft) return;
    setDraft({ ...draft, landingCopy: { ...draft.landingCopy, [key]: value } });
  }

  function updateFinalCta<K extends keyof BuilderPageRecord["finalCta"]>(key: K, value: BuilderPageRecord["finalCta"][K]) {
    if (!draft) return;
    setDraft({ ...draft, finalCta: { ...draft.finalCta, [key]: value } });
  }

  function updateTheme<K extends keyof BuilderPageRecord["theme"]>(key: K, value: BuilderPageRecord["theme"][K]) {
    if (!draft) return;
    setDraft({ ...draft, theme: { ...draft.theme, [key]: value } });
  }

  function updateSection(sectionId: string, next: Partial<BuilderPageSection>) {
    if (!draft) return;
    setDraft({
      ...draft,
      sections: draft.sections.map((section) => (section.id === sectionId ? { ...section, ...next } : section)),
    });
  }

  async function persistPage(status?: BuilderPageRecord["status"], silent = false) {
    if (!draft) return null;

    try {
      const response = await fetch(`/api/admin/page-builder/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, status: status ?? draft.status }),
      });

      const payload = (await response.json()) as BuilderPageRecord | { error?: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Failed to save page.");
      }

      const snapshot = JSON.stringify(payload);
      suppressHistoryRef.current = true;
      setDraft(payload);
      lastSavedSnapshot.current = snapshot;
      historySnapshotRef.current = snapshot;
      window.setTimeout(() => {
        suppressHistoryRef.current = false;
      }, 0);

      if (!silent) {
        toast({
          title: status === "PUBLISHED" ? "Page published" : "Draft saved",
          description: status === "PUBLISHED" ? `${payload.path} is now live.` : `${payload.name} draft updated.`,
          variant: "success",
        });
      }

      return payload;
    } catch (error) {
      if (!silent) {
        toast({
          title: "Save failed",
          description: error instanceof Error ? error.message : "Unable to save page.",
          variant: "destructive",
        });
      }
      return null;
    }
  }

  async function savePage(status?: BuilderPageRecord["status"]) {
    if (!draft) return;
    setSaving(true);
    try {
      await persistPage(status, false);
    } finally {
      setSaving(false);
    }
  }

  async function deletePage() {
    if (!draft) return;
    const confirmed = window.confirm(`Delete ${draft.name}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/page-builder/${draft.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Failed to delete page.");
      }

      toast({
        title: "Page deleted",
        description: `${draft.name} has been removed.`,
        variant: "success",
      });

      window.close();
      window.location.href = "/admin/settings/page-builder";
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete page.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (!draft || !hasUnsavedChanges || saving || autoSaving || draft.status !== "DRAFT") {
      return;
    }

    const timeout = window.setTimeout(async () => {
      setAutoSaving(true);
      try {
        await persistPage("DRAFT", true);
      } finally {
        setAutoSaving(false);
      }
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [draft, hasUnsavedChanges, saving, autoSaving]);

  useEffect(() => {
    if (!draft || loading) return;

    if (!historySnapshotRef.current) {
      historySnapshotRef.current = draftSnapshot;
      return;
    }

    if (suppressHistoryRef.current || historySnapshotRef.current === draftSnapshot) {
      return;
    }

    undoStackRef.current = [...undoStackRef.current.slice(-59), historySnapshotRef.current];
    redoStackRef.current = [];
    historySnapshotRef.current = draftSnapshot;
    setHistoryTick((tick) => tick + 1);
  }, [draftSnapshot, draft, loading]);

  function undoChange() {
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    if (!previous || !draft) return;

    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current, JSON.stringify(draft)].slice(-60);
    suppressHistoryRef.current = true;
    const parsed = JSON.parse(previous) as BuilderPageRecord;
    setDraft(parsed);
    historySnapshotRef.current = previous;
    window.setTimeout(() => {
      suppressHistoryRef.current = false;
    }, 0);
    setHistoryTick((tick) => tick + 1);
  }

  function redoChange() {
    const next = redoStackRef.current[redoStackRef.current.length - 1];
    if (!next || !draft) return;

    redoStackRef.current = redoStackRef.current.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current, JSON.stringify(draft)].slice(-60);
    suppressHistoryRef.current = true;
    const parsed = JSON.parse(next) as BuilderPageRecord;
    setDraft(parsed);
    historySnapshotRef.current = next;
    window.setTimeout(() => {
      suppressHistoryRef.current = false;
    }, 0);
    setHistoryTick((tick) => tick + 1);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return;
      if ((event.key.toLowerCase() === "z" && !event.shiftKey) || event.key.toLowerCase() === "y") {
        event.preventDefault();
        undoChange();
      }
      if (event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        redoChange();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [draft]);

  function handlePaletteDrop(target: ElementTool) {
    if (!draggedPalette || draggedPalette === target) {
      setDraggedPalette(null);
      setDragOverPalette(null);
      return;
    }

    setPaletteOrder((current) => reorderTools(current, draggedPalette, target));
    setDraggedPalette(null);
    setDragOverPalette(null);
  }

  function handleInlineTextChange(targetId: string, value: string, fieldKey?: string) {
    if (!draft) return;

    const { kind, value: targetValue } = parseTargetId(targetId);

    if (targetId === "hero-badge") return updateLandingCopy("heroBadge", value);
    if (targetId === "hero-title") return updateHero("title", value);
    if (targetId === "hero-subtitle") return updateHero("subtitle", value);
    if (targetId === "hero-footnote") return updateLandingCopy("heroFootnote", value);

    if (targetId === "features-heading") {
      if (fieldKey === "badge") return updateLandingCopy("featuresBadge", value);
      if (fieldKey === "title") return updateLandingCopy("featuresTitle", value);
      if (fieldKey === "description") return updateLandingCopy("featuresDescription", value);
    }

    if (targetId === "steps-heading") {
      if (fieldKey === "badge") return updateLandingCopy("stepsBadge", value);
      if (fieldKey === "title") return updateLandingCopy("stepsTitle", value);
    }

    if (targetId === "books-heading") {
      if (fieldKey === "badge") return updateLandingCopy("booksBadge", value);
      if (fieldKey === "title") return updateLandingCopy("booksTitle", value);
      if (fieldKey === "description") return updateLandingCopy("booksDescription", value);
    }

    if (targetId === "books-panel") {
      if (fieldKey === "eyebrow") return updateLandingCopy("booksPanelEyebrow", value);
      if (fieldKey === "title") return updateLandingCopy("booksPanelTitle", value);
      if (fieldKey === "description") return updateLandingCopy("booksPanelDescription", value);
    }

    if (targetId === "testimonials-heading") {
      if (fieldKey === "badge") return updateLandingCopy("testimonialsBadge", value);
      if (fieldKey === "title") return updateLandingCopy("testimonialsTitle", value);
    }

    if (targetId === "pricing-heading") {
      if (fieldKey === "badge") return updateLandingCopy("pricingBadge", value);
      if (fieldKey === "title") return updateLandingCopy("pricingTitle", value);
      if (fieldKey === "description") return updateLandingCopy("pricingDescription", value);
      if (fieldKey === "popularLabel") return updateLandingCopy("pricingPopularLabel", value);
    }

    if (targetId === "final-cta-text") {
      if (fieldKey === "badge") return updateFinalCta("badge", value);
      if (fieldKey === "title") return updateFinalCta("title", value);
      if (fieldKey === "description") return updateFinalCta("description", value);
      if (fieldKey === "footnote") return updateFinalCta("footnote", value);
    }

    if (targetId === "hero-buttons") {
      if (fieldKey === "primaryText") return updateHero("primaryButtonText", value);
      if (fieldKey === "primaryUrl") return updateHero("primaryButtonUrl", value);
      if (fieldKey === "secondaryText") return updateHero("secondaryButtonText", value);
      if (fieldKey === "secondaryUrl") return updateHero("secondaryButtonUrl", value);
    }

    if (targetId === "books-buttons") {
      if (fieldKey === "primaryText") return updateLandingCopy("booksPrimaryButtonText", value);
      if (fieldKey === "primaryUrl") return updateLandingCopy("booksPrimaryButtonUrl", value);
      if (fieldKey === "secondaryText") return updateLandingCopy("booksSecondaryButtonText", value);
      if (fieldKey === "secondaryUrl") return updateLandingCopy("booksSecondaryButtonUrl", value);
    }

    if (targetId === "final-cta-buttons") {
      if (fieldKey === "primaryText") return updateFinalCta("primaryButtonText", value);
      if (fieldKey === "primaryUrl") return updateFinalCta("primaryButtonUrl", value);
      if (fieldKey === "secondaryText") return updateFinalCta("secondaryButtonText", value);
      if (fieldKey === "secondaryUrl") return updateFinalCta("secondaryButtonUrl", value);
    }

    if (kind === "stat") {
      setDraft({
        ...draft,
        stats: draft.stats.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                value: fieldKey === "value" ? value : item.value,
                label: fieldKey === "label" ? value : item.label,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "feature") {
      setDraft({
        ...draft,
        features: draft.features.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                title: fieldKey === "title" ? value : item.title,
                description: fieldKey === "description" ? value : item.description,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "step") {
      setDraft({
        ...draft,
        steps: draft.steps.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                title: fieldKey === "title" ? value : item.title,
                description: fieldKey === "description" ? value : item.description,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "testimonial") {
      setDraft({
        ...draft,
        testimonials: draft.testimonials.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                quote: fieldKey === "quote" ? value : item.quote,
                name: fieldKey === "name" ? value : item.name,
                role: fieldKey === "role" ? value : item.role,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "plan") {
      setDraft({
        ...draft,
        plans: draft.plans.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                name: fieldKey === "name" ? value : item.name,
                price: fieldKey === "price" ? value : item.price,
                interval: fieldKey === "interval" ? value : item.interval,
                description: fieldKey === "description" ? value : item.description,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "section") {
      setDraft({
        ...draft,
        sections: draft.sections.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                title: fieldKey === "title" ? value : item.title,
                content: fieldKey === "content" ? value : item.content,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "section-button") {
      setDraft({
        ...draft,
        sections: draft.sections.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                buttonText: fieldKey === "text" ? value : item.buttonText,
                buttonUrl: fieldKey === "url" ? value : item.buttonUrl,
              }
            : item,
        ),
      });
      return;
    }

    if (kind === "plan-cta") {
      setDraft({
        ...draft,
        plans: draft.plans.map((item) =>
          item.id === targetValue
            ? {
                ...item,
                ctaText: fieldKey === "text" ? value : item.ctaText,
                ctaUrl: fieldKey === "url" ? value : item.ctaUrl,
              }
            : item,
        ),
      });
    }
  }

  function handleCanvasReorder(sourceTargetId: string, targetTargetId: string) {
    if (!draft) return;

    const source = parseTargetId(sourceTargetId);
    const target = parseTargetId(targetTargetId);
    if (!source.kind || !target.kind || source.kind !== target.kind || !source.value || !target.value) {
      return;
    }

    switch (source.kind) {
      case "stat":
        setDraft({ ...draft, stats: reorderById(draft.stats, source.value, target.value) });
        break;
      case "feature":
        setDraft({ ...draft, features: reorderById(draft.features, source.value, target.value) });
        break;
      case "step":
        setDraft({ ...draft, steps: reorderById(draft.steps, source.value, target.value) });
        break;
      case "testimonial":
        setDraft({ ...draft, testimonials: reorderById(draft.testimonials, source.value, target.value) });
        break;
      case "plan":
        setDraft({ ...draft, plans: reorderById(draft.plans, source.value, target.value) });
        break;
      case "section":
        setDraft({ ...draft, sections: reorderById(draft.sections, source.value, target.value) });
        break;
      default:
        break;
    }
  }

  function insertSectionAt(index: number) {
    if (!draft) return;
    const nextSection = createNewSection();
    const nextSections = [...draft.sections];
    const safeIndex = Math.max(0, Math.min(index, nextSections.length));
    nextSections.splice(safeIndex, 0, nextSection);

    setDraft({ ...draft, sections: nextSections });
    setSelectedElement({
      tool: "card",
      targetId: `section:${nextSection.id}`,
      label: "Extra Block Card",
    });
  }

  function paletteMeta(tool: ElementTool) {
    if (!draft) return "ELEMENT";
    switch (tool) {
      case "text":
        return "COPY";
      case "image":
        return "MEDIA";
      case "card":
        return `${draft.stats.length + draft.features.length + draft.steps.length + draft.testimonials.length + draft.plans.length + draft.sections.length} ITEMS`;
      case "carousel":
        return "BOOKS";
      case "buttons":
        return "CTA";
      case "icon-list":
        return `${draft.plans.length} LISTS`;
      case "icon":
        return `${draft.features.length} ICONS`;
      case "image-box":
        return "PANELS";
      case "page":
        return "SEO";
      default:
        return "ELEMENT";
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading editor...</p>;
  }

  if (!draft) {
    return <p className="text-sm text-slate-400">Page not found.</p>;
  }

  const palette = paletteOrder.map((id) => elementTiles.find((tile) => tile.id === id)).filter(Boolean) as ElementTile[];

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
      <aside className="w-[360px] shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-900/90">
        <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 p-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Elements</p>
          <h2 className="mt-1 text-lg font-bold text-slate-100">{draft.name}</h2>
          <p className="mt-1 text-xs text-slate-400">Click anything on the page preview to edit text, images, buttons, cards, or lists.</p>
        </div>

        <div className="space-y-5 p-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="grid grid-cols-2 gap-2">
              {palette.map((tile) => {
                const active = selectedElement.tool === tile.id;
                const Icon = tile.Icon;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    draggable
                    onClick={() => setSelectedElement((current) => ({ ...current, tool: tile.id }))}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", tile.id);
                      setDraggedPalette(tile.id);
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDragOverPalette(tile.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      handlePaletteDrop(tile.id);
                    }}
                    onDragEnd={() => {
                      setDraggedPalette(null);
                      setDragOverPalette(null);
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                      active
                        ? "border-brand-400 bg-gradient-to-br from-brand-500/15 to-cyan-500/10 text-brand-100 shadow-[0_0_0_1px_rgba(96,165,250,0.18)]"
                        : dragOverPalette === tile.id
                          ? "border-brand-400 bg-brand-500/10 text-slate-100"
                          : "border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-200 hover:border-slate-600 hover:from-slate-900 hover:to-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                          active
                            ? "border-brand-400/40 bg-brand-400/10 text-brand-100"
                            : "border-slate-700 bg-slate-900/90 text-slate-300"
                        }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{tile.label}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{paletteMeta(tile.id)}</p>
                        </div>
                      </div>
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected Element</p>
            <h3 className="mt-2 text-base font-semibold text-slate-100">{selectedElement.label}</h3>
            <p className="mt-1 text-sm text-slate-400">{selectedElement.targetId}</p>
          </section>

          <ElementInspector
            draft={draft}
            selectedElement={selectedElement}
            updateDraft={updateDraft}
            updateHero={updateHero}
            updateLandingCopy={updateLandingCopy}
            updateFinalCta={updateFinalCta}
            updateTheme={updateTheme}
            updateSection={updateSection}
            setDraft={setDraft}
          />
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-40"
              onClick={undoChange}
              disabled={undoStackRef.current.length === 0}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Undo
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-40"
              onClick={redoChange}
              disabled={redoStackRef.current.length === 0}
              title="Redo (Ctrl+Shift+Z)"
            >
              <RotateCw className="mr-2 h-4 w-4" /> Redo
            </Button>
            <Button variant={device === "desktop" ? "brand" : "outline"} className={device === "desktop" ? "" : "border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"} onClick={() => setDevice("desktop")}>
              <Monitor className="mr-2 h-4 w-4" /> Desktop
            </Button>
            <Button variant={device === "tablet" ? "brand" : "outline"} className={device === "tablet" ? "" : "border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"} onClick={() => setDevice("tablet")}>
              <Tablet className="mr-2 h-4 w-4" /> Tablet
            </Button>
            <Button variant={device === "mobile" ? "brand" : "outline"} className={device === "mobile" ? "" : "border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"} onClick={() => setDevice("mobile")}>
              <Smartphone className="mr-2 h-4 w-4" /> Mobile
            </Button>
            <Button variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800" asChild>
              <Link href={draft.path} target="_blank">Preview Live</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">History {undoStackRef.current.length}/{redoStackRef.current.length}</span>
            <span className="hidden">{historyTick}</span>
            <span className={`${hasUnsavedChanges ? "text-amber-300" : "text-emerald-300"}`}>
              {saving ? "Saving..." : autoSaving ? "Autosaving..." : hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#0a0f1d] p-3 pb-24 sm:p-4 sm:pb-28">
          <div className={`${previewWidthClass[device]} mx-auto transition-all duration-200`}>
            <BuilderPageRenderer
              page={draft}
              preview
              previewDevice={device}
              activeTargetId={selectedElement.targetId}
              onSelectElement={setSelectedElement}
              onInlineTextChange={handleInlineTextChange}
              onReorderElement={handleCanvasReorder}
              onInsertSectionAt={insertSectionAt}
            />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-slate-800 bg-slate-900/95 px-3 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">Status: {draft.status}</span>
              <span className="text-slate-400">Element: {selectedElement.label}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800" onClick={() => void savePage("DRAFT")} loading={saving || autoSaving}>
                <Save className="mr-2 h-4 w-4" /> Save Draft
              </Button>
              <Button variant="brand" onClick={() => void savePage("PUBLISHED")} loading={saving}>
                <Send className="mr-2 h-4 w-4" /> Publish
              </Button>
              <Button variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800" onClick={() => void deletePage()}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ElementInspector({
  draft,
  selectedElement,
  updateDraft,
  updateHero,
  updateLandingCopy,
  updateFinalCta,
  updateTheme,
  updateSection,
  setDraft,
}: {
  draft: BuilderPageRecord;
  selectedElement: BuilderPreviewSelection;
  updateDraft: (next: Partial<BuilderPageRecord>) => void;
  updateHero: <K extends keyof BuilderPageRecord["hero"]>(key: K, value: BuilderPageRecord["hero"][K]) => void;
  updateLandingCopy: <K extends keyof BuilderPageRecord["landingCopy"]>(key: K, value: BuilderPageRecord["landingCopy"][K]) => void;
  updateFinalCta: <K extends keyof BuilderPageRecord["finalCta"]>(key: K, value: BuilderPageRecord["finalCta"][K]) => void;
  updateTheme: <K extends keyof BuilderPageRecord["theme"]>(key: K, value: BuilderPageRecord["theme"][K]) => void;
  updateSection: (sectionId: string, next: Partial<BuilderPageSection>) => void;
  setDraft: (next: BuilderPageRecord | ((current: BuilderPageRecord | null) => BuilderPageRecord | null)) => void;
}) {
  const { kind, value } = parseTargetId(selectedElement.targetId);

  if (selectedElement.tool === "page") {
    return (
      <Panel title="Page Settings">
        <Field label="Page Name"><input className={inputClass} value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} /></Field>
        <Field label="Assigned URL"><input className={inputClass} value={draft.path} onChange={(event) => updateDraft({ path: event.target.value })} /></Field>
        <Field label="SEO Title"><input className={inputClass} value={draft.seoTitle} onChange={(event) => updateDraft({ seoTitle: event.target.value })} /></Field>
        <Field label="SEO Description"><textarea className={areaClass} rows={3} value={draft.seoDescription} onChange={(event) => updateDraft({ seoDescription: event.target.value })} /></Field>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Typography</p>
          <Field label="Body Font Family"><input className={inputClass} value={draft.theme.bodyFontFamily} onChange={(event) => updateTheme("bodyFontFamily", event.target.value)} placeholder="'DM Sans', sans-serif" /></Field>
          <Field label="Heading Font Family"><input className={inputClass} value={draft.theme.headingFontFamily} onChange={(event) => updateTheme("headingFontFamily", event.target.value)} placeholder="'Space Grotesk', sans-serif" /></Field>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Colors</p>
          <ColorField label="Page Background" value={draft.theme.pageBackgroundColor} onChange={(value) => updateTheme("pageBackgroundColor", value)} />
          <ColorField label="Section Background" value={draft.theme.sectionBackgroundColor} onChange={(value) => updateTheme("sectionBackgroundColor", value)} />
          <ColorField label="Card Background" value={draft.theme.cardBackgroundColor} onChange={(value) => updateTheme("cardBackgroundColor", value)} />
          <ColorField label="Body Text" value={draft.theme.textColor} onChange={(value) => updateTheme("textColor", value)} />
          <ColorField label="Heading Text" value={draft.theme.headingColor} onChange={(value) => updateTheme("headingColor", value)} />
          <ColorField label="Accent" value={draft.theme.accentColor} onChange={(value) => updateTheme("accentColor", value)} />
        </div>
      </Panel>
    );
  }

  if (selectedElement.tool === "text") {
    if (selectedElement.targetId === "hero-badge") return <SingleTextPanel title="Hero Badge" value={draft.landingCopy.heroBadge} onChange={(value) => updateLandingCopy("heroBadge", value)} />;
    if (selectedElement.targetId === "hero-title") return <SingleTextPanel title="Hero Title" value={draft.hero.title} onChange={(value) => updateHero("title", value)} />;
    if (selectedElement.targetId === "hero-subtitle") return <SingleTextPanel title="Hero Subtitle" value={draft.hero.subtitle} multiline onChange={(value) => updateHero("subtitle", value)} />;
    if (selectedElement.targetId === "hero-footnote") return <SingleTextPanel title="Hero Footnote" value={draft.landingCopy.heroFootnote} onChange={(value) => updateLandingCopy("heroFootnote", value)} />;
    if (selectedElement.targetId === "features-heading") {
      return (
        <Panel title="Features Heading">
          <Field label="Badge"><input className={inputClass} value={draft.landingCopy.featuresBadge} onChange={(event) => updateLandingCopy("featuresBadge", event.target.value)} /></Field>
          <Field label="Title"><input className={inputClass} value={draft.landingCopy.featuresTitle} onChange={(event) => updateLandingCopy("featuresTitle", event.target.value)} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={3} value={draft.landingCopy.featuresDescription} onChange={(event) => updateLandingCopy("featuresDescription", event.target.value)} /></Field>
        </Panel>
      );
    }
    if (selectedElement.targetId === "steps-heading") {
      return (
        <Panel title="Steps Heading">
          <Field label="Badge"><input className={inputClass} value={draft.landingCopy.stepsBadge} onChange={(event) => updateLandingCopy("stepsBadge", event.target.value)} /></Field>
          <Field label="Title"><input className={inputClass} value={draft.landingCopy.stepsTitle} onChange={(event) => updateLandingCopy("stepsTitle", event.target.value)} /></Field>
        </Panel>
      );
    }
    if (selectedElement.targetId === "books-heading") {
      return (
        <Panel title="Books Heading">
          <Field label="Badge"><input className={inputClass} value={draft.landingCopy.booksBadge} onChange={(event) => updateLandingCopy("booksBadge", event.target.value)} /></Field>
          <Field label="Title"><textarea className={areaClass} rows={3} value={draft.landingCopy.booksTitle} onChange={(event) => updateLandingCopy("booksTitle", event.target.value)} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={4} value={draft.landingCopy.booksDescription} onChange={(event) => updateLandingCopy("booksDescription", event.target.value)} /></Field>
        </Panel>
      );
    }
    if (selectedElement.targetId === "testimonials-heading") {
      return (
        <Panel title="Testimonials Heading">
          <Field label="Badge"><input className={inputClass} value={draft.landingCopy.testimonialsBadge} onChange={(event) => updateLandingCopy("testimonialsBadge", event.target.value)} /></Field>
          <Field label="Title"><input className={inputClass} value={draft.landingCopy.testimonialsTitle} onChange={(event) => updateLandingCopy("testimonialsTitle", event.target.value)} /></Field>
        </Panel>
      );
    }
    if (selectedElement.targetId === "pricing-heading") {
      return (
        <Panel title="Pricing Heading">
          <Field label="Badge"><input className={inputClass} value={draft.landingCopy.pricingBadge} onChange={(event) => updateLandingCopy("pricingBadge", event.target.value)} /></Field>
          <Field label="Title"><input className={inputClass} value={draft.landingCopy.pricingTitle} onChange={(event) => updateLandingCopy("pricingTitle", event.target.value)} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={3} value={draft.landingCopy.pricingDescription} onChange={(event) => updateLandingCopy("pricingDescription", event.target.value)} /></Field>
          <Field label="Popular Label"><input className={inputClass} value={draft.landingCopy.pricingPopularLabel} onChange={(event) => updateLandingCopy("pricingPopularLabel", event.target.value)} /></Field>
        </Panel>
      );
    }
    if (selectedElement.targetId === "final-cta-text") {
      return (
        <Panel title="Final CTA Text">
          <Field label="Badge"><input className={inputClass} value={draft.finalCta.badge} onChange={(event) => updateFinalCta("badge", event.target.value)} /></Field>
          <Field label="Title"><input className={inputClass} value={draft.finalCta.title} onChange={(event) => updateFinalCta("title", event.target.value)} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={3} value={draft.finalCta.description} onChange={(event) => updateFinalCta("description", event.target.value)} /></Field>
          <Field label="Footnote"><input className={inputClass} value={draft.finalCta.footnote} onChange={(event) => updateFinalCta("footnote", event.target.value)} /></Field>
        </Panel>
      );
    }
    return <EmptyInspector text="Click a text element on the preview to edit it." />;
  }

  if (selectedElement.tool === "image") {
    if (selectedElement.targetId === "hero-image") {
      return (
        <Panel title="Hero Image">
          <Field label="Image URL"><input className={inputClass} value={draft.hero.imageUrl} onChange={(event) => updateHero("imageUrl", event.target.value)} /></Field>
        </Panel>
      );
    }

    if (kind === "section-image") {
      const section = draft.sections.find((item) => item.id === value);
      if (!section) return <EmptyInspector text="Image not found." />;
      return (
        <Panel title="Section Image">
          <Field label="Image URL"><input className={inputClass} value={section.imageUrl} onChange={(event) => updateSection(section.id, { imageUrl: event.target.value })} /></Field>
        </Panel>
      );
    }

    return <EmptyInspector text="Click an image on the preview to edit it." />;
  }

  if (selectedElement.tool === "buttons") {
    if (selectedElement.targetId === "hero-buttons") {
      return (
        <Panel title="Hero Buttons">
          <Field label="Primary Text"><input className={inputClass} value={draft.hero.primaryButtonText} onChange={(event) => updateHero("primaryButtonText", event.target.value)} /></Field>
          <Field label="Primary URL"><input className={inputClass} value={draft.hero.primaryButtonUrl} onChange={(event) => updateHero("primaryButtonUrl", event.target.value)} /></Field>
          <Field label="Secondary Text"><input className={inputClass} value={draft.hero.secondaryButtonText} onChange={(event) => updateHero("secondaryButtonText", event.target.value)} /></Field>
          <Field label="Secondary URL"><input className={inputClass} value={draft.hero.secondaryButtonUrl} onChange={(event) => updateHero("secondaryButtonUrl", event.target.value)} /></Field>
        </Panel>
      );
    }

    if (selectedElement.targetId === "books-buttons") {
      return (
        <Panel title="Books Buttons">
          <Field label="Primary Text"><input className={inputClass} value={draft.landingCopy.booksPrimaryButtonText} onChange={(event) => updateLandingCopy("booksPrimaryButtonText", event.target.value)} /></Field>
          <Field label="Primary URL"><input className={inputClass} value={draft.landingCopy.booksPrimaryButtonUrl} onChange={(event) => updateLandingCopy("booksPrimaryButtonUrl", event.target.value)} /></Field>
          <Field label="Secondary Text"><input className={inputClass} value={draft.landingCopy.booksSecondaryButtonText} onChange={(event) => updateLandingCopy("booksSecondaryButtonText", event.target.value)} /></Field>
          <Field label="Secondary URL"><input className={inputClass} value={draft.landingCopy.booksSecondaryButtonUrl} onChange={(event) => updateLandingCopy("booksSecondaryButtonUrl", event.target.value)} /></Field>
        </Panel>
      );
    }

    if (selectedElement.targetId === "final-cta-buttons") {
      return (
        <Panel title="Final CTA Buttons">
          <Field label="Primary Text"><input className={inputClass} value={draft.finalCta.primaryButtonText} onChange={(event) => updateFinalCta("primaryButtonText", event.target.value)} /></Field>
          <Field label="Primary URL"><input className={inputClass} value={draft.finalCta.primaryButtonUrl} onChange={(event) => updateFinalCta("primaryButtonUrl", event.target.value)} /></Field>
          <Field label="Secondary Text"><input className={inputClass} value={draft.finalCta.secondaryButtonText} onChange={(event) => updateFinalCta("secondaryButtonText", event.target.value)} /></Field>
          <Field label="Secondary URL"><input className={inputClass} value={draft.finalCta.secondaryButtonUrl} onChange={(event) => updateFinalCta("secondaryButtonUrl", event.target.value)} /></Field>
        </Panel>
      );
    }

    if (kind === "section-button") {
      const section = draft.sections.find((item) => item.id === value);
      if (!section) return <EmptyInspector text="Button not found." />;
      return (
        <Panel title="Section Button">
          <Field label="Text"><input className={inputClass} value={section.buttonText} onChange={(event) => updateSection(section.id, { buttonText: event.target.value })} /></Field>
          <Field label="URL"><input className={inputClass} value={section.buttonUrl} onChange={(event) => updateSection(section.id, { buttonUrl: event.target.value })} /></Field>
        </Panel>
      );
    }

    if (kind === "plan-cta") {
      const plan = draft.plans.find((item) => item.id === value);
      if (!plan) return <EmptyInspector text="Button not found." />;
      return (
        <Panel title="Plan CTA Button">
          <Field label="Text"><input className={inputClass} value={plan.ctaText} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((item) => (item.id === plan.id ? { ...item, ctaText: event.target.value } : item)) })} /></Field>
          <Field label="URL"><input className={inputClass} value={plan.ctaUrl} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((item) => (item.id === plan.id ? { ...item, ctaUrl: event.target.value } : item)) })} /></Field>
        </Panel>
      );
    }

    return <EmptyInspector text="Click a button group on the preview to edit it." />;
  }

  if (selectedElement.tool === "carousel") {
    return (
      <Panel title="Carousel">
        <p className="text-sm text-slate-400">The bookstore carousel uses live published books from the Books module. Publish or unpublish books there to change the carousel items.</p>
      </Panel>
    );
  }

  if (selectedElement.tool === "icon") {
    if (kind === "feature-icon") {
      const feature = draft.features.find((item) => item.id === value);
      if (!feature) return <EmptyInspector text="Icon not found." />;
      return (
        <Panel title="Feature Icon">
          <Field label="Icon">
            <select className={inputClass} value={feature.icon} onChange={(event) => setDraft({ ...draft, features: draft.features.map((item) => (item.id === feature.id ? { ...item, icon: event.target.value as BuilderFeatureIcon } : item)) })}>
              {featureIcons.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </Field>
        </Panel>
      );
    }
    return <EmptyInspector text="Click a feature icon on the preview to edit it." />;
  }

  if (selectedElement.tool === "icon-list") {
    if (kind === "plan-features") {
      const plan = draft.plans.find((item) => item.id === value);
      if (!plan) return <EmptyInspector text="Icon list not found." />;
      return (
        <Panel title="Plan Feature List">
          <Field label="Items (one per line)"><textarea className={areaClass} rows={6} value={plan.features} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((item) => (item.id === plan.id ? { ...item, features: event.target.value } : item)) })} /></Field>
        </Panel>
      );
    }
    return <EmptyInspector text="Click a list on the preview to edit its items." />;
  }

  if (selectedElement.tool === "image-box") {
    if (selectedElement.targetId === "books-panel") {
      return (
        <Panel title="Books Info Box">
          <Field label="Eyebrow"><input className={inputClass} value={draft.landingCopy.booksPanelEyebrow} onChange={(event) => updateLandingCopy("booksPanelEyebrow", event.target.value)} /></Field>
          <Field label="Title"><input className={inputClass} value={draft.landingCopy.booksPanelTitle} onChange={(event) => updateLandingCopy("booksPanelTitle", event.target.value)} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={3} value={draft.landingCopy.booksPanelDescription} onChange={(event) => updateLandingCopy("booksPanelDescription", event.target.value)} /></Field>
        </Panel>
      );
    }

    if (kind === "section-box") {
      const section = draft.sections.find((item) => item.id === value);
      if (!section) return <EmptyInspector text="Image box not found." />;
      return (
        <Panel title="Image Box">
          <Field label="Title"><input className={inputClass} value={section.title} onChange={(event) => updateSection(section.id, { title: event.target.value })} /></Field>
          <Field label="Content"><textarea className={areaClass} rows={4} value={section.content} onChange={(event) => updateSection(section.id, { content: event.target.value })} /></Field>
          <Field label="Image URL"><input className={inputClass} value={section.imageUrl} onChange={(event) => updateSection(section.id, { imageUrl: event.target.value })} /></Field>
          <Field label="Button Text"><input className={inputClass} value={section.buttonText} onChange={(event) => updateSection(section.id, { buttonText: event.target.value })} /></Field>
          <Field label="Button URL"><input className={inputClass} value={section.buttonUrl} onChange={(event) => updateSection(section.id, { buttonUrl: event.target.value })} /></Field>
        </Panel>
      );
    }

    return <EmptyInspector text="Click a panel or image box on the preview to edit it." />;
  }

  if (selectedElement.tool === "card") {
    if (kind === "stat") {
      const index = draft.stats.findIndex((item) => item.id === value);
      const item = draft.stats[index];
      if (!item) return <EmptyInspector text="Card not found." />;
      return (
        <Panel title="Stat Card">
          <CardActions
            onMoveUp={() => setDraft({ ...draft, stats: moveItem(draft.stats, index, -1) })}
            onMoveDown={() => setDraft({ ...draft, stats: moveItem(draft.stats, index, 1) })}
            disableMoveUp={index === 0}
            disableMoveDown={index === draft.stats.length - 1}
            onDelete={() => setDraft({ ...draft, stats: draft.stats.filter((entry) => entry.id !== item.id) })}
          />
          <Field label="Value"><input className={inputClass} value={item.value} onChange={(event) => setDraft({ ...draft, stats: draft.stats.map((entry) => (entry.id === item.id ? { ...entry, value: event.target.value } : entry)) })} /></Field>
          <Field label="Label"><input className={inputClass} value={item.label} onChange={(event) => setDraft({ ...draft, stats: draft.stats.map((entry) => (entry.id === item.id ? { ...entry, label: event.target.value } : entry)) })} /></Field>
        </Panel>
      );
    }

    if (kind === "feature") {
      const index = draft.features.findIndex((item) => item.id === value);
      const item = draft.features[index];
      if (!item) return <EmptyInspector text="Card not found." />;
      return (
        <Panel title="Feature Card">
          <CardActions
            onMoveUp={() => setDraft({ ...draft, features: moveItem(draft.features, index, -1) })}
            onMoveDown={() => setDraft({ ...draft, features: moveItem(draft.features, index, 1) })}
            disableMoveUp={index === 0}
            disableMoveDown={index === draft.features.length - 1}
            onDelete={() => setDraft({ ...draft, features: draft.features.filter((entry) => entry.id !== item.id) })}
          />
          <Field label="Title"><input className={inputClass} value={item.title} onChange={(event) => setDraft({ ...draft, features: draft.features.map((entry) => (entry.id === item.id ? { ...entry, title: event.target.value } : entry)) })} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={3} value={item.description} onChange={(event) => setDraft({ ...draft, features: draft.features.map((entry) => (entry.id === item.id ? { ...entry, description: event.target.value } : entry)) })} /></Field>
        </Panel>
      );
    }

    if (kind === "step") {
      const index = draft.steps.findIndex((item) => item.id === value);
      const item = draft.steps[index];
      if (!item) return <EmptyInspector text="Card not found." />;
      return (
        <Panel title="Step Card">
          <CardActions
            onMoveUp={() => setDraft({ ...draft, steps: moveItem(draft.steps, index, -1) })}
            onMoveDown={() => setDraft({ ...draft, steps: moveItem(draft.steps, index, 1) })}
            disableMoveUp={index === 0}
            disableMoveDown={index === draft.steps.length - 1}
            onDelete={() => setDraft({ ...draft, steps: draft.steps.filter((entry) => entry.id !== item.id) })}
          />
          <Field label="Title"><input className={inputClass} value={item.title} onChange={(event) => setDraft({ ...draft, steps: draft.steps.map((entry) => (entry.id === item.id ? { ...entry, title: event.target.value } : entry)) })} /></Field>
          <Field label="Description"><textarea className={areaClass} rows={3} value={item.description} onChange={(event) => setDraft({ ...draft, steps: draft.steps.map((entry) => (entry.id === item.id ? { ...entry, description: event.target.value } : entry)) })} /></Field>
        </Panel>
      );
    }

    if (kind === "testimonial") {
      const index = draft.testimonials.findIndex((item) => item.id === value);
      const item = draft.testimonials[index];
      if (!item) return <EmptyInspector text="Card not found." />;
      return (
        <Panel title="Testimonial Card">
          <CardActions
            onMoveUp={() => setDraft({ ...draft, testimonials: moveItem(draft.testimonials, index, -1) })}
            onMoveDown={() => setDraft({ ...draft, testimonials: moveItem(draft.testimonials, index, 1) })}
            disableMoveUp={index === 0}
            disableMoveDown={index === draft.testimonials.length - 1}
            onDelete={() => setDraft({ ...draft, testimonials: draft.testimonials.filter((entry) => entry.id !== item.id) })}
          />
          <Field label="Name"><input className={inputClass} value={item.name} onChange={(event) => setDraft({ ...draft, testimonials: draft.testimonials.map((entry) => (entry.id === item.id ? { ...entry, name: event.target.value } : entry)) })} /></Field>
          <Field label="Role"><input className={inputClass} value={item.role} onChange={(event) => setDraft({ ...draft, testimonials: draft.testimonials.map((entry) => (entry.id === item.id ? { ...entry, role: event.target.value } : entry)) })} /></Field>
          <Field label="Quote"><textarea className={areaClass} rows={4} value={item.quote} onChange={(event) => setDraft({ ...draft, testimonials: draft.testimonials.map((entry) => (entry.id === item.id ? { ...entry, quote: event.target.value } : entry)) })} /></Field>
        </Panel>
      );
    }

    if (kind === "plan") {
      const index = draft.plans.findIndex((item) => item.id === value);
      const item = draft.plans[index];
      if (!item) return <EmptyInspector text="Card not found." />;
      return (
        <Panel title="Plan Card">
          <CardActions
            onMoveUp={() => setDraft({ ...draft, plans: moveItem(draft.plans, index, -1) })}
            onMoveDown={() => setDraft({ ...draft, plans: moveItem(draft.plans, index, 1) })}
            disableMoveUp={index === 0}
            disableMoveDown={index === draft.plans.length - 1}
            onDelete={() => setDraft({ ...draft, plans: draft.plans.filter((entry) => entry.id !== item.id) })}
          />
          <Field label="Plan Name"><input className={inputClass} value={item.name} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((entry) => (entry.id === item.id ? { ...entry, name: event.target.value } : entry)) })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Price"><input className={inputClass} value={item.price} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((entry) => (entry.id === item.id ? { ...entry, price: event.target.value } : entry)) })} /></Field>
            <Field label="Interval"><input className={inputClass} value={item.interval} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((entry) => (entry.id === item.id ? { ...entry, interval: event.target.value } : entry)) })} /></Field>
          </div>
          <Field label="Description"><textarea className={areaClass} rows={3} value={item.description} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((entry) => (entry.id === item.id ? { ...entry, description: event.target.value } : entry)) })} /></Field>
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={item.highlighted} onChange={(event) => setDraft({ ...draft, plans: draft.plans.map((entry) => (entry.id === item.id ? { ...entry, highlighted: event.target.checked } : entry)) })} />
            Highlight plan
          </label>
        </Panel>
      );
    }

    if (kind === "section") {
      const index = draft.sections.findIndex((item) => item.id === value);
      const item = draft.sections[index];
      if (!item) return <EmptyInspector text="Card not found." />;
      return (
        <Panel title="Extra Block Card">
          <CardActions
            onMoveUp={() => setDraft({ ...draft, sections: moveItem(draft.sections, index, -1) })}
            onMoveDown={() => setDraft({ ...draft, sections: moveItem(draft.sections, index, 1) })}
            disableMoveUp={index === 0}
            disableMoveDown={index === draft.sections.length - 1}
            onDelete={() => setDraft({ ...draft, sections: draft.sections.filter((entry) => entry.id !== item.id) })}
          />
          <Field label="Type">
            <select className={inputClass} value={item.type} onChange={(event) => updateSection(item.id, { type: event.target.value as BuilderSectionType })}>
              <option value="TEXT">Text Block</option>
              <option value="IMAGE">Image Block</option>
              <option value="CTA">CTA Block</option>
            </select>
          </Field>
          <Field label="Title"><input className={inputClass} value={item.title} onChange={(event) => updateSection(item.id, { title: event.target.value })} /></Field>
          <Field label="Content"><textarea className={areaClass} rows={4} value={item.content} onChange={(event) => updateSection(item.id, { content: event.target.value })} /></Field>
        </Panel>
      );
    }

    return <EmptyInspector text="Click a card on the preview to edit it." />;
  }

  return <EmptyInspector text="Select an element on the page preview to edit it." />;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function EmptyInspector({ text }: { text: string }) {
  return (
    <Panel title="Inspector">
      <p className="text-sm text-slate-400">{text}</p>
    </Panel>
  );
}

function SingleTextPanel({ title, value, onChange, multiline = false }: { title: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <Panel title={title}>
      <Field label="Content">
        {multiline ? (
          <textarea className={areaClass} rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
        ) : (
          <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
        )}
      </Field>
    </Panel>
  );
}

function CardActions({ onMoveUp, onMoveDown, disableMoveUp, disableMoveDown, onDelete }: { onMoveUp: () => void; onMoveDown: () => void; disableMoveUp: boolean; disableMoveDown: boolean; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
      <div className="flex gap-1">
        <Button type="button" variant="ghost" className="h-8 px-2 text-slate-300 hover:bg-slate-800 disabled:text-slate-600" onClick={onMoveUp} disabled={disableMoveUp}>
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" className="h-8 px-2 text-slate-300 hover:bg-slate-800 disabled:text-slate-600" onClick={onMoveDown} disabled={disableMoveDown}>
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Button type="button" variant="ghost" className="h-8 px-2 text-slate-300 hover:bg-slate-800" onClick={onDelete}>
        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" className="h-10 w-14 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1" value={value} onChange={(event) => onChange(event.target.value)} />
        <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </Field>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none";
const areaClass = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none";
