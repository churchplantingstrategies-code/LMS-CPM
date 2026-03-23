import Link from "next/link";
import { auth } from "@/lib/auth";
import { listAllBookOrders } from "@/lib/book-orders";
import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOrdersManager } from "@/components/admin/book-orders-manager";

const statusVariant = {
  PENDING: "secondary",
  COMPLETED: "success",
  FAILED: "destructive",
  CANCELED: "outline",
} as const;

export default async function AdminBookOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const orders = await listAllBookOrders();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Book Orders</h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspect bookstore orders, payment status, customer details, and downloadable receipts.
          </p>
        </div>
        <Button variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500" asChild>
          <Link href="/admin/books">Back to Books</Link>
        </Button>
      </div>

      <BookOrdersManager orders={orders} />

      <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
            <Clock3 className="mt-0.5 h-4 w-4 text-amber-300" />
            Pending orders update automatically after PayMongo confirms payment through the webhook handler.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
