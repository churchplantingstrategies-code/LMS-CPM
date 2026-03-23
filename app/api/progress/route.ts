import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const progressSchema = z.object({
  lessonId: z.string().min(1),
  courseId: z.string().min(1),
  completed: z.boolean().default(true),
  watchedSeconds: z.number().min(0).optional(),
  returnTo: z.string().optional(),
  quizAnswers: z.array(z.number().int().min(0)).optional(),
});

async function parseProgressRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const result = progressSchema.safeParse(body);
    return { isForm: false, result };
  }

  const formData = await request.formData();
  const result = progressSchema.safeParse({
    lessonId: formData.get("lessonId"),
    courseId: formData.get("courseId"),
    completed: formData.get("completed") === "false" ? false : true,
    watchedSeconds: formData.get("watchedSeconds") ? Number(formData.get("watchedSeconds")) : undefined,
    returnTo: formData.get("returnTo")?.toString(),
    quizAnswers: formData
      .getAll("quizAnswers")
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)),
  });

  return { isForm: true, result };
}

// POST /api/progress — mark lesson complete / update watch time
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isForm, result } = await parseProgressRequest(request);
  if (!result.success) {
    return isForm
      ? NextResponse.redirect(new URL("/courses?progressError=1", request.url))
      : NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { lessonId, courseId, completed, watchedSeconds, returnTo, quizAnswers } = result.data;

  // Verify enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  if (completed) {
    const lesson = await db.lesson.findFirst({
      where: { id: lessonId, modules: { courseId } },
      select: { attachments: true },
    });

    const attachments = Array.isArray(lesson?.attachments) ? lesson.attachments as Array<Record<string, unknown>> : [];
    const quizItems = attachments.filter((attachment) => {
      return attachment?.type === "quiz" && Array.isArray(attachment.options) && typeof attachment.answerIndex === "number";
    });

    if (quizItems.length > 0) {
      if (!quizAnswers || quizAnswers.length !== quizItems.length) {
        return NextResponse.json({ error: "Knowledge Check is required before completing this lesson." }, { status: 422 });
      }

      const passed = quizItems.every((item, index) => quizAnswers[index] === Number(item.answerIndex));
      if (!passed) {
        return NextResponse.json({ error: "You must pass the Knowledge Check before marking this lesson complete." }, { status: 422 });
      }
    }
  }

  const progress = await db.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId },
    },
    update: {
      completed,
      updatedAt: new Date(),
      ...(watchedSeconds !== undefined ? { watchedTime: watchedSeconds } : {}),
      ...(completed ? { completedAt: new Date() } : {}),
    },
    create: {
      id: crypto.randomUUID(),
      userId: session.user.id,
      lessonId,
      completed,
      watchedTime: watchedSeconds ?? 0,
      updatedAt: new Date(),
      ...(completed ? { completedAt: new Date() } : {}),
    },
  });

  const [totalLessons, completedLessons] = await Promise.all([
    db.lesson.count({
      where: { modules: { courseId } },
    }),
    db.lessonProgress.count({
      where: {
        userId: session.user.id,
        completed: true,
        lessons: { modules: { courseId } },
      },
    }),
  ]);

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (progressPercent === 100 && !enrollment.completedAt) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { completedAt: new Date() },
    });
  }

  if (isForm) {
    return NextResponse.redirect(new URL(returnTo || `/courses/${courseId}`, request.url));
  }

  return NextResponse.json({ progress, progressPercent });
}

// GET /api/progress?courseId=xxx — get all lesson progress for a course
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const progressRecords = await db.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessons: { modules: { courseId } },
    },
    select: { lessonId: true, completed: true, watchedTime: true, completedAt: true },
  });

  return NextResponse.json(progressRecords);
}
