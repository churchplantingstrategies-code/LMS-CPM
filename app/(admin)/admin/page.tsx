import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type React from "react";
import {
  Users,
  GraduationCap,
  DollarSign,
  AlertTriangle,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

async function getAdminDashboardData() {
  const [
    totalStudents,
    totalCourses,
    totalEnrollments,
    completedEnrollments,
    dropoutEnrollments,
    paymentsAgg,
    recentPayments,
    lessonProgressTotal,
    lessonProgressCompleted,
    returningUsersGrouped,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.courses.count(),
    db.enrollments.count(),
    db.enrollments.count({ where: { status: "COMPLETED" } }),
    db.enrollments.count({ where: { status: { in: ["SUSPENDED", "EXPIRED"] } } }),
    db.payments.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.payments.findMany({
      where: { status: "COMPLETED" },
      include: {
        users: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.lesson_progress.count(),
    db.lesson_progress.count({ where: { completed: true } }),
    db.enrollments.groupBy({
      by: ["userId"],
      _count: { userId: true },
    }),
  ]);

  const studentProgressPct =
    lessonProgressTotal > 0
      ? Math.round((lessonProgressCompleted / lessonProgressTotal) * 100)
      : 0;

  const completionRate =
    totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

  const dropoutRate =
    totalEnrollments > 0
      ? Math.round((dropoutEnrollments / totalEnrollments) * 100)
      : 0;

  const reEnrollCount = returningUsersGrouped.filter((g: { _count: { userId: number } }) => g._count.userId >= 2).length;

  return {
    totalStudents,
    totalCourses,
    totalRevenue: paymentsAgg._sum.amount || 0,
    studentProgressPct,
    completionRate,
    dropoutRate,
    reEnrollCount,
    recentPayments,
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
        <Icon className="h-4 w-4 text-brand-400" />
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Backend control center for LMS performance, finance, and learner outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Students"
          value={data.totalStudents.toLocaleString()}
          subtitle="Total active learners"
          icon={Users}
        />
        <StatCard
          title="Courses"
          value={data.totalCourses.toLocaleString()}
          subtitle="Published + draft courses"
          icon={GraduationCap}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          subtitle="All completed payments"
          icon={DollarSign}
        />
        <StatCard
          title="Avg Student Progress"
          value={`${data.studentProgressPct}%`}
          subtitle="Across lesson tracking"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Finished Courses</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{data.completionRate}%</p>
          <p className="mt-1 text-xs text-slate-400">Completion rate across enrollments</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Dropout</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{data.dropoutRate}%</p>
          <p className="mt-1 text-xs text-slate-400">Suspended/expired enrollment ratio</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Re-enroll</p>
          <p className="mt-2 text-3xl font-bold text-sky-400">{data.reEnrollCount}</p>
          <p className="mt-1 text-xs text-slate-400">Students with 2+ enrollments</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Financial Reports</h2>
          <span className="text-xs text-slate-400">Latest completed transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-2 py-2">Payer</th>
                <th className="px-2 py-2">Description</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.length === 0 ? (
                <tr>
                  <td className="px-2 py-6 text-slate-500" colSpan={5}>
                    No payment records yet.
                  </td>
                </tr>
              ) : (
                data.recentPayments.map((payment: { id: string; users: { name: string | null; email: string }; description: string | null; amount: number; createdAt: Date }) => (
                  <tr key={payment.id} className="border-b border-slate-900 text-slate-200">
                    <td className="px-2 py-3">
                      <div className="font-medium">{payment.users.name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{payment.users.email}</div>
                    </td>
                    <td className="px-2 py-3 text-slate-300">{payment.description || "Subscription"}</td>
                    <td className="px-2 py-3 font-semibold text-emerald-400">{formatCurrency(payment.amount)}</td>
                    <td className="px-2 py-3">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">
                        COMPLETED
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-400">{formatRelativeTime(payment.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-amber-700/40 bg-amber-500/5 p-4 text-sm text-amber-100">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
          <p>
            Use <strong>Courses</strong> to create and publish learning content, <strong>Billing Setup</strong> for payments and invoices,
            <strong> Settings</strong> for API/theme/logo config, and <strong>CRM</strong> for leads/funnels/automation.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
        <div className="mb-1 flex items-center gap-2 text-slate-300">
          <RefreshCcw className="h-3.5 w-3.5" />
          Metrics update live from your database.
        </div>
        <p>Dropout = suspended + expired enrollments. Re-enroll = learners with two or more enrollments.</p>
      </div>
    </div>
  );
}
