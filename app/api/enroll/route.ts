import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const enrollSchema = z.object({
  courseId: z.string().min(1),
});

async function enrollInFreeCourse(userId: string, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isPublished) {
    return { error: "Course not found", status: 404 as const };
  }

  const existing = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (existing) {
    return { enrollment: existing, course };
  }

  if (course.price !== 0 && course.price !== null) {
    return {
      error: "This course requires payment",
      status: 402 as const,
      requiresPayment: true,
      course,
    };
  }

  const enrollment = await db.enrollment.create({
    data: {
      userId,
      courseId,
      status: "ACTIVE",
      enrolledAt: new Date(),
    },
  });

  return { enrollment, course };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    if (courseId) {
      loginUrl.searchParams.set("callbackUrl", `/courses/${courseId}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (!courseId) {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  const result = await enrollInFreeCourse(session.user.id, courseId);
  if ("error" in result && result.requiresPayment) {
    return NextResponse.redirect(new URL(`/courses/${courseId}?paymentRequired=1`, request.url));
  }

  if ("error" in result) {
    return NextResponse.redirect(new URL("/courses?enrollError=1", request.url));
  }

  return NextResponse.redirect(new URL(`/courses/${courseId}?enrolled=1`, request.url));
}

// POST /api/enroll
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = enrollSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { courseId } = result.data;
  const enrollmentResult = await enrollInFreeCourse(session.user.id, courseId);

  if ("error" in enrollmentResult && enrollmentResult.requiresPayment) {
    return NextResponse.json(
      { error: enrollmentResult.error, requiresPayment: true, courseId },
      { status: enrollmentResult.status }
    );
  }

  if ("error" in enrollmentResult) {
    return NextResponse.json({ error: enrollmentResult.error }, { status: enrollmentResult.status });
  }

  return NextResponse.json(enrollmentResult.enrollment, { status: 201 });
}
