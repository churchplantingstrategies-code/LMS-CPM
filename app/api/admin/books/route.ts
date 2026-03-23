import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildBookSalesMetrics, readBookOrders } from "@/lib/book-orders";
import { createBookDraft, readBookStore, updateBookStoreSettings } from "@/lib/book-store";

function ensureAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [store, orders] = await Promise.all([readBookStore(), readBookOrders()]);
  const metrics = buildBookSalesMetrics(store.books, orders.orders);

  return NextResponse.json({
    ...store,
    books: store.books.map((book) => ({
      ...book,
      ...metrics.get(book.id),
    })),
  }, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let payload: Record<string, unknown> | undefined;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      payload = undefined;
    }

    const book = await createBookDraft(payload);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_BOOK_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create book draft" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { settings?: Record<string, unknown> };
    const saved = await updateBookStoreSettings(body.settings ?? {});
    return NextResponse.json(saved);
  } catch (error) {
    console.error("[ADMIN_BOOK_SETTINGS_ERROR]", error);
    return NextResponse.json({ error: "Failed to save book store settings" }, { status: 500 });
  }
}