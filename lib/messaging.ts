/**
 * lib/messaging.ts
 *
 * Unified SMS + Email dispatcher.
 * Reads the active provider and credentials from admin settings (data/admin-settings.json)
 * and falls back to environment variables when provider is NONE.
 *
 * SMS providers supported:  Twilio | Plivo | Vonage
 * Email providers supported: SendGrid | Mailgun | Custom SMTP (+ env-var fallback)
 */

import axios from "axios";
import nodemailer from "nodemailer";
import { readAdminSettings } from "./admin-settings";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface SMSOptions {
  to: string;
  message: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

// ─────────────────────────────────────────────────────────────
// SMS
// ─────────────────────────────────────────────────────────────

export async function sendSMS({ to, message }: SMSOptions): Promise<void> {
  const settings = await readAdminSettings();
  const { smsProvider, twilioAccountSid, twilioAuthToken, twilioSenderId,
    plivoAuthId, plivoAuthToken, plivoSenderId,
    vonageApiKey, vonageApiSecret, vonageSenderId } = settings.integrations;

  if (smsProvider === "NONE") return;

  try {
    if (smsProvider === "TWILIO") {
      if (!twilioAccountSid || !twilioAuthToken) {
        console.warn("[SMS] Twilio credentials not configured");
        return;
      }
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        new URLSearchParams({ From: twilioSenderId, To: to, Body: message }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          auth: { username: twilioAccountSid, password: twilioAuthToken },
        }
      );
      return;
    }

    if (smsProvider === "PLIVO") {
      if (!plivoAuthId || !plivoAuthToken) {
        console.warn("[SMS] Plivo credentials not configured");
        return;
      }
      await axios.post(
        `https://api.plivo.com/v1/Account/${plivoAuthId}/Message/`,
        { src: plivoSenderId, dst: to, text: message },
        { auth: { username: plivoAuthId, password: plivoAuthToken } }
      );
      return;
    }

    if (smsProvider === "VONAGE") {
      if (!vonageApiKey || !vonageApiSecret) {
        console.warn("[SMS] Vonage credentials not configured");
        return;
      }
      await axios.post("https://rest.nexmo.com/sms/json", {
        api_key: vonageApiKey,
        api_secret: vonageApiSecret,
        from: vonageSenderId || "CPMovement",
        to,
        text: message,
      });
      return;
    }
  } catch (err: any) {
    console.error(`[SMS] Failed to send via ${smsProvider}:`, err?.response?.data ?? err?.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Email
// ─────────────────────────────────────────────────────────────

export async function sendEmail({ to, subject, html, text, replyTo }: EmailOptions): Promise<void> {
  const settings = await readAdminSettings();
  const {
    emailProvider, emailApiKey, emailApiSecret, emailFromAddress,
    smtpHost, smtpPort, smtpUser, smtpPassword,
  } = settings.integrations;

  const fromAddress = emailFromAddress || process.env.EMAIL_FROM || "noreply@churchplantingmovement.com";
  const toArray = Array.isArray(to) ? to : [to];
  const plainText = text || html.replace(/<[^>]*>/g, "");

  try {
    // ── NONE → fallback to env-based SMTP / SendGrid ──
    if (emailProvider === "NONE") {
      const smtpHostEnv = process.env.SMTP_HOST;
      const sgKey = process.env.SENDGRID_API_KEY;
      if (!smtpHostEnv && !sgKey) return; // no env config either, skip silently

      const transporter = nodemailer.createTransport({
        host: smtpHostEnv || "smtp.sendgrid.net",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: process.env.SMTP_USER || "apikey", pass: process.env.SMTP_PASS || sgKey },
      });
      await transporter.sendMail({ from: fromAddress, to: toArray.join(", "), subject, html, text: plainText, replyTo });
      return;
    }

    // ── SendGrid ──
    if (emailProvider === "SENDGRID") {
      if (!emailApiKey) { console.warn("[EMAIL] SendGrid API key not configured"); return; }
      await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        {
          personalizations: [{ to: toArray.map((email) => ({ email })) }],
          from: { email: fromAddress },
          subject,
          content: [
            { type: "text/plain", value: plainText },
            { type: "text/html", value: html },
          ],
          ...(replyTo ? { reply_to: { email: replyTo } } : {}),
        },
        { headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" } }
      );
      return;
    }

    // ── Mailgun ──
    if (emailProvider === "MAILGUN") {
      if (!emailApiKey) { console.warn("[EMAIL] Mailgun API key not configured"); return; }
      // Domain: use emailApiSecret if provided, otherwise extract from fromAddress
      const domain = emailApiSecret || fromAddress.split("@")[1] || "";
      if (!domain) { console.warn("[EMAIL] Mailgun domain not configured"); return; }

      const formData = new URLSearchParams({
        from: fromAddress,
        to: toArray.join(", "),
        subject,
        html,
        text: plainText,
      });
      await axios.post(
        `https://api.mailgun.net/v3/${domain}/messages`,
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          auth: { username: "api", password: emailApiKey },
        }
      );
      return;
    }

    // ── Custom SMTP ──
    if (emailProvider === "SMTP") {
      if (!smtpHost) { console.warn("[EMAIL] SMTP host not configured"); return; }
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: smtpUser ? { user: smtpUser, pass: smtpPassword } : undefined,
      });
      await transporter.sendMail({ from: fromAddress, to: toArray.join(", "), subject, html, text: plainText, replyTo });
      return;
    }
  } catch (err: any) {
    console.error(`[EMAIL] Failed to send via ${emailProvider}:`, err?.response?.data ?? err?.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Predefined notification helpers
// ─────────────────────────────────────────────────────────────

export async function sendEnrollmentConfirmation(opts: {
  to: string;
  name: string;
  courseTitle: string;
  courseUrl: string;
  phone?: string | null;
}): Promise<void> {
  const { to, name, courseTitle, courseUrl, phone } = opts;
  await Promise.allSettled([
    sendEmail({
      to,
      subject: `You're enrolled: "${courseTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#4f46e5">Welcome to the course! 🎉</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>You've been successfully enrolled in <strong>${courseTitle}</strong>.</p>
          <p style="margin:24px 0">
            <a href="${courseUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
              Start Learning →
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px">God bless your discipleship journey!</p>
        </div>
      `,
    }),
    phone
      ? sendSMS({ to: phone, message: `Hi ${name}! You're enrolled in "${courseTitle}". Start learning: ${courseUrl}` })
      : Promise.resolve(),
  ]);
}

export async function sendPaymentReceipt(opts: {
  to: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  phone?: string | null;
}): Promise<void> {
  const { to, name, amount, currency, description, phone } = opts;
  const formatted = `${currency} ${amount.toFixed(2)}`;
  await Promise.allSettled([
    sendEmail({
      to,
      subject: `Payment confirmed: ${formatted}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#16a34a">Payment Confirmed ✅</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your payment of <strong>${formatted}</strong> for <em>${description}</em> has been received.</p>
          <p style="color:#6b7280;font-size:13px">Thank you for your purchase!</p>
        </div>
      `,
    }),
    phone
      ? sendSMS({ to: phone, message: `Payment confirmed: ${formatted} for ${description}. Thank you!` })
      : Promise.resolve(),
  ]);
}

export async function sendSubscriptionConfirmation(opts: {
  to: string;
  name: string;
  planName: string;
  phone?: string | null;
}): Promise<void> {
  const { to, name, planName, phone } = opts;
  await Promise.allSettled([
    sendEmail({
      to,
      subject: `Your ${planName} subscription is active`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#4f46e5">Subscription Activated 🚀</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your <strong>${planName}</strong> subscription is now active. You have full access to all included courses and content.</p>
          <p style="color:#6b7280;font-size:13px">Enjoy your learning journey!</p>
        </div>
      `,
    }),
    phone
      ? sendSMS({ to: phone, message: `Your ${planName} subscription is active! Enjoy full course access.` })
      : Promise.resolve(),
  ]);
}

export async function sendBookOrderConfirmation(opts: {
  to: string;
  name: string;
  orderNumber: string;
  amount: number;
  currency: string;
  phone?: string | null;
}): Promise<void> {
  const { to, name, orderNumber, amount, currency, phone } = opts;
  const formatted = `${currency} ${amount.toFixed(2)}`;
  await Promise.allSettled([
    sendEmail({
      to,
      subject: `Order confirmed: #${orderNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#16a34a">Order Confirmed 📦</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your book order <strong>#${orderNumber}</strong> (${formatted}) has been confirmed and is being processed.</p>
          <p style="color:#6b7280;font-size:13px">You will receive shipping details shortly.</p>
        </div>
      `,
    }),
    phone
      ? sendSMS({ to: phone, message: `Order #${orderNumber} confirmed (${formatted}). Your books are being prepared!` })
      : Promise.resolve(),
  ]);
}
