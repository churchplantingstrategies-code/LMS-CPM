import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function createDiscussionAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) return;

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return;
  }

  const courseId = String(formData.get("courseId") || "");
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!courseId || !title || !content) return;

  if (role === "INSTRUCTOR") {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { metadata: true },
    });
    const metadata = course?.metadata as { createdByUserId?: string } | null;
    if (!course || metadata?.createdByUserId !== session.user.id) {
      return;
    }
  }

  await db.discussion.create({
    data: {
      courseId,
      userId: session.user.id,
      title,
      content,
      isPinned: false,
    },
  });

  revalidatePath("/teacher/discussions");
}

async function replyDiscussionAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) return;

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return;
  }

  const discussionId = String(formData.get("discussionId") || "");
  const content = String(formData.get("replyContent") || "").trim();
  if (!discussionId || !content) return;

  if (role === "INSTRUCTOR") {
    const discussion = await db.discussion.findUnique({
      where: { id: discussionId },
      select: { course: { select: { metadata: true } } },
    });

    const metadata = discussion?.course.metadata as { createdByUserId?: string } | null;
    if (!discussion || metadata?.createdByUserId !== session.user.id) {
      return;
    }
  }

  await db.reply.create({
    data: {
      discussionId,
      userId: session.user.id,
      content,
      isInstructor: true,
    },
  });

  revalidatePath("/teacher/discussions");
}

export default async function TeacherDiscussionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  let ownedCourseIds: string[] = [];
  if (role === "INSTRUCTOR") {
    const allCourses = await db.course.findMany({
      select: { id: true, metadata: true },
      take: 500,
    });
    ownedCourseIds = allCourses
      .filter((course) => {
        const metadata = course.metadata as { createdByUserId?: string } | null;
        return metadata?.createdByUserId === session.user.id;
      })
      .map((course) => course.id);
  }

  const [courses, discussions] = await Promise.all([
    db.course.findMany({
      where: role === "INSTRUCTOR" ? { id: { in: ownedCourseIds } } : undefined,
      orderBy: { title: "asc" },
      select: { id: true, title: true },
      take: 100,
    }),
    db.discussion.findMany({
      where: role === "INSTRUCTOR" ? { courseId: { in: ownedCourseIds } } : undefined,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        course: { select: { title: true } },
        user: { select: { name: true, email: true } },
        replies: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        _count: { select: { replies: true } },
      },
      take: 40,
    }),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Discussions</h1>
        <p className="mt-1 text-sm text-gray-600">Send announcements or questions and read existing discussion threads.</p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Create New Discussion</h2>
        <form action={createDiscussionAction} className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-700">Course</label>
            <select name="courseId" className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" defaultValue="">
              <option value="" disabled>Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-700">Title</label>
            <input name="title" type="text" className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Discussion topic" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-700">Message</label>
            <textarea name="content" rows={4} className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Write your discussion message" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Post Discussion</button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {discussions.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-gray-600">No discussions yet.</div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion.id} className="rounded-xl border border-emerald-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{discussion.title}</h3>
                <span className="text-xs text-gray-500">{discussion._count.replies} replies</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">{discussion.course.title} • by {discussion.user.name || discussion.user.email}</p>
              <p className="mt-3 text-sm text-gray-700">{discussion.content}</p>

              <div className="mt-4 space-y-2">
                {discussion.replies.length === 0 ? (
                  <p className="text-xs text-gray-500">No replies yet.</p>
                ) : (
                  discussion.replies.map((reply) => (
                    <div key={reply.id} className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs text-gray-600">{reply.user.name || reply.user.email} {reply.isInstructor ? "• Teacher" : ""}</p>
                      <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form action={replyDiscussionAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="discussionId" value={discussion.id} />
                <input
                  name="replyContent"
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Reply
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
