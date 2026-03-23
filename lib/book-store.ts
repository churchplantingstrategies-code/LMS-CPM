import { promises as fs } from "fs";
import path from "path";
import { defaultBookStoreData, defaultBookStoreSettings } from "@/lib/sample-books";
import { BookRecord, BookStoreData, BookStoreSettings } from "@/types/books";

const DATA_PATH = path.join(process.cwd(), "data", "books-store.json");

function nowIso() {
  return new Date().toISOString();
}

async function ensureDirExists(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function sanitizeNumber(value: unknown, min = 0, fallback = 0) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, parsed);
}

function sanitizeBook(input: Partial<BookRecord>, existing?: BookRecord): BookRecord {
  const timestamp = nowIso();
  const base = existing ?? {
    id: `book-${Date.now()}`,
    title: "Untitled Book",
    author: "Unknown Author",
    category: "General",
    coverImageUrl: "",
    price: 0,
    pages: 0,
    accentFrom: "from-brand-500",
    accentTo: "to-cyan-400",
    summary: "",
    description: "",
    tagline: "",
    sku: `BK-${Date.now()}`,
    isbn: "",
    language: "English",
    format: "EBOOK" as const,
    inventory: 0,
    featured: false,
    allowDiscounts: true,
    status: "DRAFT" as const,
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

  const next: BookRecord = {
    ...base,
    ...input,
    title: String(input.title ?? base.title).trim() || base.title,
    author: String(input.author ?? base.author).trim() || base.author,
    category: String(input.category ?? base.category).trim() || base.category,
    coverImageUrl: String(input.coverImageUrl ?? base.coverImageUrl ?? "").trim(),
    summary: String(input.summary ?? base.summary).trim(),
    description: String(input.description ?? base.description).trim(),
    tagline: String(input.tagline ?? base.tagline).trim(),
    sku: String(input.sku ?? base.sku).trim() || base.sku,
    isbn: String(input.isbn ?? base.isbn).trim(),
    language: String(input.language ?? base.language).trim() || "English",
    accentFrom: String(input.accentFrom ?? base.accentFrom).trim() || base.accentFrom,
    accentTo: String(input.accentTo ?? base.accentTo).trim() || base.accentTo,
    format: (["EBOOK", "PAPERBACK", "HARDCOVER", "AUDIOBOOK"] as const).includes(input.format as BookRecord["format"])
      ? (input.format as BookRecord["format"])
      : base.format,
    status: (["DRAFT", "PUBLISHED"] as const).includes(input.status as BookRecord["status"])
      ? (input.status as BookRecord["status"])
      : base.status,
    price: sanitizeNumber(input.price ?? base.price, 0, base.price),
    pages: sanitizeNumber(input.pages ?? base.pages, 0, base.pages),
    inventory: sanitizeNumber(input.inventory ?? base.inventory, 0, base.inventory),
    monthlySales: sanitizeNumber(input.monthlySales ?? base.monthlySales, 0, base.monthlySales),
    yearlySales: sanitizeNumber(input.yearlySales ?? base.yearlySales, 0, base.yearlySales),
    monthlyRevenue: sanitizeNumber(input.monthlyRevenue ?? base.monthlyRevenue, 0, base.monthlyRevenue),
    yearlyRevenue: sanitizeNumber(input.yearlyRevenue ?? base.yearlyRevenue, 0, base.yearlyRevenue),
    totalSales: sanitizeNumber(input.totalSales ?? base.totalSales, 0, base.totalSales),
    totalRevenue: sanitizeNumber(input.totalRevenue ?? base.totalRevenue, 0, base.totalRevenue),
    featured: Boolean(input.featured ?? base.featured),
    allowDiscounts: Boolean(input.allowDiscounts ?? base.allowDiscounts),
    publishedAt:
      (input.status ?? base.status) === "PUBLISHED"
        ? String(input.publishedAt ?? base.publishedAt ?? timestamp)
        : null,
    releaseDate:
      input.releaseDate === null
        ? null
        : (() => {
            const releaseDateValue = input.releaseDate ?? base.releaseDate ?? "";
            const normalizedReleaseDate = String(releaseDateValue).trim();
            return normalizedReleaseDate || null;
          })(),
    updatedAt: timestamp,
  };

  return next;
}

function sanitizeSettings(input: Partial<BookStoreSettings>): BookStoreSettings {
  return {
    currency: String(input.currency ?? defaultBookStoreSettings.currency).toUpperCase() || "PHP",
    storeName: String(input.storeName ?? defaultBookStoreSettings.storeName).trim() || defaultBookStoreSettings.storeName,
    storefrontHeadline: String(input.storefrontHeadline ?? defaultBookStoreSettings.storefrontHeadline).trim() || defaultBookStoreSettings.storefrontHeadline,
    supportEmail: String(input.supportEmail ?? defaultBookStoreSettings.supportEmail).trim() || defaultBookStoreSettings.supportEmail,
    returnPolicy: String(input.returnPolicy ?? defaultBookStoreSettings.returnPolicy).trim() || defaultBookStoreSettings.returnPolicy,
    shippingMessage: String(input.shippingMessage ?? defaultBookStoreSettings.shippingMessage).trim() || defaultBookStoreSettings.shippingMessage,
    featuredCollectionTitle: String(input.featuredCollectionTitle ?? defaultBookStoreSettings.featuredCollectionTitle).trim() || defaultBookStoreSettings.featuredCollectionTitle,
    lowStockThreshold: sanitizeNumber(input.lowStockThreshold ?? defaultBookStoreSettings.lowStockThreshold, 0, defaultBookStoreSettings.lowStockThreshold),
    showAuthorsOnCards: Boolean(input.showAuthorsOnCards ?? defaultBookStoreSettings.showAuthorsOnCards),
    showBookFormats: Boolean(input.showBookFormats ?? defaultBookStoreSettings.showBookFormats),
    enableRecommendations: Boolean(input.enableRecommendations ?? defaultBookStoreSettings.enableRecommendations),
    enableBestsellersStrip: Boolean(input.enableBestsellersStrip ?? defaultBookStoreSettings.enableBestsellersStrip),
    allowPreorders: Boolean(input.allowPreorders ?? defaultBookStoreSettings.allowPreorders),
    inventoryTrackingEnabled: Boolean(input.inventoryTrackingEnabled ?? defaultBookStoreSettings.inventoryTrackingEnabled),
  };
}

export async function readBookStore(): Promise<BookStoreData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<BookStoreData>;
    return sanitizeBookStore(parsed);
  } catch {
    await writeBookStore(defaultBookStoreData);
    return defaultBookStoreData;
  }
}

