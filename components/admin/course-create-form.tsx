"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { toast } from "../ui/toaster";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";

type VideoProvider = "UPLOAD" | "YOUTUBE" | "VIMEO" | "CLOUDFLARE_STREAM";

type LessonDraft = {
  title: string;
  description: string;
  content: string;
  videoProvider: VideoProvider;
  videoUrl: string;
  duration: number;
  isFree: boolean;
};

type ModuleDraft = {
  title: string;
  description: string;
  lessons: LessonDraft[];
};

type CreateCoursePayload = {
  title: string;
  description: string;
  category: string;
  price: number;
  modules: ModuleDraft[];
  isPublished: boolean;
};

const emptyLesson = (): LessonDraft => ({
  title: "",
  description: "",
  content: "",
  videoProvider: "UPLOAD",
  videoUrl: "",
  duration: 0,
  isFree: false,
});

const emptyModule = (): ModuleDraft => ({
  title: "",
  description: "",
  lessons: [emptyLesson()],
});

const initialState: CreateCoursePayload = {
  title: "",
  description: "",
  category: "",
  price: 0,
  modules: [emptyModule()],
  isPublished: false,
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [picked] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, picked);
  return next;
}

export function CourseCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateCoursePayload>(initialState);
  const [saving, setSaving] = useState(false);
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [draggedLessonRef, setDraggedLessonRef] = useState<{
    moduleIndex: number;
    lessonIndex: number;
  } | null>(null);

  function announceReorder(text: string) {
    toast({
      title: text,
      variant: "success",
      duration: 1600,
    });
  }

  function addModule() {
    setForm((prev) => ({ ...prev, modules: [...prev.modules, emptyModule()] }));
  }

  function removeModule(moduleIndex: number) {
    setForm((prev) => {
      if (prev.modules.length <= 1) {
        toast({
          title: "At least one module is required",
          variant: "destructive",
          duration: 1800,
        });
        return prev;
      }
      return {
        ...prev,
        modules: prev.modules.filter((_, idx) => idx !== moduleIndex),
      };
    });
  }

  function updateModuleField(moduleIndex: number, field: "title" | "description", value: string) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m, idx) =>
        idx === moduleIndex ? { ...m, [field]: value } : m
      ),
    }));
  }

  function addLesson(moduleIndex: number) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m, idx) =>
        idx === moduleIndex ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m
      ),
    }));
  }

  function removeLesson(moduleIndex: number, lessonIndex: number) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m, idx) => {
        if (idx !== moduleIndex) return m;
        if (m.lessons.length <= 1) {
          toast({
            title: "At least one lesson is required per module",
            variant: "destructive",
            duration: 1800,
          });
          return m;
        }
        return {
          ...m,
          lessons: m.lessons.filter((_, lIdx) => lIdx !== lessonIndex),
        };
      }),
    }));
  }

  function updateLessonField<K extends keyof LessonDraft>(
    moduleIndex: number,
    lessonIndex: number,
    field: K,
    value: LessonDraft[K]
  ) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m, idx) => {
        if (idx !== moduleIndex) return m;
        return {
          ...m,
          lessons: m.lessons.map((l, lIdx) =>
            lIdx === lessonIndex ? { ...l, [field]: value } : l
          ),
        };
      }),
    }));
  }

  function reorderModules(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setForm((prev) => ({
      ...prev,
      modules: moveItem(prev.modules, fromIndex, toIndex),
    }));
    announceReorder("Module order updated");
  }

  function reorderLessons(moduleIndex: number, fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m, idx) => {
        if (idx !== moduleIndex) return m;
        return {
          ...m,
          lessons: moveItem(m.lessons, fromIndex, toIndex),
        };
      }),
    }));
    announceReorder("Lesson order updated");
  }

  async function submit(isPublished: boolean) {
    setSaving(true);

    if (!form.title.trim()) {
      toast({
        title: "Course title is required",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    if (form.modules.some((m) => !m.title.trim())) {
      toast({
        title: "Each module needs a title",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    if (form.modules.some((m) => m.lessons.some((l) => !l.title.trim()))) {
      toast({
        title: "Each lesson needs a title",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isPublished }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data?.error || "Failed to create course";
        toast({
          title: "Unable to save course",
          description: String(err),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isPublished ? "Course published successfully" : "Draft saved successfully",
        variant: "success",
      });
      setForm(initialState);
      router.refresh();
    } catch {
      toast({
        title: "Request failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-100">Create Course Setup</h2>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Course Title</label>
          <input
            type="text"
            placeholder="e.g. Discipleship Foundations"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea
            rows={4}
            placeholder="Write course overview, outcomes, and target learners"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Price (PHP)</label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Category</label>
          <input
            type="text"
            placeholder="Leadership, Bible Study, Ministry"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <div className="md:col-span-2 space-y-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Module & Lesson Builder</h3>
            <Button type="button" size="sm" variant="outline" onClick={addModule}>
              <Plus className="mr-1 h-4 w-4" /> Add Module
            </Button>
          </div>

          {form.modules.map((moduleItem, moduleIndex) => (
            <div
              key={`module-${moduleIndex}`}
              draggable
              onDragStart={() => setDraggedModuleIndex(moduleIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedModuleIndex === null) return;
                reorderModules(draggedModuleIndex, moduleIndex);
                setDraggedModuleIndex(null);
              }}
              onDragEnd={() => setDraggedModuleIndex(null)}
              className={`rounded-lg border bg-slate-900/40 p-4 transition ${
                draggedModuleIndex === moduleIndex
                  ? "border-brand-500/60 opacity-75"
                  : "border-slate-800"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-500" />
                  <p className="text-xs uppercase tracking-wider text-slate-400">Module {moduleIndex + 1}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => reorderModules(moduleIndex, Math.max(0, moduleIndex - 1))}
                    disabled={moduleIndex === 0}
                    className="text-slate-300 hover:text-slate-100"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => reorderModules(moduleIndex, Math.min(form.modules.length - 1, moduleIndex + 1))}
                    disabled={moduleIndex === form.modules.length - 1}
                    className="text-slate-300 hover:text-slate-100"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeModule(moduleIndex)}
                    className="text-rose-300 hover:text-rose-200"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Remove Module
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Module Title</label>
                  <input
                    type="text"
                    value={moduleItem.title}
                    onChange={(e) => updateModuleField(moduleIndex, "title", e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Module Description</label>
                  <input
                    type="text"
                    value={moduleItem.description}
                    onChange={(e) => updateModuleField(moduleIndex, "description", e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Lessons</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addLesson(moduleIndex)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Lesson
                  </Button>
                </div>

                {moduleItem.lessons.map((lessonItem, lessonIndex) => (
                  <div
                    key={`module-${moduleIndex}-lesson-${lessonIndex}`}
                    draggable
                    onDragStart={() => setDraggedLessonRef({ moduleIndex, lessonIndex })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!draggedLessonRef) return;
                      if (draggedLessonRef.moduleIndex !== moduleIndex) return;
                      reorderLessons(moduleIndex, draggedLessonRef.lessonIndex, lessonIndex);
                      setDraggedLessonRef(null);
                    }}
                    onDragEnd={() => setDraggedLessonRef(null)}
                    className={`rounded-md border bg-slate-950/60 p-3 transition ${
                      draggedLessonRef?.moduleIndex === moduleIndex && draggedLessonRef.lessonIndex === lessonIndex
                        ? "border-brand-500/60 opacity-75"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-slate-500" />
                        <p className="text-xs text-slate-400">Lesson {lessonIndex + 1}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => reorderLessons(moduleIndex, lessonIndex, Math.max(0, lessonIndex - 1))}
                          disabled={lessonIndex === 0}
                          className="text-slate-300 hover:text-slate-100"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            reorderLessons(
                              moduleIndex,
                              lessonIndex,
                              Math.min(moduleItem.lessons.length - 1, lessonIndex + 1)
                            )
                          }
                          disabled={lessonIndex === moduleItem.lessons.length - 1}
                          className="text-slate-300 hover:text-slate-100"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          className="text-rose-300 hover:text-rose-200"
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Lesson Title</label>
                        <input
                          type="text"
                          value={lessonItem.title}
                          onChange={(e) => updateLessonField(moduleIndex, lessonIndex, "title", e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Duration (minutes)</label>
                        <input
                          type="number"
                          min={0}
                          value={lessonItem.duration}
                          onChange={(e) =>
                            updateLessonField(
                              moduleIndex,
                              lessonIndex,
                              "duration",
                              Number(e.target.value) || 0
                            )
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Video Provider</label>
                        <select
                          value={lessonItem.videoProvider}
                          onChange={(e) =>
                            updateLessonField(
                              moduleIndex,
                              lessonIndex,
                              "videoProvider",
                              e.target.value as VideoProvider
                            )
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        >
                          <option value="UPLOAD">UPLOAD</option>
                          <option value="YOUTUBE">YOUTUBE</option>
                          <option value="VIMEO">VIMEO</option>
                          <option value="CLOUDFLARE_STREAM">CLOUDFLARE_STREAM</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Video URL</label>
                        <input
                          type="url"
                          value={lessonItem.videoUrl}
                          onChange={(e) => updateLessonField(moduleIndex, lessonIndex, "videoUrl", e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                          placeholder="https://vimeo.com/..."
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-300">Lesson Description</label>
                        <textarea
                          rows={2}
                          value={lessonItem.description}
                          onChange={(e) => updateLessonField(moduleIndex, lessonIndex, "description", e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-300">Lesson Content (optional HTML/text)</label>
                        <textarea
                          rows={3}
                          value={lessonItem.content}
                          onChange={(e) => updateLessonField(moduleIndex, lessonIndex, "content", e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
                        <input
                          type="checkbox"
                          checked={lessonItem.isFree}
                          onChange={(e) => updateLessonField(moduleIndex, lessonIndex, "isFree", e.target.checked)}
                        />
                        Mark lesson as free preview
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 flex gap-2 pt-2">
          <Button type="button" variant="brand" disabled={saving} onClick={() => submit(false)}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => submit(true)}>
            Publish Course
          </Button>
        </div>
      </form>
    </div>
  );
}
