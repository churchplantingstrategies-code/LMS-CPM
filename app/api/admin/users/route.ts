import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function isAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [teachers, students] = await Promise.all([
    db.user.findMany({
      where: { role: "INSTRUCTOR" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      take: 200,
    }),
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      take: 300,
    }),
  ]);

  return NextResponse.json({ teachers, students });
}
