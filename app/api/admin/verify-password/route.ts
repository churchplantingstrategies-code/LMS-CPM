import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function ensureAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || !ensureAdmin((session.user as { role?: string }).role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    // Look up the admin's stored password hash from the database
    const userId = (session.user as { id?: string }).id;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 400 }
      );
    }

    // Compare the provided password against the stored hash
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
