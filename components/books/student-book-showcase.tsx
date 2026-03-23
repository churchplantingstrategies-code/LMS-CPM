"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import { usePublicBooks } from "@/components/books/use-public-books";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function StudentBookShowcase() {
  const { books, settings, loading } = usePublicBooks();
  const featuredBooks = books.slice(0, 3);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Book Store</h2>
          <p className="text-sm text-gray-500">Live published books from the storefront.</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/checkout">
            Browse all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <p className="py-4 text-sm text-gray-500">Loading bookstore...</p>
          ) : featuredBooks.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No published books yet.</p>
            </div>
          ) : (
            featuredBooks.map((book) => (
              <div key={book.id} className="flex gap-3 rounded-2xl bg-gray-50 p-3">
                <BookCoverImage bookId={book.id} title={book.title} imageUrl={book.coverImageUrl} className="h-24 w-16 flex-shrink-0 rounded-[18px] shadow-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {book.featured ? <Badge variant="brand">Featured</Badge> : null}
                    <Badge variant="secondary">{book.format}</Badge>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-gray-900">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.author}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(book.price, settings.currency)}</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/checkout?bookId=${book.id}`}>Buy now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}