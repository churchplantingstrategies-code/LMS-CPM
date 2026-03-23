import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "outline" | "secondary"> = {
  ACTIVE: "success",
  TRIALING: "brand" as "success",
  PAST_DUE: "warning",
  CANCELED: "destructive",
  INCOMPLETE: "outline",
  PAUSED: "secondary",
  UNPAID: "destructive",
};

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      plan: { select: { name: true, price: true, interval: true } },
    },
  });

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const mrr = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-1">{subscriptions.length} total</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(mrr)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Churn Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {subscriptions.length > 0
              ? `${((subscriptions.filter((s) => s.status === "CANCELED").length / subscriptions.length) * 100).toFixed(1)}%`
              : "0%"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead>Renews / Ends</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No subscriptions yet.
                </TableCell>
              </TableRow>
            )}
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{sub.user.name ?? "—"}</div>
                  <div className="text-xs text-gray-400">{sub.user.email}</div>
                </TableCell>
                <TableCell className="text-gray-700">{sub.plan?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[sub.status] ?? "outline"}>{sub.status}</Badge>
                </TableCell>
                <TableCell className="text-gray-700">
                  {sub.plan ? formatCurrency(sub.plan.price) + "/" + sub.plan.interval.toLowerCase() : "—"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {sub.currentPeriodStart ? formatDate(sub.currentPeriodStart) : "—"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {sub.cancelAtPeriodEnd ? (
                    <span className="text-red-500">
                      Ends {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"}
                    </span>
                  ) : (
                    sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
