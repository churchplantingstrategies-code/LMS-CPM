import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// GET /api/courses/[courseId]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { id: true, name: true, image: true, bio: true } },
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  category: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

// PUT /api/courses/[courseId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = course.instructorId === session.user.id;
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const result = updateCourseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await db.course.update({
    where: { id: courseId },
    data: result.data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/courses/[courseId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = course.instructorId === session.user.id;
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.course.delete({ where: { id: courseId } });

  return NextResponse.json({ message: "Course deleted" });
}
