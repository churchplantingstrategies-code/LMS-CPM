export type BookOrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELED";

export type BookOrderItem = {
  bookId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  coverImageUrl?: string;
};

export type BookOrderRecord = {
  id: string;
  orderNumber: string;
  userId: string;
  email: string;
  name: string;
  status: BookOrderStatus;
  items: BookOrderItem[];
  subtotal: number;
  currency: string;
  paymongoCheckoutSessionId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookOrdersData = {
  orders: BookOrderRecord[];
  updatedAt: string;
};

export type BookSalesMetrics = {
  monthlySales: number;
  yearlySales: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalSales: number;
  totalRevenue: number;
};