import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminBillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const [payments, plans] = await Promise.all([
    db.payment.findMany({
      where: { status: "COMPLETED" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.plan.findMany({ orderBy: { price: "asc" } }),
  ]);

  const totalRevenue = payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Billing Setup</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure payment setup, plans, and invoice records for LMS subscriptions.
        </p>
      </div>

      <Tabs defaultValue="payment-setup" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap bg-slate-900">
          <TabsTrigger value="payment-setup">Payment Setup</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-setup" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-100">Gateway Configuration</h2>
              <div className="space-y-3 text-sm text-slate-300">
                <p>Default gateway: <strong>PayMongo</strong></p>
                <p>Currency: <strong>PHP</strong></p>
                <p>Completed transactions: <strong>{payments.length}</strong></p>
                <p>Total revenue: <strong>{formatCurrency(totalRevenue)}</strong></p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-100">Plan Pricing</h2>
              <div className="space-y-2 text-sm text-slate-300">
                {plans.length === 0 ? (
                  <p className="text-slate-500">No plans configured.</p>
                ) : (
                  plans.map((plan: { id: string; name: string; price: number }) => (
                    <div key={plan.id} className="flex items-center justify-between rounded-md border border-slate-800 px-3 py-2">
                      <span>{plan.name}</span>
                      <span>{formatCurrency(plan.price)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Invoice Ref</th>
                  <th className="px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-slate-500" colSpan={5}>
                      No completed invoice records yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment: { id: string; user: { name: string | null; email: string }; description: string | null; amount: number; paymongoInvoiceId: string | null; createdAt: Date }) => (
                    <tr key={payment.id} className="border-b border-slate-900 text-slate-200">
                      <td className="px-3 py-3">
                        <p className="font-medium">{payment.user.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{payment.user.email}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-300">{payment.description || "Subscription"}</td>
                      <td className="px-3 py-3 text-emerald-400">{formatCurrency(payment.amount)}</td>
                      <td className="px-3 py-3 text-slate-400">{payment.paymongoInvoiceId || "N/A"}</td>
                      <td className="px-3 py-3 text-slate-400">{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
