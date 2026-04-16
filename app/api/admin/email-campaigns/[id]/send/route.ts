import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/messaging";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const campaign = await db.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (campaign.status === "SENT") {
    return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
  }

  // Collect recipients: all students + all leads
  const [students, leads] = await Promise.all([
    db.user.findMany({
      where: { isActive: true, role: { in: ["STUDENT", "ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, email: true, name: true },
    }),
    db.lead.findMany({
      select: { id: true, email: true, name: true },
    }),
  ]);

  // Deduplicate by email
  const seen = new Set<string>();
  const recipients: Array<{ userId?: string; leadId?: string; email: string; name: string | null }> = [];

  for (const s of students) {
    if (!seen.has(s.email)) {
      seen.add(s.email);
      recipients.push({ userId: s.id, email: s.email, name: s.name });
    }
  }
  for (const l of leads) {
    if (!seen.has(l.email)) {
      seen.add(l.email);
      recipients.push({ leadId: l.id, email: l.email, name: l.name });
    }
  }

  // Mark campaign as sending
  await db.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: "SENDING" },
  });

  let sent = 0;
  let bounced = 0;

  for (const recipient of recipients) {
    try {
      const personalizedHtml = campaign.content
        .replace(/\{\{name\}\}/g, recipient.name ?? "there")
        .replace(/\{\{email\}\}/g, recipient.email);

      await sendEmail({
        to: recipient.email,
        subject: campaign.subject,
        html: personalizedHtml,
      });

      await db.emailLog.create({
        data: {
          campaignId: campaign.id,
          userId: recipient.userId ?? null,
          leadId: recipient.leadId ?? null,
          to: recipient.email,
          status: "sent",
        },
      });
      sent++;
    } catch {
      bounced++;
      await db.emailLog.create({
        data: {
          campaignId: campaign.id,
          userId: recipient.userId ?? null,
          leadId: recipient.leadId ?? null,
          to: recipient.email,
          status: "bounced",
        },
      });
    }
  }

  await db.emailCampaign.update({
    where: { id: campaign.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      stats: { sent, bounced, opened: 0, clicked: 0 },
    },
  });

  return NextResponse.json({ success: true, sent, bounced, total: recipients.length });
}
