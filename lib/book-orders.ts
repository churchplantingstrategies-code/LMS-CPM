import { promises as fs } from "fs";
import path from "path";
import { BookRecord } from "@/types/books";
import { BookOrderItem, BookOrderRecord, BookOrdersData, BookOrderStatus, BookSalesMetrics } from "@/types/book-orders";

const DATA_PATH = path.join(process.cwd(), "data", "book-orders.json");

function nowIso() {
  return new Date().toISOString();
}

function emptyOrdersData(): BookOrdersData {
  return {
    orders: [],
    updatedAt: nowIso(),
  };
}

async function ensureDirExists(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function sanitizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeItem(input: Partial<BookOrderItem>): BookOrderItem {
  const quantity = Math.max(1, Math.trunc(sanitizeNumber(input.quantity, 1)));
  const unitPrice = Math.max(0, sanitizeNumber(input.unitPrice, 0));

  return {
    bookId: String(input.bookId ?? "").trim(),
    title: String(input.title ?? "Untitled Book").trim() || "Untitled Book",
    quantity,
    unitPrice,
    lineTotal: Math.max(0, sanitizeNumber(input.lineTotal, unitPrice * quantity)),
    coverImageUrl: String(input.coverImageUrl ?? "").trim() || undefined,
  };
}

function sanitizeOrder(input: Partial<BookOrderRecord>): BookOrderRecord {
  const timestamp = nowIso();

  return {
    id: String(input.id ?? `order-${Date.now()}`).trim(),
    orderNumber: String(input.orderNumber ?? `BK-${Date.now()}`).trim(),
    userId: String(input.userId ?? "").trim(),
    email: String(input.email ?? "").trim(),
    name: String(input.name ?? "Customer").trim() || "Customer",
    status: (["PENDING", "COMPLETED", "FAILED", "CANCELED"] as const).includes(input.status as BookOrderStatus)
      ? (input.status as BookOrderStatus)
      : "PENDING",
    items: Array.isArray(input.items) ? input.items.map((item) => sanitizeItem(item)) : [],
    subtotal: Math.max(0, sanitizeNumber(input.subtotal, 0)),
    currency: String(input.currency ?? "PHP").trim().toUpperCase() || "PHP",
    paymongoCheckoutSessionId: String(input.paymongoCheckoutSessionId ?? "").trim() || null,
    completedAt: input.completedAt ? String(input.completedAt).trim() : null,
    createdAt: String(input.createdAt ?? timestamp),
    updatedAt: String(input.updatedAt ?? timestamp),
  };
}

function sanitizeOrdersData(input: Partial<BookOrdersData>): BookOrdersData {
  return {
    orders: Array.isArray(input.orders) ? input.orders.map((order) => sanitizeOrder(order)) : [],
    updatedAt: nowIso(),
  };
}

export async function readBookOrders(): Promise<BookOrdersData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return sanitizeOrdersData(JSON.parse(raw) as Partial<BookOrdersData>);
  } catch {
    const fallback = emptyOrdersData();
    await writeBookOrders(fallback);
    return fallback;
  }
}

export async function writeBookOrders(input: Partial<BookOrdersData>) {
  const payload = sanitizeOrdersData(input);
  await ensureDirExists(DATA_PATH);
  await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

export async function createBookOrder({
  userId,
  email,
  name,
  items,
  currency,
}: {
  userId: string;
  email: string;
  name?: string | null;
  items: BookOrderItem[];
  currency?: string;
}) {
  const orders = await readBookOrders();
  const timestamp = Date.now();
  const createdAt = nowIso();
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const order = sanitizeOrder({
    id: `book-order-${timestamp}`,
    orderNumber: `BK-${timestamp}`,
    userId,
    email,
    name: name ?? email,
    status: "PENDING",
    items,
    subtotal,
    currency: currency ?? "PHP",
    createdAt,
    updatedAt: createdAt,
  });

  await writeBookOrders({ ...orders, orders: [order, ...orders.orders] });
  return order;
}

export async function updateBookOrderCheckoutSession(orderId: string, checkoutSessionId: string) {
  const orders = await readBookOrders();
  let updatedOrder: BookOrderRecord | null = null;

  const nextOrders = orders.orders.map((order) => {
    if (order.id !== orderId) return order;

    updatedOrder = sanitizeOrder({
      ...order,
      paymongoCheckoutSessionId: checkoutSessionId,
      updatedAt: nowIso(),
    });

    return updatedOrder;
  });

  await writeBookOrders({ ...orders, orders: nextOrders });
  return updatedOrder;
}

export async function updateBookOrderStatus({
  orderId,
  checkoutSessionId,
  status,
}: {
  orderId?: string;
  checkoutSessionId?: string;
  status: BookOrderStatus;
}) {
  const orders = await readBookOrders();
  const timestamp = nowIso();
  let updatedOrder: BookOrderRecord | null = null;

  const nextOrders = orders.orders.map((order) => {
    const matches = (orderId && order.id === orderId) || (checkoutSessionId && order.paymongoCheckoutSessionId === checkoutSessionId);
    if (!matches) return order;

    updatedOrder = sanitizeOrder({
      ...order,
      status,
      completedAt: status === "COMPLETED" ? order.completedAt ?? timestamp : order.completedAt,
      updatedAt: timestamp,
    });

    return updatedOrder;
  });

  await writeBookOrders({ ...orders, orders: nextOrders });
  return updatedOrder;
}

export async function findBookOrderById(orderId: string) {
  const orders = await readBookOrders();
  return orders.orders.find((order) => order.id === orderId) ?? null;
}

export async function listBookOrdersForUser(userId: string) {
  const orders = await readBookOrders();
  return orders.orders
    .filter((order) => order.userId === userId)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export async function listAllBookOrders() {
  const orders = await readBookOrders();
  return [...orders.orders].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export function buildBookSalesMetrics(books: BookRecord[], orders: BookOrderRecord[]) {
  const metrics = new Map<string, BookSalesMetrics>();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (const book of books) {
    metrics.set(book.id, {
      monthlySales: 0,
      yearlySales: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      totalSales: 0,
      totalRevenue: 0,
    });
  }

  for (const order of orders) {
    if (order.status !== "COMPLETED") continue;

    const completedDate = new Date(order.completedAt ?? order.updatedAt ?? order.createdAt);
    const isCurrentYear = completedDate.getFullYear() === currentYear;
    const isCurrentMonth = isCurrentYear && completedDate.getMonth() === currentMonth;

    for (const item of order.items) {
      const current = metrics.get(item.bookId);
      if (!current) continue;

      current.totalSales += item.quantity;
      current.totalRevenue += item.lineTotal;

      if (isCurrentYear) {
        current.yearlySales += item.quantity;
        current.yearlyRevenue += item.lineTotal;
      }

      if (isCurrentMonth) {
        current.monthlySales += item.quantity;
        current.monthlyRevenue += item.lineTotal;
      }
    }
  }

  return metrics;
}