import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { StudentCartPanel } from "@/components/books/student-cart-panel";
import { CreditCard, Calendar, CheckCircle } from "lucide-react";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [subscription, payments] = await Promise.all([
    db.subscription.findFirst({
      where: { userId: session.user.id, status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subscription and view payment history</p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          Current Plan
        </h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">{subscription.plan?.name}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(subscription.plan?.price ?? 0)}/{subscription.plan?.interval.toLowerCase()}
                </p>
              </div>
              <Badge
                variant={subscription.status === "ACTIVE" ? "success" : subscription.status === "PAST_DUE" ? "warning" : "secondary"}
              >
                {subscription.status}
              </Badge>
            </div>

            {subscription.plan?.features && (
              <ul className="grid grid-cols-2 gap-2">
                {(subscription.plan.features as string[]).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {subscription.cancelAtPeriodEnd ? (
                  <span className="text-red-500">
                    Cancels on {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "—"}
                  </span>
                ) : (
                  <span>
                    Renews {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "—"}
                  </span>
                )}
              </div>
              <BillingPortalButton />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You are on the Free plan.</p>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Upgrade Plan
            </a>
          </div>
        )}
      </div>

      <StudentCartPanel />

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="divide-y">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.description ?? (payment.type === "SUBSCRIPTION" ? "Subscription" : "Payment")}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </p>
                  <Badge variant="success" className="text-xs">Paid</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
