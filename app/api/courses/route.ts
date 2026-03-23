import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { slugify } from "@/lib/utils";

// GET /api/courses — public list (published) or admin all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "12", 10);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const skip = (page - 1) * limit;

    const session = await auth();
    const isAdmin =
      session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

    const where = {
      ...(isAdmin ? {} : { isPublished: true }),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
      ...(category ? { category } : {}),
    };

    const [courses, total] = await Promise.all([
      db.courses.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          shortDesc: true,
          thumbnail: true,
          previewVideo: true,
          price: true,
          isPublished: true,
          isFeatured: true,
          level: true,
          language: true,
          category: true,
          tags: true,
          duration: true,
          createdAt: true,
          _count: { select: { enrollments: true, modules: true } },
        },
      }),
      db.courses.count({ where }),
    ]);

    return NextResponse.json({ courses, total, page, limit });
  } catch (error) {
    console.error("[GET /api/courses]", error);
    return NextResponse.json(
      { error: "Failed to fetch courses", detail: String(error) },
      { status: 500 }
    );
  }
}

// OPTIONS /api/courses — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  category: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

// POST /api/courses — create (admin/instructor only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const result = createCourseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, description, shortDescription, price, level, category, thumbnailUrl } =
    result.data;

  const slug = slugify(title);

  const existing = await db.course.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const course = await db.course.create({
    data: {
      title,
      slug: finalSlug,
      description,
      shortDescription,
      price,
      level: level ?? "ALL_LEVELS",
      category,
      thumbnailUrl,
      instructorId: session.user.id,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
