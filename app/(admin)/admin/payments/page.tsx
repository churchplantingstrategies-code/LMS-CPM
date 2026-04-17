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

const statusVariant: Record<string, "success" | "destructive" | "outline" | "warning"> = {
  COMPLETED: "success",
  FAILED: "destructive",
  PENDING: "outline",
  REFUNDED: "warning",
};

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const payments = await db.payments.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      users: { select: { name: true, email: true } },
    },
  });

  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">
          {payments.length} transactions · {formatCurrency(totalRevenue)} total revenue
        </p>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No payments yet.
                </TableCell>
              </TableRow>
            )}
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{payment.users.name ?? "—"}</div>
                  <div className="text-xs text-gray-400">{payment.users.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {payment.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 text-sm max-w-[200px] truncate">
                  {payment.description ?? (payment.type === "SUBSCRIPTION" ? "Subscription" : "—")}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[payment.status] ?? "outline"}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {formatDate(payment.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
