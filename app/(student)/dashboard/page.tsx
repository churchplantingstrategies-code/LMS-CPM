import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen, Clock, Award, TrendingUp, Play, ArrowRight, CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StudentCartPanel } from "@/components/books/student-cart-panel";
import { StudentBookShowcase } from "@/components/books/student-book-showcase";
import { formatRelativeTime, calculateProgress } from "@/lib/utils";

async function getStudentData(userId: string) {
  const [enrollments, recentProgress, certificates] = await Promise.all([
    db.enrollments.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        courses: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 6,
    }),
    db.lesson_progress.findMany({
      where: { userId, completed: true },
      include: { lessons: { include: { modules: { include: { courses: true } } } } },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    db.certificates.findMany({
      where: { userId },
      include: { courses: true },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  // Calculate per-course progress
  const coursesWithProgress = enrollments.map((enrollment) => {
    const totalLessons = enrollment.courses.modules.reduce(
      (acc, m) => acc + m.lessons.length, 0
    );
    return { enrollment, totalLessons };
  });

  return {
    enrollments,
    coursesWithProgress,
    recentProgress,
    certificates,
    totalLessonsCompleted: await db.lesson_progress.count({
      where: { userId, completed: true },
    }),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getStudentData(session.user.id);

  const stats = [
    {
      label: "Courses Enrolled",
      value: data.enrollments.length,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Lessons Completed",
      value: data.totalLessonsCompleted,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Certificates Earned",
      value: data.certificates.length,
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Learning Streak",
      value: "7 days",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Welcome back, {session.user.name?.split(" ")[0] || "Learner"}! 👋
        </h1>
        <p className="text-gray-500 mt-1 dark:text-slate-400">Here&apos;s what&apos;s happening with your learning today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5 dark:text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Continue Learning</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          {data.enrollments.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-700 mb-1">No courses yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start your learning journey today!</p>
                <Button variant="brand" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.enrollments.slice(0, 4).map(({ courses, enrolledAt }) => {
                const totalLessons = courses.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                const progressPct = calculateProgress(0, totalLessons); // Would need real data
                return (
                  <Card key={courses.id} className="border-0 shadow-sm overflow-hidden card-hover">
                    <div className="h-32 bg-gradient-to-br from-brand-500 to-purple-600 relative">
                      {courses.thumbnail ? (
                        <img src={courses.thumbnail} alt={courses.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white text-brand-600 hover:bg-brand-50 shadow-md"
                        asChild
                      >
                        <Link href={`/courses/${courses.id}`}>
                          <Play className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <CardContent className="pt-3 pb-4">
                      <Badge variant="brand" className="text-xs mb-2">{courses.level}</Badge>
                      <h3 className="font-semibold text-sm truncate">{courses.title}</h3>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{progressPct}% complete</span>
                          <span>{totalLessons} lessons</span>
                        </div>
                        <Progress value={progressPct} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StudentCartPanel compact />
          <StudentBookShowcase />

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-100">Recent Activity</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                {data.recentProgress.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentProgress.map((progress) => (
                      <div key={progress.id} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{progress.lessons.title}</p>
                          <p className="text-xs text-gray-400">
                            {progress.lessons.modules.courses.title} ·{" "}
                            {progress.completedAt && formatRelativeTime(progress.completedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Certificates */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-100">Certificates</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                {data.certificates.length === 0 ? (
                  <div className="text-center py-4">
                    <Award className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Complete a course to earn your first certificate!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-50">
                        <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cert.courses.title}</p>
                          <p className="text-xs text-gray-400">{formatRelativeTime(cert.issuedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
