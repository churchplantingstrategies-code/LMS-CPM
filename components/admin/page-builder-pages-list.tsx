"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BuilderPageRecord } from "@/types/page-builder";

type ApiListResponse = {
  pages: BuilderPageRecord[];
};

export function PageBuilderPagesList() {
  const [pages, setPages] = useState<BuilderPageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPages() {
    const response = await fetch("/api/admin/page-builder", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load pages.");
    }

    const payload = (await response.json()) as ApiListResponse;
    setPages(payload.pages);
  }

  useEffect(() => {
    loadPages()
      .catch((error) => {
        toast({
          title: "Load failed",
          description: error instanceof Error ? error.message : "Unable to load pages.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function createPage() {
    const label = window.prompt("Page name", `New Page ${pages.length + 1}`)?.trim();
    if (!label) return;

    const assignedPath = window
      .prompt(
        "Assign URL path (example: /my-page)",
        `/${label
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")}`
      )
      ?.trim();

    if (!assignedPath) return;

    try {
      const response = await fetch("/api/admin/page-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: label, path: assignedPath }),
      });

      const rawPayload = (await response.json()) as BuilderPageRecord | { error?: string };
      if (!response.ok || "error" in rawPayload) {
        throw new Error("error" in rawPayload ? rawPayload.error : "Unable to create page.");
      }
      const payload = rawPayload as BuilderPageRecord;

      await loadPages();
      toast({
        title: "Page created",
        description: `${payload.name} is ready for editing.`,
        variant: "success",
      });

      window.open(`/builder/${payload.id}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Unable to create page.",
        variant: "destructive",
      });
    }
  }

  async function deletePage(page: BuilderPageRecord) {
    const confirmed = window.confirm(`Delete ${page.name}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/page-builder/${page.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Failed to delete page.");
      }

      await loadPages();
      toast({
        title: "Page deleted",
        description: `${page.name} has been removed.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete page.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading pages...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Existing Pages</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select any page to open Elementor-style editor in a new tab.
            </p>
          </div>
          <Button variant="brand" onClick={() => void createPage()}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Create New Page
          </Button>
        </CardContent>
      </Card>

      {pages.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.id} className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">{page.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{page.path}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      page.status === "PUBLISHED"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {page.status}
                  </span>
                </div>

                <p className="text-sm text-slate-400">{page.seoDescription || "No description"}</p>

                <div className="flex flex-wrap gap-2">
                  <Button variant="brand" asChild>
                    <Link href={`/builder/${page.id}`} target="_blank">
                      <Pencil className="mr-2 h-4 w-4" />
                      Open Builder
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"
                    asChild
                  >
                    <Link href={page.path} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Live
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"
                    onClick={() => void deletePage(page)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
          <CardContent className="p-5 text-sm text-slate-400">
            No pages yet. Create your first page to start building.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
