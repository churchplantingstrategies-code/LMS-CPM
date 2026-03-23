import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { EnrollmentChart } from "@/components/dashboard/enrollment-chart";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Award,
  Mail,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    newUsers30d,
    totalCourses,
    totalEnrollments,
    newEnrollments30d,
    totalRevenue,
    revenue30d,
    totalLeads,
    newLeads30d,
    certificates,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.courses.count({ where: { isPublished: true } }),
    db.enrollments.count(),
    db.enrollments.count({ where: { enrolledAt: { gte: thirtyDaysAgo } } }),
    db.payments.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    db.payments.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
    }),
    db.leads.count(),
    db.leads.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.certificates.count(),
  ]);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      sub: `+${newUsers30d} this month`,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue._sum.amount ?? 0),
      sub: `${formatCurrency(revenue30d._sum.amount ?? 0)} this month`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Enrollments",
      value: totalEnrollments.toLocaleString(),
      sub: `+${newEnrollments30d} this month`,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Published Courses",
      value: totalCourses.toLocaleString(),
      sub: "Currently active",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Leads Captured",
      value: totalLeads.toLocaleString(),
      sub: `+${newLeads30d} this month`,
      icon: MousePointerClick,
      color: "bg-pink-100 text-pink-600",
    },
    {
      label: "Certificates Issued",
      value: certificates.toLocaleString(),
      sub: "All time",
      icon: Award,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className={`rounded-full p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Revenue (Last 12 Months)
          </h2>
          <RevenueChart />
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Enrollments (Last 12 Months)
          </h2>
          <EnrollmentChart />
        </div>
      </div>

      {/* Top courses */}
      <TopCoursesSection />
    </div>
  );
}

async function TopCoursesSection() {
  const topCourses = await db.courses.findMany({
    where: { isPublished: true },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="rounded-lg border bg-white shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="h-4 w-4 text-gray-400" />
        Top Courses by Enrollment
      </h2>
      <div className="space-y-3">
        {topCourses.map((course, i) => (
          <div key={course.id} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400 w-5">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {course.title}
                </span>
                <span className="text-sm text-gray-500 ml-4 flex-shrink-0">
                  {course._count.enrollments} enrolled
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (course._count.enrollments / (topCourses[0]?._count.enrollments || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {topCourses.length === 0 && (
          <p className="text-sm text-gray-400">No courses yet.</p>
        )}
      </div>
    </div>
  );
}
