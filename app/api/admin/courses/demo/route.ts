import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureDemoCourse } from "@/lib/demo-course";

function ensureAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/admin/courses", request.url));
  }

  await ensureDemoCourse();
  return NextResponse.redirect(new URL("/admin/courses?demo=created", request.url));
}

export async function POST() {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await ensureDemoCourse();
  return NextResponse.json(course);
}