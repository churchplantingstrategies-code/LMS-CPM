/**
 * lib/automation-engine.ts
 *
 * Automation rule engine.
 * Call triggerAutomation(event, context) after any significant platform event.
 * It finds all active AutomationRules matching the trigger, evaluates conditions,
 * and executes their actions (SEND_EMAIL, SEND_SMS, NOTIFY_ADMIN).
 *
 * Template variables supported in subject/body/message:
 *   {{name}}    – user's display name
 *   {{email}}   – user email
 *   {{course}}  – course title
 *   {{amount}}  – formatted payment amount
 *   {{plan}}    – subscription plan name
 */

import { db } from "./db";
import { sendEmail, sendSMS } from "./messaging";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type AutomationEventType =
  | "USER_REGISTERED"
  | "COURSE_ENROLLED"
  | "COURSE_COMPLETED"
  | "PAYMENT_RECEIVED"
  | "SUBSCRIPTION_STARTED"
  | "SUBSCRIPTION_CANCELLED"
  | "LEAD_CREATED";

export interface AutomationContext {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string | null;
  courseId?: string;
  courseTitle?: string;
  amount?: number;
  currency?: string;
  planName?: string;
  leadId?: string;
  [key: string]: unknown;
}

interface AutomationAction {
  type: "SEND_EMAIL" | "SEND_SMS" | "NOTIFY_ADMIN";
  // Email fields
  subject?: string;
  body?: string;
  to?: string; // override recipient address
  // SMS fields
  message?: string;
}

// ─────────────────────────────────────────────────────────────
// Template interpolation
// ─────────────────────────────────────────────────────────────

function interpolate(template: string, ctx: AutomationContext): string {
  const amountStr = ctx.amount != null
    ? `${ctx.currency ?? "PHP"} ${Number(ctx.amount).toFixed(2)}`
    : "";
  return template
    .replace(/\{\{name\}\}/g, ctx.userName ?? "there")
    .replace(/\{\{email\}\}/g, ctx.userEmail ?? "")
    .replace(/\{\{course\}\}/g, ctx.courseTitle ?? "")
    .replace(/\{\{amount\}\}/g, amountStr)
    .replace(/\{\{plan\}\}/g, ctx.planName ?? "");
}

// ─────────────────────────────────────────────────────────────
// Main trigger function
// ─────────────────────────────────────────────────────────────

export async function triggerAutomation(
  event: AutomationEventType,
  context: AutomationContext
): Promise<void> {
  try {
    // Enrich context with user data from DB if needed
    if (context.userId && (!context.userEmail || context.userPhone === undefined)) {
      const user = await db.user.findUnique({
        where: { id: context.userId },
        select: { email: true, name: true, phone: true },
      });
      if (user) {
        context.userEmail  = context.userEmail  ?? (user.email  ?? undefined);
        context.userName   = context.userName   ?? (user.name   ?? undefined);
        context.userPhone  = context.userPhone  ?? user.phone;
      }
    }

    // Map event to AutomationTrigger enum values in the DB
    const triggerMap: Record<AutomationEventType, string> = {
      USER_REGISTERED:        "USER_REGISTERED",
      COURSE_ENROLLED:        "COURSE_ENROLLED",
      COURSE_COMPLETED:       "COURSE_COMPLETED",
      PAYMENT_RECEIVED:       "PAYMENT_RECEIVED",
      SUBSCRIPTION_STARTED:   "SUBSCRIPTION_STARTED",
      SUBSCRIPTION_CANCELLED: "SUBSCRIPTION_CANCELED", // schema uses CANCELED (one L)
      LEAD_CREATED:           "LEAD_CAPTURED",
    };

    const dbTrigger = triggerMap[event] ?? event;

    const rules = await db.automationRule.findMany({
      where: { trigger: dbTrigger as any, isActive: true },
    });

    for (const rule of rules) {
      const actions = (Array.isArray(rule.actions) ? rule.actions : []) as AutomationAction[];

      for (const action of actions) {
        if (action.type === "SEND_EMAIL") {
          const recipient = action.to || context.userEmail;
          if (!recipient) continue;
          const subject = interpolate(action.subject ?? "Notification from eDiscipleship", context);
          const html    = interpolate(action.body    ?? "", context);
          await sendEmail({ to: recipient, subject, html });
        }

        if (action.type === "SEND_SMS") {
          const recipient = action.to || (context.userPhone as string | undefined);
          if (!recipient) continue;
          const message = interpolate(action.message ?? "", context);
          await sendSMS({ to: recipient, message });
        }

        if (action.type === "NOTIFY_ADMIN") {
          const admins = await db.user.findMany({
            where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
            select: { email: true },
          });
          const subject = `[Admin] ${interpolate(action.subject ?? event, context)}`;
          const html    = interpolate(action.body ?? `<p>Event: <strong>${event}</strong></p>`, context);
          await Promise.allSettled(
            admins
              .filter((a) => a.email)
              .map((a) => sendEmail({ to: a.email!, subject, html }))
          );
        }
      }
    }
  } catch (err) {
    // Automation failures must never break the calling transaction
    console.error(`[AUTOMATION] Error processing "${event}":`, err);
  }
}
