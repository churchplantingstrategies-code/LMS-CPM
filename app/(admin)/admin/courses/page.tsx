import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCreateForm } from "@/components/admin/course-create-form";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams?: { demo?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const courses = await db.courses.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Courses</h1>
          <p className="mt-1 text-sm text-slate-400">
            LMS course manager with creation setup, video provider links, and publishing controls.
          </p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/api/admin/courses/demo">Create Demo Course</Link>
        </Button>
      </div>

      {searchParams?.demo ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Demo course is ready for student enrollment and progress testing.
        </div>
      ) : null}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap bg-slate-900">
          <TabsTrigger value="list">Course List</TabsTrigger>
          <TabsTrigger value="create">Create Course Setup</TabsTrigger>
          <TabsTrigger value="content">LMS Content Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Modules</th>
                  <th className="px-3 py-3">Enrollments</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-slate-500" colSpan={6}>
                      No courses yet. Use Create Course Setup tab to add your first course.
                    </td>
                  </tr>
                ) : (
                  courses.map((course: { id: string; title: string; category: string | null; price: number | null; isPublished: boolean; _count: { modules: number; enrollments: number } }) => (
                    <tr key={course.id} className="border-b border-slate-900 text-slate-200">
                      <td className="px-3 py-3">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.category || "Uncategorized"}</p>
                      </td>
                      <td className="px-3 py-3">
                        {course.price ? `PHP ${course.price.toFixed(2)}` : "Free"}
                      </td>
                      <td className="px-3 py-3">{course._count.modules}</td>
                      <td className="px-3 py-3">{course._count.enrollments}</td>
                      <td className="px-3 py-3">
                        {course.isPublished ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/courses/${course.id}`}>Preview</Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <CourseCreateForm />
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-100">LMS Content Rules</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Course flow: Course -&gt; Modules -&gt; Lessons -&gt; Assignments/Quiz.</li>
              <li>Recommended video length: 5-20 minutes per lesson.</li>
              <li>Require lesson completion before next module unlock.</li>
              <li>Attach downloadable resources and discussion prompts per lesson.</li>
              <li>Enable completion certificates for milestone and final assessments.</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
