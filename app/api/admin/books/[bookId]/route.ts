import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteBook, updateBook } from "@/lib/book-store";
import { BookRecord } from "@/types/books";

function ensureAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<BookRecord>;
    const saved = await updateBook(bookId, body);

    if (!saved) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error("[ADMIN_BOOK_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await deleteBook(bookId);
    if (!deleted) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_BOOK_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}