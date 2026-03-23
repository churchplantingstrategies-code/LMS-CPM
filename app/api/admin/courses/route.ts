import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { slugify } from "../../../../lib/utils";

const lessonSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(3000).optional().nullable(),
  content: z.string().max(15000).optional().nullable(),
  videoProvider: z.enum(["UPLOAD", "YOUTUBE", "VIMEO", "CLOUDFLARE_STREAM"]),
  videoUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  isFree: z.boolean().default(false),
});

const moduleSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(3000).optional().nullable(),
  lessons: z.array(lessonSchema).default([]),
});

const createCourseSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(10).max(5000).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  videoProvider: z.enum(["UPLOAD", "YOUTUBE", "VIMEO", "CLOUDFLARE_STREAM"]),
  videoUrl: z.string().url().optional().nullable(),
  modules: z.array(moduleSchema).default([]),
  // Legacy fallback support
  initialModuleTitle: z.string().max(150).optional().nullable(),
  initialLessonTitle: z.string().max(150).optional().nullable(),
  isPublished: z.boolean().default(false),
});

async function ensureUniqueCourseSlug(baseTitle: string) {
  const baseSlug = slugify(baseTitle) || "course";
  let candidate = baseSlug;
  let count = 1;

  while (true) {
    const exists = await db.course.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!exists) return candidate;
    count += 1;
    candidate = `${baseSlug}-${count}`;
  }
}

function isAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function ensureUniqueLessonSlug(baseTitle: string, used: Set<string>) {
  const base = slugify(baseTitle) || "lesson";
  let candidate = base;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  used.add(candidate);
  return candidate;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid course payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = await ensureUniqueCourseSlug(data.title);

    const modulesToCreate =
      data.modules.length > 0
        ? data.modules
        : data.initialModuleTitle
          ? [
              {
                title: data.initialModuleTitle,
                description: null,
                lessons: data.initialLessonTitle
                  ? [
                      {
                        title: data.initialLessonTitle,
                        description: null,
                        content: null,
                        videoProvider: data.videoProvider,
                        videoUrl: data.videoUrl || null,
                        duration: null,
                        isFree: false,
                      },
                    ]
                  : [],
              },
            ]
          : [];

    const course = await db.$transaction(async (tx: any) => {
      const createdCourse = await tx.course.create({
        data: {
          title: data.title,
          slug,
          description: data.description || null,
          category: data.category || null,
          price: typeof data.price === "number" ? data.price : 0,
          previewVideo: data.videoUrl || null,
          tags: [],
          isPublished: data.isPublished,
        },
        select: { id: true, title: true, slug: true, isPublished: true },
      });

      for (let mIndex = 0; mIndex < modulesToCreate.length; mIndex += 1) {
        const m = modulesToCreate[mIndex];

        const createdModule = await tx.module.create({
          data: {
            title: m.title,
            description: m.description || null,
            courseId: createdCourse.id,
            order: mIndex + 1,
            isPublished: data.isPublished,
          },
        });

        const usedSlugs = new Set<string>();
        for (let lIndex = 0; lIndex < m.lessons.length; lIndex += 1) {
          const l = m.lessons[lIndex];
          const lessonSlug = ensureUniqueLessonSlug(l.title, usedSlugs);

          await tx.lesson.create({
            data: {
              title: l.title,
              slug: lessonSlug,
              description: l.description || null,
              content: l.content || null,
              moduleId: createdModule.id,
              order: lIndex + 1,
              videoProvider: l.videoProvider,
              videoUrl: l.videoUrl || null,
              duration: typeof l.duration === "number" ? l.duration : null,
              isFree: l.isFree,
              isPublished: data.isPublished,
            },
          });
        }
      }

      return createdCourse;
    });

    return NextResponse.json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("[ADMIN_CREATE_COURSE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
