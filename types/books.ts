export type BookStatus = "DRAFT" | "PUBLISHED";

export type BookFormat = "EBOOK" | "PAPERBACK" | "HARDCOVER" | "AUDIOBOOK";

export type BookRecord = {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImageUrl?: string;
  price: number;
  pages: number;
  accentFrom: string;
  accentTo: string;
  summary: string;
  description: string;
  tagline: string;
  sku: string;
  isbn: string;
  language: string;
  format: BookFormat;
  inventory: number;
  featured: boolean;
  allowDiscounts: boolean;
  status: BookStatus;
  publishedAt: string | null;
  releaseDate: string | null;
  monthlySales: number;
  yearlySales: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
};

export type BookStoreSettings = {
  currency: string;
  storeName: string;
  storefrontHeadline: string;
  supportEmail: string;
  returnPolicy: string;
  shippingMessage: string;
  featuredCollectionTitle: string;
  lowStockThreshold: number;
  showAuthorsOnCards: boolean;
  showBookFormats: boolean;
  enableRecommendations: boolean;
  enableBestsellersStrip: boolean;
  allowPreorders: boolean;
  inventoryTrackingEnabled: boolean;
};

export type BookStoreData = {
  books: BookRecord[];
  settings: BookStoreSettings;
  updatedAt: string;
};

export type PublicBookStoreData = {
  books: BookRecord[];
  settings: BookStoreSettings;
  updatedAt: string;
};