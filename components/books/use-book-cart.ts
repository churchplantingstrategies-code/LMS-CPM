"use client";

import { useEffect, useState } from "react";
import { usePublicBooks } from "@/components/books/use-public-books";
import { BookRecord } from "@/types/books";

const BOOK_CART_STORAGE_KEY = "ediscipleship-book-cart";
const BOOK_CART_EVENT = "ediscipleship-book-cart-updated";

type StoredBookCartItem = {
  bookId: string;
  quantity: number;
};

export type BookCartItem = {
  bookId: string;
  quantity: number;
  book: BookRecord;
  lineTotal: number;
};

function emitBookCartUpdate() {
  window.dispatchEvent(new Event(BOOK_CART_EVENT));
}

function readStoredBookCart(): StoredBookCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(BOOK_CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredBookCartItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item.bookId && item.quantity > 0);
  } catch {
    return [];
  }
}

function writeStoredBookCart(items: StoredBookCartItem[]) {
  window.localStorage.setItem(BOOK_CART_STORAGE_KEY, JSON.stringify(items));
  emitBookCartUpdate();
}

function updateStoredBookCart(updater: (items: StoredBookCartItem[]) => StoredBookCartItem[]) {
  const nextItems = updater(readStoredBookCart());
  writeStoredBookCart(nextItems);
}

export function addBookToCart(bookId: string, quantity = 1) {
  updateStoredBookCart((items) => {
    const nextItems = [...items];
    const existingItem = nextItems.find((item) => item.bookId === bookId);

    if (existingItem) {
      existingItem.quantity += quantity;
      return nextItems;
    }

    return [...nextItems, { bookId, quantity }];
  });
}

export function removeBookFromCart(bookId: string) {
  updateStoredBookCart((items) => items.filter((item) => item.bookId !== bookId));
}

export function setBookQuantity(bookId: string, quantity: number) {
  if (quantity <= 0) {
    removeBookFromCart(bookId);
    return;
  }

  updateStoredBookCart((items) =>
    items.map((item) => (item.bookId === bookId ? { ...item, quantity } : item))
  );
}

export function clearBookCart() {
  writeStoredBookCart([]);
}

export function useBookCart() {
  const [items, setItems] = useState<BookCartItem[]>([]);
  const { books, loading: catalogLoading } = usePublicBooks();

  useEffect(() => {
    const syncCart = () => {
      const nextItems = readStoredBookCart()
        .map((item) => {
          const book = books.find((entry) => entry.id === item.bookId);
          if (!book) return null;

          return {
            ...item,
            book,
            lineTotal: book.price * item.quantity,
          };
        })
        .filter((item): item is BookCartItem => item !== null);

      setItems(nextItems);
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(BOOK_CART_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(BOOK_CART_EVENT, syncCart);
    };
  }, [books]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  return {
    items,
    books,
    catalogLoading,
    itemCount,
    subtotal,
    addBookToCart,
    removeBookFromCart,
    setBookQuantity,
    clearBookCart,
  };
}