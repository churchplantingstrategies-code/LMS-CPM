"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useBookCart } from "@/components/books/use-book-cart";

export function StudentCartLink() {
  const { itemCount } = useBookCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
      aria-label="Open checkout cart"
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
        {itemCount}
      </span>
    </Link>
  );
}