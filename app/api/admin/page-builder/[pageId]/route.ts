import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteBuilderPage, listAllBuilderPages, updateBuilderPage } from "@/lib/page-builder-store";
import { BuilderPageRecord } from "@/types/page-builder";

function isSuperAdmin(role?: string) {
  return role === "SUPER_ADMIN";
}

export async function GET(_: NextRequest, { params }: { params: { pageId: string } }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await listAllBuilderPages();
  const page = pages.find((item) => item.id === params.pageId);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

export async function PATCH(request: NextRequest, { params }: { params: { pageId: string } }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<BuilderPageRecord>;
    const saved = await updateBuilderPage(params.pageId, body);
    if (!saved) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update page." }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { pageId: string } }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteBuilderPage(params.pageId);
  if (!deleted) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
