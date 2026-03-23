import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseCreateForm } from "@/components/admin/course-create-form";

export default async function TeacherCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const allCourses = await db.courses.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      category: true,
      isPublished: true,
      metadata: true,
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  const courses = (role === "INSTRUCTOR"
    ? allCourses.filter((course) => {
        const metadata = course.metadata as { createdByUserId?: string } | null;
        return metadata?.createdByUserId === session.user.id;
      })
    : allCourses).slice(0, 50);

  const ownershipHint =
    role === "INSTRUCTOR"
      ? "Showing only courses you created."
      : "Showing all courses (admin/super admin view).";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Courses</h1>
        <p className="mt-1 text-sm text-gray-600">Create courses and manage lesson structures for students.</p>
        <p className="mt-1 text-xs text-gray-500">{ownershipHint}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-emerald-200 text-left text-xs uppercase tracking-wider text-emerald-700">
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Modules</th>
              <th className="px-3 py-3">Enrollments</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-gray-500" colSpan={4}>No courses yet.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-200 text-gray-900">
                  <td className="px-3 py-3">
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-gray-600">{course.category || "Uncategorized"}</p>
                  </td>
                  <td className="px-3 py-3">{course._count.modules}</td>
                  <td className="px-3 py-3">{course._count.enrollments}</td>
                  <td className="px-3 py-3">{course.isPublished ? "Published" : "Draft"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CourseCreateForm />
    </div>
  );
}
