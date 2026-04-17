"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, CheckCircle2, Download, GraduationCap, ReceiptText, Search, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookOrderRecord, BookOrderStatus } from "@/types/book-orders";

const statusVariant = {
  PENDING: "secondary",
  COMPLETED: "success",
  FAILED: "destructive",
  CANCELED: "outline",
} as const;

const statusOptions: Array<{ label: string; value: "ALL" | BookOrderStatus }> = [
  { label: "All statuses", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Canceled", value: "CANCELED" },
];

const presetRanges = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last-7" },
  { label: "Last 30 Days", value: "last-30" },
  { label: "This Month", value: "this-month" },
] as const;

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookOrdersManager({ orders }: { orders: BookOrderRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | BookOrderStatus>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function applyPresetRange(preset: (typeof presetRanges)[number]["value"]) {
    const now = new Date();
    const today = toInputDate(now);

    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
      return;
    }

    if (preset === "last-7") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setStartDate(toInputDate(start));
      setEndDate(today);
      return;
    }

    if (preset === "last-30") {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      setStartDate(toInputDate(start));
      setEndDate(today);
      return;
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(toInputDate(startOfMonth));
    setEndDate(today);
  }

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const startTimestamp = startDate ? Date.parse(`${startDate}T00:00:00`) : null;
    const endTimestamp = endDate ? Date.parse(`${endDate}T23:59:59.999`) : null;

    return orders.filter((order) => {
      const matchesStatus = status === "ALL" || order.status === status;
      if (!matchesStatus) return false;

      const createdAt = Date.parse(order.createdAt);
      if (startTimestamp !== null && createdAt < startTimestamp) return false;
      if (endTimestamp !== null && createdAt > endTimestamp) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        order.orderNumber,
        order.name,
        order.email,
        order.status,
        ...order.items.map((item) => item.title),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [orders, query, status, startDate, endDate]);

  const completedOrders = filteredOrders.filter((order) => order.status === "COMPLETED");
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const itemVolume = completedOrders.reduce((sum, order) => sum + order.items.reduce((inner, item) => inner + item.quantity, 0), 0);

  function exportCsv() {
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const header = [
      "Order Number",
      "Customer",
      "Email",
      "Status",
      "Created At",
      "Completed At",
      "Currency",
      "Subtotal",
      "Items",
    ];
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.name,
      order.email,
      order.status,
      order.createdAt,
      order.completedAt ?? "",
      order.currency,
      order.subtotal,
      order.items.map((item) => `${item.title} x${item.quantity}`).join("; "),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `book-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Completed Orders" value={String(completedOrders.length)} icon={CheckCircle2} />
        <MetricCard label="Books Sold" value={String(itemVolume)} icon={BookOpen} />
        <MetricCard label="Book Revenue" value={formatCurrency(totalRevenue, "PHP")} icon={ShoppingBag} />
      </div>

      <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
                <GraduationCap className="h-3.5 w-3.5" />
                Bookstore Ops
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white">Church Planting Movement order command center</h2>
              <p className="mt-1 text-sm text-slate-400">Filter, export, and verify bookstore payments without leaving the dashboard.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300">
                <CalendarDays className="h-3.5 w-3.5 text-brand-300" />
                Quick ranges
              </div>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"
                  onClick={() => applyPresetRange(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 xl:grid-cols-[1fr_220px_180px_180px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by order number, customer, email, or book title"
                className="border-slate-700 bg-slate-950 pl-10 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "ALL" | BookOrderStatus)}
              className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="border-slate-700 bg-slate-950 text-slate-100"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="border-slate-700 bg-slate-950 text-slate-100"
            />
            <Button
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500"
              onClick={exportCsv}
              disabled={filteredOrders.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"
              onClick={() => {
                setQuery("");
                setStatus("ALL");
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>Showing {filteredOrders.length} of {orders.length} bookstore orders.</p>
            {(startDate || endDate) ? (
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Window {startDate || "Any time"} to {endDate || "Present"}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-4 text-lg font-semibold">No matching orders</p>
              <p className="mt-2 text-sm text-slate-400">Adjust the search or status filter to see more results.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-[0.24em] text-slate-400">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-900 text-slate-200">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-slate-500">{order.items.length} title{order.items.length === 1 ? "" : "s"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{order.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{order.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <p key={`${order.id}-${item.bookId}`} className="text-xs text-slate-300">{item.title} x{item.quantity}</p>
                          ))}
                          {order.items.length > 2 ? <p className="text-xs text-slate-500">+{order.items.length - 2} more</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-emerald-400">{formatCurrency(order.subtotal, order.currency)}</td>
                      <td className="px-4 py-4"><Badge variant={statusVariant[order.status]}>{order.status}</Badge></td>
                      <td className="px-4 py-4 text-slate-400">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-4">
                        <Button variant="outline" size="sm" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500" asChild>
                          <a href={`/api/book-orders/${order.id}/receipt`}>Download PDF</a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ReceiptText;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <Icon className="h-4 w-4 text-brand-400" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}