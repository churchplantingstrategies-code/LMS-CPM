import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  let ownedCourseIds: string[] = [];
  if (role === "INSTRUCTOR") {
    const courses = await db.course.findMany({
      select: { id: true, metadata: true },
      take: 500,
    });
    ownedCourseIds = courses
      .filter((course) => {
        const metadata = course.metadata as { createdByUserId?: string } | null;
        return metadata?.createdByUserId === session.user.id;
      })
      .map((course) => course.id);
  }

  const [courseCount, studentCount, submissionsToGrade, discussionCount] = await Promise.all([
    role === "INSTRUCTOR"
      ? Promise.resolve(ownedCourseIds.length)
      : db.course.count(),
    role === "INSTRUCTOR"
      ? db.user.count({
          where: {
            role: "STUDENT",
            enrollments: { some: { courseId: { in: ownedCourseIds } } },
          },
        })
      : db.user.count({ where: { role: "STUDENT" } }),
    role === "INSTRUCTOR"
      ? db.submission.count({
          where: {
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
            assignment: { lesson: { module: { courseId: { in: ownedCourseIds } } } },
          },
        })
      : db.submission.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    role === "INSTRUCTOR"
      ? db.discussion.count({ where: { courseId: { in: ownedCourseIds } } })
      : db.discussion.count(),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Manage courses, review student progress, grade submissions, and engage in discussions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Courses</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">{courseCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Students</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">{studentCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Pending Grading</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">{submissionsToGrade}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Discussions</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">{discussionCount}</p>
        </div>
      </div>
    </div>
  );
}
