import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function gradeSubmissionAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return;
  }

  const submissionId = String(formData.get("submissionId") || "");
  const scoreValue = Number(formData.get("score") || 0);
  const feedback = String(formData.get("feedback") || "");

  if (!submissionId) return;

  await db.submission.update({
    where: { id: submissionId },
    data: {
      score: Number.isFinite(scoreValue) ? scoreValue : null,
      feedback: feedback || null,
      status: "GRADED",
      gradedAt: new Date(),
    },
  });

  revalidatePath("/teacher/grading");
}

export default async function TeacherGradingPage() {
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

  const submissions = await db.submission.findMany({
    where:
      role === "INSTRUCTOR"
        ? { assignment: { lesson: { module: { courseId: { in: ownedCourseIds } } } } }
        : undefined,
    orderBy: { submittedAt: "desc" },
    take: 40,
    include: {
      user: { select: { name: true, email: true } },
      assignment: {
        select: {
          title: true,
          maxScore: true,
          lesson: {
            select: {
              title: true,
              module: { select: { title: true, course: { select: { title: true } } } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grading System</h1>
        <p className="mt-1 text-sm text-gray-600">Review submissions and publish scores with feedback.</p>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-gray-600">No submissions yet.</div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="rounded-xl border border-emerald-200 bg-white p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">{submission.assignment.title}</p>
                <p className="text-xs text-gray-600">
                  {submission.assignment.lesson.module.course.title} / {submission.assignment.lesson.module.title} / {submission.assignment.lesson.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Student: {submission.user.name || "Unnamed"} ({submission.user.email})
                </p>
              </div>

              <p className="mb-3 rounded-md bg-emerald-50 p-3 text-sm text-gray-700">{submission.content}</p>

              <form action={gradeSubmissionAction} className="grid gap-3 md:grid-cols-3">
                <input type="hidden" name="submissionId" value={submission.id} />
                <div>
                  <label className="mb-1 block text-xs text-gray-700">Score (max {submission.assignment.maxScore})</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={submission.assignment.maxScore}
                    name="score"
                    defaultValue={submission.score ?? ""}
                    className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-gray-700">Feedback</label>
                  <input
                    type="text"
                    name="feedback"
                    defaultValue={submission.feedback ?? ""}
                    placeholder="Provide guidance for improvement"
                    className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
