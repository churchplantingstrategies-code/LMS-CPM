import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  plan: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("[REGISTER] Received body:", JSON.stringify(body, null, 2));
    
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      console.error("[REGISTER] Validation failed:", fieldErrors);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: fieldErrors,
          hints: {
            name: "Must be 2-100 characters",
            email: "Must be a valid email",
            password: "Must be 8-100 characters"
          }
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      console.warn("[REGISTER] Email already exists:", email);
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log("[REGISTER] User created successfully:", user.id);

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage, type: error instanceof Error ? error.constructor.name : "Unknown" },
      { status: 500 }
    );
  }
}
