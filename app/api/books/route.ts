import { NextResponse } from "next/server";
import { readPublishedBooks } from "@/lib/book-store";

export async function GET() {
  const store = await readPublishedBooks();
  return NextResponse.json(store, {
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}