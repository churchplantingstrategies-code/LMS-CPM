"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, BookOpen, CheckCircle2, ShieldCheck, ShoppingCart } from "lucide-react";
import { BookCheckoutButton } from "@/components/books/book-checkout-button";
import { findBookById, usePublicBooks } from "@/components/books/use-public-books";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { BookCoverImage } from "@/components/books/book-cover-image";
import { formatCurrency } from "@/lib/utils";
import { addBookToCart, removeBookFromCart, useBookCart } from "@/components/books/use-book-cart";

export default function BookCheckoutPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { items, subtotal } = useBookCart();
  const { books, settings, loading } = usePublicBooks();
  const requestedBookId = searchParams.get("book") ?? searchParams.get("bookId");
  const requestedBook = findBookById(books, requestedBookId);

  useEffect(() => {
    if (!requestedBook) return;
    if (items.some((item) => item.bookId === requestedBook.id)) return;

    addBookToCart(requestedBook.id);
    toast({
      title: "Added to checkout",
      description: `${requestedBook.title} was added to your cart.`,
      variant: "success",
    });
  }, [items, requestedBook]);

  return (
    <div className="bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_42%,#f8fafc_100%)] py-20">
      <div className="section-container space-y-12">
        <div className="max-w-3xl">
          <Badge variant="brand" className="mb-4">Book Checkout</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Build a one-time book order alongside your subscription.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Students can keep recurring subscriptions for learning access and still use a separate cart for book purchases.
            This checkout page starts with the title you clicked and lets you grow the cart from there.
          </p>
          <p className="mt-2 text-sm text-gray-500">{settings.storefrontHeadline}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            {loading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-sm text-gray-500">Loading published books...</CardContent>
              </Card>
            ) : null}
            {requestedBook ? (
              <Card className="overflow-hidden border-0 shadow-xl shadow-amber-100/60">
                <CardContent className="grid gap-6 p-0 md:grid-cols-[0.9fr_1.1fr]">
                  <div className={`min-h-[320px] bg-gradient-to-br ${requestedBook.accentFrom} ${requestedBook.accentTo} p-8 text-white`}>
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Selected title</p>
                    <BookCoverImage bookId={requestedBook.id} title={requestedBook.title} imageUrl={requestedBook.coverImageUrl} className="mx-auto h-[360px] max-w-[260px] rounded-[28px] shadow-2xl shadow-black/25" />
                    <div className="mt-6 space-y-2 text-sm text-white/80">
                      <p>{requestedBook.author}</p>
                      <p>{requestedBook.category}</p>
                      <p>{requestedBook.pages} pages</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Ready for checkout</Badge>
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(requestedBook.price, "PHP")}</span>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-gray-600">{requestedBook.description}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[
                        "One-time purchase",
                        "Instantly appears in student cart",
                        "Separate from monthly subscriptions",
                        "Works as a storefront demo",
                      ].map((feature) => (
                        <div key={feature} className="flex items-start gap-2 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button variant="brand" asChild>
                        <Link href={session?.user ? "/cart" : "/login?callbackUrl=/cart"}>
                          {session?.user ? "Continue in Student Cart" : "Sign In to Continue"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="brand-outline"
                        onClick={() => {
                          addBookToCart(requestedBook.id);
                          toast({
                            title: "Quantity updated",
                            description: `${requestedBook.title} was added again to your cart.`,
                            variant: "success",
                          });
                        }}
                      >
                        Add another copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Add more books</h2>
                  <p className="text-sm text-gray-500">Mix and match titles before moving to the student cart.</p>
                </div>
                <Badge variant="secondary">{books.length} published titles</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {books.map((book) => {
                  const isInCart = items.some((item) => item.bookId === book.id);

                  return (
                    <Card key={book.id} className="border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="mb-4 grid grid-cols-[112px_1fr] gap-4 items-start">
                          <BookCoverImage bookId={book.id} title={book.title} imageUrl={book.coverImageUrl} className="h-40 rounded-[22px] shadow-md" />
                          <div className={`rounded-[24px] bg-gradient-to-br ${book.accentFrom} ${book.accentTo} p-4 text-white`}>
                            <p className="text-xs uppercase tracking-[0.28em] text-white/70">{book.category}</p>
                            <p className="mt-6 text-xl font-bold leading-tight">{book.title}</p>
                            <p className="mt-2 text-sm text-white/80">{book.author}</p>
                          </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{book.title}</p>
                            <p className="mt-1 text-sm text-gray-500">{book.description}</p>
                          </div>
                          <span className="whitespace-nowrap text-lg font-bold text-gray-900">
                            {formatCurrency(book.price, "PHP")}
                          </span>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button
                            variant={isInCart ? "outline" : "brand"}
                            className="flex-1"
                            onClick={() => {
                              if (isInCart) {
                                removeBookFromCart(book.id);
                                toast({ title: "Removed", description: `${book.title} was removed from your cart.` });
                                return;
                              }

                              addBookToCart(book.id);
                              toast({
                                title: "Book added",
                                description: `${book.title} is ready for checkout.`,
                                variant: "success",
                              });
                            }}
                          >
                            {isInCart ? "Remove from cart" : "Add to cart"}
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/checkout?book=${book.id}`}>Buy now</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-0 shadow-xl shadow-brand-100/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Checkout summary</h2>
                    <p className="text-sm text-gray-500">Book orders live in the same cart students see in their dashboard.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                      Your cart is empty. Choose a title to start a checkout flow.
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.bookId} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.book.title}</p>
                          <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.lineTotal, "PHP")}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 rounded-2xl bg-gray-950 p-4 text-white">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, settings.currency)}</span>
                  </div>
                  <Button className="mt-4 w-full bg-white text-gray-950 hover:bg-gray-100" asChild>
                    <Link href={session?.user ? "/cart" : "/login?callbackUrl=/cart"}>
                      {session?.user ? "Open Student Cart" : "Sign In to Checkout"}
                    </Link>
                  </Button>
                  <BookCheckoutButton
                    className="mt-3 w-full"
                    variant="brand-outline"
                    items={items.map((item) => ({ bookId: item.bookId, quantity: item.quantity }))}
                  >
                    Secure checkout now
                  </BookCheckoutButton>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-emerald-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-semibold">Student-friendly purchase flow</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-900/80">
                  {settings.shippingMessage}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}