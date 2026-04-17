"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  ImagePlus,
  Pencil,
  Plus,
  Save,
  Send,
  Settings2,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toaster";
import { cn, formatCurrency } from "@/lib/utils";
import { BookRecord, BookStoreData } from "@/types/books";

const EMPTY_STORE: BookStoreData = {
  books: [],
  settings: {
    currency: "PHP",
    storeName: "Church Planting Movement Books",
    storefrontHeadline: "Books for discipleship, leadership, and ministry growth.",
    supportEmail: "books@churchplantingmovement.local",
    returnPolicy: "Digital book purchases are final unless a file is defective or inaccessible.",
    shippingMessage: "Digital delivery is instant after checkout. Physical shipping can be configured later.",
    featuredCollectionTitle: "Books Handpicked for Leaders",
    lowStockThreshold: 20,
    showAuthorsOnCards: true,
    showBookFormats: true,
    enableRecommendations: true,
    enableBestsellersStrip: true,
    allowPreorders: false,
    inventoryTrackingEnabled: true,
  },
  updatedAt: "",
};

function emptyBook(): BookRecord {
  const timestamp = new Date().toISOString();
  return {
    id: "",
    title: "",
    author: "",
    category: "",
    coverImageUrl: "",
    price: 0,
    pages: 0,
    accentFrom: "from-brand-500",
    accentTo: "to-cyan-400",
    summary: "",
    description: "",
    tagline: "",
    sku: "",
    isbn: "",
    language: "English",
    format: "EBOOK",
    inventory: 0,
    featured: false,
    allowDiscounts: true,
    status: "DRAFT",
    publishedAt: null,
    releaseDate: null,
    monthlySales: 0,
    yearlySales: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalSales: 0,
    totalRevenue: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function BooksAdminManager() {
  const [store, setStore] = useState<BookStoreData>(EMPTY_STORE);
  const [draftBook, setDraftBook] = useState<BookRecord>(emptyBook());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSetup, setSavingSetup] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadStore() {
    const response = await fetch("/api/admin/books", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load books store");
    }

    const next = (await response.json()) as BookStoreData;
    setStore(next);
  }

  useEffect(() => {
    loadStore()
      .catch(() => {
        toast({ title: "Load failed", description: "Unable to load the books manager.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  const bestseller = useMemo(
    () => [...store.books].sort((left, right) => right.yearlySales - left.yearlySales)[0] ?? null,
    [store.books]
  );
  const lowSales = useMemo(
    () => [...store.books].sort((left, right) => left.yearlySales - right.yearlySales)[0] ?? null,
    [store.books]
  );

  const monthlyRevenue = store.books.reduce((total, book) => total + book.monthlyRevenue, 0);
  const yearlyRevenue = store.books.reduce((total, book) => total + book.yearlyRevenue, 0);
  const monthlySales = store.books.reduce((total, book) => total + book.monthlySales, 0);
  const yearlySales = store.books.reduce((total, book) => total + book.yearlySales, 0);
  const catalogBooks = useMemo(
    () => [...store.books].sort((left, right) => Number(right.featured) - Number(left.featured) || right.updatedAt.localeCompare(left.updatedAt)),
    [store.books]
  );

  function updateDraft<K extends keyof BookRecord>(key: K, value: BookRecord[K]) {
    setDraftBook((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateBook() {
    setDraftBook(emptyBook());
    setIsEditorOpen(true);
  }

  function openEditBook(book: BookRecord) {
    setDraftBook(book);
    setIsEditorOpen(true);
  }

  async function uploadCoverImage(file: File) {
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/books/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image");
      }

      updateDraft("coverImageUrl", data.url);
      toast({ title: "Cover uploaded", description: "The book cover image is ready.", variant: "success" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload the image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function saveBook(status?: BookRecord["status"]) {
    setSaving(true);
    try {
      const payload = { ...draftBook, status: status ?? draftBook.status };
      const isCreating = !draftBook.id;
      const response = await fetch(isCreating ? "/api/admin/books" : `/api/admin/books/${draftBook.id}`, {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save book");

      const saved = (await response.json()) as BookRecord;
      await loadStore();
      setDraftBook(saved);
      setIsEditorOpen(false);
      toast({
        title: status === "PUBLISHED" ? "Book published" : "Changes saved",
        description:
          status === "PUBLISHED"
            ? "The book is now live on the landing page, storefront, and student dashboard."
            : isCreating
              ? "The book draft was created successfully."
              : "The book is updated.",
        variant: "success",
      });
    } catch {
      toast({ title: "Save failed", description: "Unable to save this book.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeBook(bookId: string) {
    const confirmed = window.confirm("Delete this book from the catalog?");
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete book");
      await loadStore();
      if (draftBook.id === bookId) {
        setIsEditorOpen(false);
        setDraftBook(emptyBook());
      }
      toast({ title: "Book deleted", description: "The book was removed from the catalog.", variant: "success" });
    } catch {
      toast({ title: "Delete failed", description: "Unable to delete this book.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    setSavingSetup(true);
    try {
      const response = await fetch("/api/admin/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: store.settings }),
      });
      if (!response.ok) throw new Error("Failed to save setup");
      const saved = (await response.json()) as BookStoreData;
      setStore(saved);
      toast({ title: "Store setup saved", description: "Book store settings were updated.", variant: "success" });
    } catch {
      toast({ title: "Save failed", description: "Unable to save store settings.", variant: "destructive" });
    } finally {
      setSavingSetup(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading books manager...</p>;
  }

  return (
    <Tabs defaultValue="catalog" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap bg-slate-900">
        <TabsTrigger value="catalog">Lists of Books</TabsTrigger>
        <TabsTrigger value="analytics">Sales & Revenue</TabsTrigger>
        <TabsTrigger value="setup">Store Setup</TabsTrigger>
      </TabsList>

      <TabsContent value="catalog" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Books" value={String(store.books.length)} icon={BookOpen} />
          <MetricCard label="Published" value={String(store.books.filter((book) => book.status === "PUBLISHED").length)} icon={Send} />
          <MetricCard label="Drafts" value={String(store.books.filter((book) => book.status === "DRAFT").length)} icon={Save} />
          <MetricCard label="Monthly Revenue" value={formatCurrency(monthlyRevenue, store.settings.currency)} icon={TrendingUp} />
        </div>

        <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
          <CardContent className="p-5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Lists of Books</h2>
                <p className="text-sm text-slate-400">Published books update the landing page, storefront, and student dashboard from this catalog.</p>
              </div>
              <Button variant="brand" onClick={openCreateBook}>
                <Plus className="mr-2 h-4 w-4" />
                Create Books
              </Button>
            </div>

            {catalogBooks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-14 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-500" />
                <p className="mt-4 text-lg font-semibold text-slate-100">No books in the catalog yet</p>
                <p className="mt-2 text-sm text-slate-400">Create a book, then save it as draft or publish it live.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {catalogBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group relative overflow-hidden rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-4"
                  >
                    <div className="absolute right-4 top-4 z-10 flex gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditBook(book)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-slate-200 transition hover:border-brand-500 hover:text-white"
                        aria-label={`Edit ${book.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBook(book.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-900/80 bg-slate-950/80 text-rose-200 transition hover:border-rose-500 hover:text-white"
                        aria-label={`Delete ${book.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
                      <BookCoverImage
                        bookId={book.id}
                        title={book.title}
                        imageUrl={book.coverImageUrl}
                        className="h-40 w-28 rounded-[24px] border border-white/10 shadow-2xl shadow-black/20"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 pr-20">
                          <Badge variant={book.status === "PUBLISHED" ? "success" : "secondary"}>{book.status}</Badge>
                          {book.featured ? <Badge variant="brand">Featured</Badge> : null}
                          <Badge variant="secondary">{book.format}</Badge>
                        </div>
                        <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-white">{book.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{book.author}</p>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{book.summary || book.description}</p>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Price</p>
                            <p className="text-xl font-semibold text-white">{formatCurrency(book.price, store.settings.currency)}</p>
                          </div>
                          <div className="text-right text-xs text-slate-400">
                            <p>{book.category}</p>
                            <p>{book.inventory} in stock</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto border border-slate-800 bg-slate-950 p-0 text-slate-100">
            <DialogHeader className="border-b border-slate-800 px-6 py-5">
              <DialogTitle>{draftBook.id ? "Edit Book" : "Create Books"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the cover image, text, price, and storefront details. Save as draft or publish live.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 px-6 py-6 xl:grid-cols-[300px_1fr]">
              <div className="space-y-4">
                <BookCoverImage
                  bookId={draftBook.id}
                  title={draftBook.title || "Book cover preview"}
                  imageUrl={draftBook.coverImageUrl}
                  className="h-[420px] w-full rounded-[30px] border border-slate-800 shadow-2xl shadow-black/30"
                />
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span>Status</span>
                    <Badge variant={draftBook.status === "PUBLISHED" ? "success" : "secondary"}>{draftBook.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Published books appear in the landing page carousel, student dashboard books section, checkout storefront, and cart recommendations on the next refresh cycle.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Book Title"><input className={fieldClassName} value={draftBook.title} onChange={(e) => updateDraft("title", e.target.value)} /></Field>
                <Field label="Author"><input className={fieldClassName} value={draftBook.author} onChange={(e) => updateDraft("author", e.target.value)} /></Field>
                <Field label="Category"><input className={fieldClassName} value={draftBook.category} onChange={(e) => updateDraft("category", e.target.value)} /></Field>
                <Field label="Language"><input className={fieldClassName} value={draftBook.language} onChange={(e) => updateDraft("language", e.target.value)} /></Field>
                <Field label="Cover Image" className="md:col-span-2">
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadCoverImage(file);
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500" onClick={() => fileInputRef.current?.click()} loading={uploadingImage}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Upload cover image
                      </Button>
                      {draftBook.coverImageUrl ? (
                        <Button type="button" variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => updateDraft("coverImageUrl", "") }>
                          Remove cover
                        </Button>
                      ) : null}
                    </div>
                    <div className="relative">
                      <ImagePlus className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <input className={cn(fieldClassName, "pl-9")} placeholder="Paste an image URL if you prefer" value={draftBook.coverImageUrl ?? ""} onChange={(e) => updateDraft("coverImageUrl", e.target.value)} />
                    </div>
                  </div>
                </Field>
                <Field label="Price"><input className={fieldClassName} type="number" min="0" value={draftBook.price} onChange={(e) => updateDraft("price", Number(e.target.value))} /></Field>
                <Field label="Pages"><input className={fieldClassName} type="number" min="0" value={draftBook.pages} onChange={(e) => updateDraft("pages", Number(e.target.value))} /></Field>
                <Field label="Format">
                  <select className={fieldClassName} value={draftBook.format} onChange={(e) => updateDraft("format", e.target.value as BookRecord["format"])}>
                    <option value="EBOOK">Ebook</option>
                    <option value="PAPERBACK">Paperback</option>
                    <option value="HARDCOVER">Hardcover</option>
                    <option value="AUDIOBOOK">Audiobook</option>
                  </select>
                </Field>
                <Field label="Inventory"><input className={fieldClassName} type="number" min="0" value={draftBook.inventory} onChange={(e) => updateDraft("inventory", Number(e.target.value))} /></Field>
                <Field label="SKU"><input className={fieldClassName} value={draftBook.sku} onChange={(e) => updateDraft("sku", e.target.value)} /></Field>
                <Field label="ISBN"><input className={fieldClassName} value={draftBook.isbn} onChange={(e) => updateDraft("isbn", e.target.value)} /></Field>
                <Field label="Release Date"><input className={fieldClassName} type="date" value={draftBook.releaseDate?.slice(0, 10) ?? ""} onChange={(e) => updateDraft("releaseDate", e.target.value ? `${e.target.value}T00:00:00.000Z` : null)} /></Field>
                <Field label="Accent Gradient"><input className={fieldClassName} value={`${draftBook.accentFrom} ${draftBook.accentTo}`.trim()} onChange={(e) => {
                  const [accentFrom = draftBook.accentFrom, accentTo = draftBook.accentTo] = e.target.value.trim().split(/\s+/, 2);
                  updateDraft("accentFrom", accentFrom);
                  updateDraft("accentTo", accentTo ?? draftBook.accentTo);
                }} /></Field>
                <Field label="Tagline" className="md:col-span-2"><input className={fieldClassName} value={draftBook.tagline} onChange={(e) => updateDraft("tagline", e.target.value)} /></Field>
                <Field label="Store Summary" className="md:col-span-2"><textarea className={fieldAreaClassName} rows={3} value={draftBook.summary} onChange={(e) => updateDraft("summary", e.target.value)} /></Field>
                <Field label="Description" className="md:col-span-2"><textarea className={fieldAreaClassName} rows={5} value={draftBook.description} onChange={(e) => updateDraft("description", e.target.value)} /></Field>
                <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
                  <ReadOnlyMetric label="Total Sales" value={String(draftBook.totalSales)} />
                  <ReadOnlyMetric label="Monthly Revenue" value={formatCurrency(draftBook.monthlyRevenue, store.settings.currency)} />
                  <ReadOnlyMetric label="Total Revenue" value={formatCurrency(draftBook.totalRevenue, store.settings.currency)} />
                </div>
                <SetupToggle label="Featured in storefront merchandising" checked={draftBook.featured} onCheckedChange={(checked) => updateDraft("featured", checked)} />
                <SetupToggle label="Allow promotions and discounts" checked={draftBook.allowDiscounts} onCheckedChange={(checked) => updateDraft("allowDiscounts", checked)} />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-800 px-6 py-5 sm:justify-between">
              <div className="text-sm text-slate-400">{draftBook.id ? "Editing saved catalog record" : "New book will be created when you save"}</div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <Button variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500" onClick={() => saveBook()} loading={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="brand" onClick={() => saveBook("PUBLISHED")} loading={saving}>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Books
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="analytics" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Book Sales This Month" value={String(monthlySales)} icon={TrendingUp} />
          <MetricCard label="Book Sales This Year" value={String(yearlySales)} icon={BarChart3} />
          <MetricCard label="Revenue This Month" value={formatCurrency(monthlyRevenue, store.settings.currency)} icon={TrendingUp} />
          <MetricCard label="Revenue This Year" value={formatCurrency(yearlyRevenue, store.settings.currency)} icon={BarChart3} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AnalyticsFeatureCard
            title="Best Seller"
            icon={TrendingUp}
            iconClassName="text-emerald-300"
            book={bestseller}
            subtitle={bestseller ? `${bestseller.yearlySales} sales this year · ${formatCurrency(bestseller.yearlyRevenue, store.settings.currency)}` : "No books yet"}
          />
          <AnalyticsFeatureCard
            title="Low Sales"
            icon={TrendingDown}
            iconClassName="text-amber-300"
            book={lowSales}
            subtitle={lowSales ? `${lowSales.yearlySales} sales this year · ${formatCurrency(lowSales.yearlyRevenue, store.settings.currency)}` : "No books yet"}
          />
        </div>

        <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Monthly Sales</th>
                    <th className="px-4 py-3">Yearly Sales</th>
                    <th className="px-4 py-3">Monthly Revenue</th>
                    <th className="px-4 py-3">Yearly Revenue</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {store.books.map((book) => (
                    <tr key={book.id} className="border-b border-slate-900 text-slate-200">
                      <td className="px-4 py-3 font-medium">{book.title}</td>
                      <td className="px-4 py-3">{book.monthlySales}</td>
                      <td className="px-4 py-3">{book.yearlySales}</td>
                      <td className="px-4 py-3">{formatCurrency(book.monthlyRevenue, store.settings.currency)}</td>
                      <td className="px-4 py-3">{formatCurrency(book.yearlyRevenue, store.settings.currency)}</td>
                      <td className="px-4 py-3"><Badge variant={book.status === "PUBLISHED" ? "success" : "secondary"}>{book.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="setup" className="mt-4">
        <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Online Book Store Setup</h2>
                <p className="text-sm text-slate-400">Storefront behavior, merchandising, support details, inventory rules, and other bookstore controls.</p>
              </div>
              <Button variant="brand" onClick={saveSettings} loading={savingSetup}>
                <Settings2 className="mr-2 h-4 w-4" />
                Save Setup
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Store Name"><input className={fieldClassName} value={store.settings.storeName} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, storeName: e.target.value } }))} /></Field>
              <Field label="Currency"><input className={fieldClassName} value={store.settings.currency} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, currency: e.target.value.toUpperCase() } }))} /></Field>
              <Field label="Support Email"><input className={fieldClassName} value={store.settings.supportEmail} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, supportEmail: e.target.value } }))} /></Field>
              <Field label="Low Stock Threshold"><input className={fieldClassName} type="number" value={store.settings.lowStockThreshold} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, lowStockThreshold: Number(e.target.value) } }))} /></Field>
              <Field label="Featured Collection Title" className="md:col-span-2"><input className={fieldClassName} value={store.settings.featuredCollectionTitle} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, featuredCollectionTitle: e.target.value } }))} /></Field>
              <Field label="Storefront Headline" className="md:col-span-2"><textarea className={fieldAreaClassName} rows={3} value={store.settings.storefrontHeadline} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, storefrontHeadline: e.target.value } }))} /></Field>
              <Field label="Shipping Message" className="md:col-span-2"><textarea className={fieldAreaClassName} rows={3} value={store.settings.shippingMessage} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, shippingMessage: e.target.value } }))} /></Field>
              <Field label="Return Policy" className="md:col-span-2"><textarea className={fieldAreaClassName} rows={4} value={store.settings.returnPolicy} onChange={(e) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, returnPolicy: e.target.value } }))} /></Field>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <SetupToggle label="Show authors on landing cards" checked={store.settings.showAuthorsOnCards} onCheckedChange={(checked) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, showAuthorsOnCards: checked } }))} />
              <SetupToggle label="Show book format labels" checked={store.settings.showBookFormats} onCheckedChange={(checked) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, showBookFormats: checked } }))} />
              <SetupToggle label="Enable recommendations" checked={store.settings.enableRecommendations} onCheckedChange={(checked) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, enableRecommendations: checked } }))} />
              <SetupToggle label="Enable bestseller merchandising" checked={store.settings.enableBestsellersStrip} onCheckedChange={(checked) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, enableBestsellersStrip: checked } }))} />
              <SetupToggle label="Allow preorders" checked={store.settings.allowPreorders} onCheckedChange={(checked) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, allowPreorders: checked } }))} />
              <SetupToggle label="Track inventory levels" checked={store.settings.inventoryTrackingEnabled} onCheckedChange={(checked) => setStore((prev) => ({ ...prev, settings: { ...prev.settings, inventoryTrackingEnabled: checked } }))} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
          <Icon className="h-4 w-4 text-brand-400" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsFeatureCard({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  book,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  book: BookRecord | null;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
      <CardContent className="p-5">
        <div className={`mb-3 flex items-center gap-2 ${iconClassName}`}>
          <Icon className="h-4 w-4" />
          <h2 className="font-semibold">{title}</h2>
        </div>
        {book ? (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <BookCoverImage bookId={book.id} title={book.title} imageUrl={book.coverImageUrl} className="h-24 w-16 rounded-xl" />
            <div>
              <p className="text-lg font-semibold">{book.title}</p>
              <p className="text-sm text-slate-400">{book.author}</p>
              <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No books yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function SetupToggle({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
      <input type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} />
      {label}
    </label>
  );
}

function ReadOnlyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

const fieldClassName = "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-brand-500";
const fieldAreaClassName = `${fieldClassName} min-h-[112px] resize-y`;