import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function TeacherPerformancePage() {
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

  const students = await db.user.findMany({
    where: {
      role: "STUDENT",
      ...(role === "INSTRUCTOR"
        ? { enrollments: { some: { courseId: { in: ownedCourseIds } } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      enrollments: { select: { id: true, status: true } },
      lessonProgress: { select: { id: true, completed: true } },
      submissions: { select: { score: true } },
    },
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Performance</h1>
        <p className="mt-1 text-sm text-gray-600">Track enrollment activity, lesson completion, and average scores.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-emerald-200 text-left text-xs uppercase tracking-wider text-emerald-700">
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Enrollments</th>
              <th className="px-3 py-3">Completed Lessons</th>
              <th className="px-3 py-3">Total Lessons Tracked</th>
              <th className="px-3 py-3">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-gray-500" colSpan={5}>No students found.</td>
              </tr>
            ) : (
              students.map((student) => {
                const completedLessons = student.lessonProgress.filter((p) => p.completed).length;
                const scored = student.submissions.filter((s) => typeof s.score === "number") as Array<{ score: number }>;
                const average = scored.length > 0 ? scored.reduce((sum, s) => sum + s.score, 0) / scored.length : null;

                return (
                  <tr key={student.id} className="border-b border-gray-200 text-gray-900">
                    <td className="px-3 py-3">
                      <p className="font-medium">{student.name || "Unnamed"}</p>
                      <p className="text-xs text-gray-600">{student.email}</p>
                    </td>
                    <td className="px-3 py-3">{student.enrollments.length}</td>
                    <td className="px-3 py-3">{completedLessons}</td>
                    <td className="px-3 py-3">{student.lessonProgress.length}</td>
                    <td className="px-3 py-3">{average === null ? "—" : average.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
