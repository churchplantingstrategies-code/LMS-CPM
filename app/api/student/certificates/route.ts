import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get completed enrollments
    const enrollments = await db.enrollment.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Format certificates
    const certificates = enrollments.map((enrollment) => ({
      id: enrollment.id,
      courseId: enrollment.courses.id,
      courseName: enrollment.courses.title,
      issuedDate: enrollment.completedAt || new Date().toISOString(),
      completionPercentage: 100,
    }));

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("[CERTIFICATES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
