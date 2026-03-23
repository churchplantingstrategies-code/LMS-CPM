import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBuilderPage, listAllBuilderPages } from "@/lib/page-builder-store";

function isSuperAdmin(role?: string) {
  return role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await listAllBuilderPages();
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const created = await createBuilderPage({
      name: typeof body.name === "string" ? body.name : undefined,
      path: typeof body.path === "string" ? body.path : undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create page." }, { status: 400 });
  }
}
