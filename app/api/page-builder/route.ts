import { NextRequest, NextResponse } from "next/server";
import { getPublishedBuilderPageByPath } from "@/lib/page-builder-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/";
  const page = await getPublishedBuilderPageByPath(path);
  return NextResponse.json({ page });
}
