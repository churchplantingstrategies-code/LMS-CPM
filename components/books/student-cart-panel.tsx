"use client";

import Link from "next/link";
import { BookMarked, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { addBookToCart, useBookCart } from "@/components/books/use-book-cart";

export function StudentCartPanel({ compact = false }: { compact?: boolean }) {
  const { items, itemCount, subtotal, clearBookCart, books, catalogLoading } = useBookCart();
  const suggestedBooks = books.slice(0, compact ? 2 : 3);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Book Checkout Cart</h3>
            <p className="mt-1 text-sm text-gray-500">
              Keep subscriptions for recurring access and use this cart for one-time book purchases.
            </p>
          </div>
          <Badge variant="brand" className="shrink-0">{itemCount} item{itemCount === 1 ? "" : "s"}</Badge>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-center gap-3">
              <BookMarked className="h-9 w-9 text-gray-300" />
              <div>
                <p className="font-medium text-gray-900">Your cart is empty</p>
                <p className="text-sm text-gray-500">Add sample books from the landing page or from the student cart view.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {catalogLoading ? <p className="text-sm text-gray-500">Loading books...</p> : null}
              {suggestedBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => {
                    addBookToCart(book.id);
                    toast({
                      title: "Book added",
                      description: `${book.title} is now in your checkout cart.`,
                      variant: "success",
                    });
                  }}
                  className="rounded-2xl border bg-white p-4 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <p className="text-sm font-semibold text-gray-900">{book.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{book.author}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-brand-700">Add to cart</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(book.price, "PHP")}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, compact ? 2 : items.length).map((item) => (
              <div key={item.bookId} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{item.book.title}</p>
                  <p className="text-sm text-gray-500">Qty {item.quantity} · {item.book.author}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.lineTotal, "PHP")}</p>
              </div>
            ))}
            {compact && items.length > 2 ? (
              <p className="text-sm text-gray-500">+{items.length - 2} more item{items.length - 2 === 1 ? "" : "s"} in cart</p>
            ) : null}
          </div>
        )}

        <div className="rounded-2xl bg-brand-950 p-4 text-white">
          <div className="flex items-center justify-between text-sm text-brand-200">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, "PHP")}</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="brand" className="flex-1 bg-white text-brand-900 hover:bg-brand-50" asChild>
              <Link href="/checkout">Review Checkout</Link>
            </Button>
            <Button variant="outline" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500" asChild>
              <Link href="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Open Cart
              </Link>
            </Button>
            {items.length > 0 ? (
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  clearBookCart();
                  toast({ title: "Cart cleared", description: "The checkout cart has been emptied." });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}