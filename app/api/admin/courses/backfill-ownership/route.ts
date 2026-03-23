import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type MetadataRecord = Record<string, unknown>;

function asMetadataRecord(value: unknown): MetadataRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as MetadataRecord;
  }
  return {};
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { dryRun?: boolean; defaultOwnerId?: string; confirmText?: string } = {};
  try {
    body = (await request.json()) as {
      dryRun?: boolean;
      defaultOwnerId?: string;
      confirmText?: string;
    };
  } catch {
    body = {};
  }

  const dryRun = body.dryRun ?? false;

  if (!dryRun && body.confirmText?.toUpperCase() !== "CONFIRM") {
    return NextResponse.json(
      { error: "Confirmation required. Send confirmText: CONFIRM for apply mode." },
      { status: 400 }
    );
  }

  const owners = await db.user.findMany({
    where: {
      role: { in: ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  const ownerById = new Map(owners.map((o) => [o.id, o]));
  const ownerByEmail = new Map(owners.map((o) => [o.email.toLowerCase(), o]));

  const fallbackOwnerId = body.defaultOwnerId || session.user.id;
  const fallbackOwner = ownerById.get(fallbackOwnerId);

  if (!fallbackOwner) {
    return NextResponse.json(
      { error: "Invalid default owner. Provide a valid active teacher/admin user id." },
      { status: 400 }
    );
  }

  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let alreadyOwned = 0;
  let missingOwner = 0;
  let updated = 0;
  const preview: Array<{ id: string; title: string; ownerId: string; ownerRole: string; source: string }> = [];

  for (const course of courses) {
    const metadata = asMetadataRecord(course.metadata);
    const existingOwnerId = typeof metadata.createdByUserId === "string" ? metadata.createdByUserId : "";

    if (existingOwnerId) {
      alreadyOwned += 1;
      continue;
    }

    let selectedOwner = undefined as undefined | { id: string; email: string; role: string };
    let source = "fallback";

    if (typeof metadata.createdByEmail === "string" && metadata.createdByEmail.trim()) {
      const byEmail = ownerByEmail.get(metadata.createdByEmail.toLowerCase());
      if (byEmail) {
        selectedOwner = byEmail;
        source = "metadata.createdByEmail";
      }
    }

    if (!selectedOwner) {
      const firstInstructorDiscussion = await db.discussion.findFirst({
        where: {
          courseId: course.id,
          user: {
            role: { in: ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] },
          },
        },
        orderBy: { createdAt: "asc" },
        select: {
          userId: true,
          user: { select: { role: true, email: true } },
        },
      });

      if (firstInstructorDiscussion && ownerById.has(firstInstructorDiscussion.userId)) {
        selectedOwner = {
          id: firstInstructorDiscussion.userId,
          role: firstInstructorDiscussion.user.role,
          email: firstInstructorDiscussion.user.email,
        };
        source = "first-instructor-discussion";
      }
    }

    if (!selectedOwner) {
      selectedOwner = fallbackOwner;
      source = "fallback-default-owner";
    }

    if (!selectedOwner) {
      missingOwner += 1;
      continue;
    }

    preview.push({
      id: course.id,
      title: course.title,
      ownerId: selectedOwner.id,
      ownerRole: selectedOwner.role,
      source,
    });

    if (!dryRun) {
      const nextMetadata: MetadataRecord = {
        ...metadata,
        createdByUserId: selectedOwner.id,
        createdByRole: selectedOwner.role,
        ownershipBackfilledAt: new Date().toISOString(),
      };

      await db.course.update({
        where: { id: course.id },
        data: { metadata: nextMetadata },
      });
      updated += 1;
    }
  }

  return NextResponse.json({
    dryRun,
    totalCourses: courses.length,
    alreadyOwned,
    missingOwner,
    candidates: preview.length,
    updated,
    preview: preview.slice(0, 25),
  });
}
