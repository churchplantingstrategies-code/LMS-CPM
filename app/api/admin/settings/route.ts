import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import {
  readAdminSettings,
  sanitizeAdminSettings,
  writeAdminSettings,
} from "../../../../lib/admin-settings";

function ensureAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await readAdminSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const sanitized = sanitizeAdminSettings(body);
    const saved = await writeAdminSettings(sanitized);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("[ADMIN_SETTINGS_SAVE_ERROR]", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
