import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBookCover } from "@/lib/media-storage";

function ensureAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    }

    const uploaded = await uploadBookCover(file);

    return NextResponse.json({ url: uploaded.url, provider: uploaded.provider });
  } catch (error) {
    console.error("[ADMIN_BOOK_UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "Failed to upload cover image" }, { status: 500 });
  }
}