export function sanitizeBookStore(input: Partial<BookStoreData>): BookStoreData {
  const books = (input.books ?? defaultBookStoreData.books).map((book) => sanitizeBook(book));
  return {
    books,
    settings: sanitizeSettings(input.settings ?? defaultBookStoreData.settings),
    updatedAt: nowIso(),
  };
}

export async function writeBookStore(next: Partial<BookStoreData>): Promise<BookStoreData> {
  const payload = sanitizeBookStore(next);
  await ensureDirExists(DATA_PATH);
  await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

export async function createBookDraft(input?: Partial<BookRecord>): Promise<BookRecord> {
  const store = await readBookStore();
  const timestamp = Date.now();
  const draft = sanitizeBook({
    id: `book-${timestamp}`,
    title: "New Book Draft",
    author: "Author Name",
    category: "Discipleship",
    summary: "Short summary for the storefront.",
    description: "Longer book description, teaching angle, and who this book is for.",
    tagline: "Add a clear promise for this book.",
    sku: `BK-${timestamp}`,
    isbn: "978-621-000-0000",
    price: 0,
    pages: 120,
    inventory: 100,
    format: "EBOOK",
    status: "DRAFT",
    accentFrom: "from-brand-500",
    accentTo: "to-cyan-400",
    ...input,
  });

  const saved = await writeBookStore({ ...store, books: [draft, ...store.books] });
  return saved.books[0];
}

export async function updateBook(bookId: string, input: Partial<BookRecord>) {
  const store = await readBookStore();
  const current = store.books.find((book) => book.id === bookId);
  if (!current) return null;

  const updated = sanitizeBook(input, current);
  const saved = await writeBookStore({
    ...store,
    books: store.books.map((book) => (book.id === bookId ? updated : book)),
  });

  return saved.books.find((book) => book.id === bookId) ?? null;
}

export async function deleteBook(bookId: string) {
  const store = await readBookStore();
  const nextBooks = store.books.filter((book) => book.id !== bookId);
  if (nextBooks.length === store.books.length) {
    return false;
  }
  await writeBookStore({ ...store, books: nextBooks });
  return true;
}

export async function updateBookStoreSettings(settings: Partial<BookStoreSettings>) {
  const store = await readBookStore();
  return writeBookStore({ ...store, settings: sanitizeSettings(settings) });
}

export async function readPublishedBooks() {
  const store = await readBookStore();
  return {
    books: store.books
      .filter((book) => book.status === "PUBLISHED")
      .sort((left, right) => Number(right.featured) - Number(left.featured) || left.title.localeCompare(right.title)),
    settings: store.settings,
    updatedAt: store.updatedAt,
  };
}

export async function getBookById(bookId: string) {
  const store = await readBookStore();
  return store.books.find((book) => book.id === bookId) ?? null;
}