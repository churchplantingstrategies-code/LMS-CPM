"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { BookCheckoutButton } from "@/components/books/book-checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookCoverImage } from "@/components/books/book-cover-image";
import { usePublicBooks } from "@/components/books/use-public-books";
import { toast } from "@/components/ui/toaster";
import { formatCurrency } from "@/lib/utils";
import { addBookToCart, clearBookCart, removeBookFromCart, setBookQuantity, useBookCart } from "@/components/books/use-book-cart";

export default function StudentCartPage() {
  const searchParams = useSearchParams();
  const { items, subtotal, itemCount } = useBookCart();
  const { books, settings, loading } = usePublicBooks();

  useEffect(() => {
    if (searchParams.get("purchase") !== "success") return;

    clearBookCart();
    toast({
      title: "Order completed",
      description: "Your book order was recorded successfully.",
      variant: "success",
    });
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="brand" className="mb-3">Student Storefront</Badge>
          <h1 className="text-3xl font-bold text-gray-900">Checkout Cart</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Use this cart for one-time book purchases while keeping your subscription separate in billing.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {itemCount} item{itemCount === 1 ? "" : "s"} selected · {formatCurrency(subtotal, "PHP")}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Cart items</h2>
                  <p className="text-sm text-gray-500">Adjust quantities before continuing to checkout.</p>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
                  <p className="mt-2 text-sm text-gray-500">Add books below or from the landing page carousel.</p>
                  <Button className="mt-5" variant="brand" asChild>
                    <Link href="/checkout">Browse books</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <BookCoverImage bookId={item.book.id} title={item.book.title} imageUrl={item.book.coverImageUrl} className="h-28 w-20 flex-shrink-0 rounded-[18px] shadow-sm" />
                        <div>
                          <p className="font-semibold text-gray-900">{item.book.title}</p>
                          <p className="mt-1 text-sm text-gray-500">{item.book.author} · {item.book.category}</p>
                          <p className="mt-2 text-sm text-gray-400">{item.book.tagline}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
                          <button
                            type="button"
                            onClick={() => setBookQuantity(item.bookId, item.quantity - 1)}
                            className="rounded-full p-2 text-gray-500 hover:bg-white"
                            aria-label={`Decrease quantity for ${item.book.title}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setBookQuantity(item.bookId, item.quantity + 1)}
                            className="rounded-full p-2 text-gray-500 hover:bg-white"
                            aria-label={`Increase quantity for ${item.book.title}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="w-28 text-right font-semibold text-gray-900">{formatCurrency(item.lineTotal, "PHP")}</p>
                        <Button
                          variant="ghost"
                          className="text-gray-500 hover:text-red-600"
                          onClick={() => {
                            removeBookFromCart(item.bookId);
                            toast({ title: "Removed", description: `${item.book.title} was removed from your cart.` });
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add more books</h2>
              <Badge variant="secondary">{books.length} titles</Badge>
            </div>
            {loading ? <p className="mb-3 text-sm text-gray-500">Loading published books...</p> : null}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <Card key={book.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <BookCoverImage bookId={book.id} title={book.title} imageUrl={book.coverImageUrl} className="mb-4 h-56 rounded-[24px] shadow-md" />
                    <p className="font-semibold text-gray-900">{book.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{book.author}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(book.price, "PHP")}</span>
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => {
                          addBookToCart(book.id);
                          toast({
                            title: "Book added",
                            description: `${book.title} is now in your checkout cart.`,
                            variant: "success",
                          });
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-0 shadow-xl shadow-brand-100/50">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Subscription</span>
                  <span>Handled separately</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Store support</span>
                  <span>{settings.supportEmail}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-base font-semibold text-gray-900">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, "PHP")}</span>
                </div>
              </div>
              <BookCheckoutButton
                className="mt-6 w-full"
                variant="brand"
                items={items.map((item) => ({ bookId: item.bookId, quantity: item.quantity }))}
              >
                Proceed to Secure Checkout
              </BookCheckoutButton>
              <Button className="mt-3 w-full" variant="outline" asChild>
                <Link href="/checkout">Review public checkout</Link>
              </Button>
              <p className="mt-3 text-xs leading-5 text-gray-500">
                Orders are persisted after successful payment and feed the books revenue dashboard automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}