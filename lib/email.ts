import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.sendgrid.net",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "apikey",
    pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY,
  },
});

export async function sendEmail({ to, subject, html, text, replyTo }: EmailOptions) {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || "eDiscipleship"} <${process.env.EMAIL_FROM || "noreply@ediscipleship.com"}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
    replyTo,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

export function welcomeEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to eDiscipleship</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to eDiscipleship!</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0;">Your journey begins here</p>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #4f46e5;">Hi ${name}! 🎉</h2>
    <p>Thank you for joining eDiscipleship. We're thrilled to have you as part of our community.</p>
    <p>Here's what you can do now:</p>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">📚 Browse all available courses</li>
      <li style="margin-bottom: 8px;">🎥 Access your enrolled lessons</li>
      <li style="margin-bottom: 8px;">💬 Join discussions and community</li>
      <li style="margin-bottom: 8px;">🏆 Track your progress and earn certificates</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>
    <p style="color: #666; font-size: 14px; text-align: center;">
      If you have any questions, reply to this email. We're here to help!
    </p>
  </div>
</body>
</html>`;
}

export function passwordResetTemplate(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #4f46e5; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2>Hi ${name},</h2>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Reset Password
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>`;
}

export function subscriptionConfirmedTemplate(name: string, planName: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">🎊 Subscription Activated!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2>Hi ${name},</h2>
    <p>Your <strong>${planName}</strong> subscription is now active. You have full access to all courses and features.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses"
         style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Start Learning Now
      </a>
    </div>
  </div>
</body>
</html>`;
}

export function courseEnrollmentTemplate(name: string, courseTitle: string, courseUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #4f46e5; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">📚 Enrolled Successfully!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2>Hi ${name},</h2>
    <p>You've been enrolled in <strong>${courseTitle}</strong>. Let's start your learning journey!</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${courseUrl}"
         style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Start Course
      </a>
    </div>
  </div>
</body>
</html>`;
}
