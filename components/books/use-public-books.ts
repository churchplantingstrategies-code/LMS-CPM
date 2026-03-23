"use client";

import { useCallback, useEffect, useState } from "react";
import { BookRecord, BookStoreSettings, PublicBookStoreData } from "@/types/books";

const DEFAULT_SETTINGS: BookStoreSettings = {
  currency: "PHP",
  storeName: "eDiscipleship Books",
  storefrontHeadline: "Books for discipleship, leadership, and ministry growth.",
  supportEmail: "books@ediscipleship.local",
  returnPolicy: "Digital book purchases are final unless a file is defective or inaccessible.",
  shippingMessage: "Digital delivery is instant after checkout. Physical shipping can be configured later.",
  featuredCollectionTitle: "Books Handpicked for Leaders",
  lowStockThreshold: 20,
  showAuthorsOnCards: true,
  showBookFormats: true,
  enableRecommendations: true,
  enableBestsellersStrip: true,
  allowPreorders: false,
  inventoryTrackingEnabled: true,
};

const EMPTY_DATA: PublicBookStoreData = {
  books: [],
  settings: DEFAULT_SETTINGS,
  updatedAt: "",
};

export function usePublicBooks() {
  const [data, setData] = useState<PublicBookStoreData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/books", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load books");
      }

      const next = (await response.json()) as PublicBookStoreData;
      setData(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 15000);
    return () => window.clearInterval(interval);
  }, [load]);

  return {
    books: data.books,
    settings: data.settings,
    updatedAt: data.updatedAt,
    loading,
    refresh: load,
  };
}

export function findBookById(books: BookRecord[], bookId: string | null) {
  if (!bookId) return null;
  return books.find((book) => book.id === bookId) ?? null;
}