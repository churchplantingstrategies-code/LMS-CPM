import Link from "next/link";
import { auth } from "@/lib/auth";
import { listBookOrdersForUser } from "@/lib/book-orders";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Clock3, Download, ShoppingBag } from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant = {
  PENDING: "secondary",
  COMPLETED: "success",
  FAILED: "destructive",
  CANCELED: "outline",
} as const;

export default async function StudentOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await listBookOrdersForUser(session.user.id);
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const totalItems = completedOrders.reduce((sum, order) => sum + order.items.reduce((inner, item) => inner + item.quantity, 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="brand" className="mb-3">Student Orders</Badge>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Review completed and pending book purchases from your bookstore checkout flow.
          </p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/checkout">Browse bookstore</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Completed Orders" value={String(completedOrders.length)} icon={CheckCircle2} accent="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="Books Purchased" value={String(totalItems)} icon={BookOpen} accent="text-brand-600" bg="bg-brand-50" />
        <SummaryCard label="Total Spent" value={formatCurrency(totalSpent, "PHP")} icon={ShoppingBag} accent="text-amber-600" bg="bg-amber-50" />
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-14 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">No bookstore orders yet</h2>
            <p className="mt-2 text-sm text-gray-500">Once you buy books, they will appear here with totals and status.</p>
            <Button className="mt-5" variant="brand" asChild>
              <Link href="/checkout">Start a book order</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h2>
                      <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Ordered on {formatDate(new Date(order.createdAt))}
                      {order.completedAt ? ` · Completed ${formatDate(new Date(order.completedAt))}` : ""}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Order Total</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(order.subtotal, order.currency)}</p>
                    <Button className="mt-3" variant="outline" size="sm" asChild>
                      <a href={`/api/book-orders/${order.id}/receipt`}>
                        <Download className="mr-2 h-4 w-4" />
                        {order.status === "COMPLETED" ? "Download Receipt" : "Download Invoice"}
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.bookId}`} className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <BookCoverImage bookId={item.bookId} title={item.title} imageUrl={item.coverImageUrl} className="h-24 w-16 flex-shrink-0 rounded-[16px] shadow-sm" />
                        <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          <p className="mt-1 text-sm text-gray-500">Qty {item.quantity} · {formatCurrency(item.unitPrice, order.currency)} each</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Line Total</p>
                        <p className="mt-1 font-semibold text-gray-900">{formatCurrency(item.lineTotal, order.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.status === "PENDING" ? (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <Clock3 className="h-4 w-4" />
                    Payment is still pending. This order will update automatically after payment confirmation.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
  bg,
}: {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
  accent: string;
  bg: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className={`rounded-lg p-2 ${bg}`}>
            <Icon className={`h-5 w-5 ${accent}`} />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="mt-0.5 text-sm text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );
}