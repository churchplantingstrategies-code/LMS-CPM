import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),
  isActive: z.boolean().optional(),
});

function isSuperAdmin(role?: string) {
  return role === "SUPER_ADMIN";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Only teacher accounts can be modified here" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password, isActive } = parsed.data;

  if (email && email !== target.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const updateData: {
    name?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
  } = {};

  if (typeof name === "string") updateData.name = name;
  if (typeof email === "string") updateData.email = email;
  if (typeof isActive === "boolean") updateData.isActive = isActive;
  if (typeof password === "string" && password.length >= 8) {
    updateData.password = await hash(password, 12);
  }

  const updated = await db.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ message: "Teacher updated", teacher: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.user.id === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Only teacher accounts can be deleted here" }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ message: "Teacher deleted" });
}
