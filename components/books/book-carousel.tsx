"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { usePublicBooks } from "@/components/books/use-public-books";
import { BookRecord } from "@/types/books";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookCoverImage } from "@/components/books/book-cover-image";

function BookRow({ books, reverse = false }: { books: BookRecord[]; reverse?: boolean }) {
  const repeatedBooks = [...books, ...books];

  return (
    <div className="overflow-hidden">
      <div className={reverse ? "book-marquee-track reverse" : "book-marquee-track"}>
        {repeatedBooks.map((book, index) => (
          <Link
            key={`${book.id}-${index}`}
            href={`/checkout?book=${book.id}`}
            className="group mx-3 block w-[260px] flex-shrink-0 rounded-[28px] border border-white/10 bg-white/90 p-4 shadow-lg shadow-brand-950/5 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="mb-4 relative">
              <BookCoverImage bookId={book.id} title={book.title} imageUrl={book.coverImageUrl} className="h-64 shadow-md" imageClassName="transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {book.category}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold leading-tight text-gray-900">{book.title}</p>
                <p className="mt-1 text-sm text-gray-500">{book.author} · {book.pages} pages</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="brand" className="border-0 bg-brand-50 text-brand-700">
                  Sample Book
                </Badge>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(book.price, "PHP")}</span>
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{book.description}</p>
              <div className="flex items-center justify-between text-sm font-medium text-brand-700">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Checkout this title
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BookCarousel() {
  const { books, settings, loading } = usePublicBooks();
  const splitIndex = Math.ceil(books.length / 2);
  const firstRow = books.slice(0, splitIndex);
  const secondRow = books.slice(splitIndex);

  if (loading) {
    return <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center text-sm text-gray-500">Loading published books...</div>;
  }

  if (books.length === 0) {
    return <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center text-sm text-gray-500">No published books yet. Publish titles from the Super Admin Books page to display them here.</div>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-amber-50 via-amber-50/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-amber-50 via-amber-50/90 to-transparent" />
      <div className="mb-6 flex items-center justify-between px-1 text-sm text-gray-500">
        <span>{books.length} published book{books.length === 1 ? "" : "s"}</span>
        <span>{settings.storefrontHeadline}</span>
      </div>
      <div className="space-y-6">
        <BookRow books={firstRow} />
        {secondRow.length > 0 ? <BookRow books={secondRow} reverse /> : null}
      </div>
    </div>
  );
}