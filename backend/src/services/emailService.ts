import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env, getEmailFrom, isSmtpConfigured } from "../config/env";
import type { AISummary } from "../models/Application";

export type DecisionType = "shortlisted" | "rejected";

export interface DecisionEmailContext {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  location?: string;
  score?: number | null;
  aiSummary?: AISummary | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortlistHtml(ctx: DecisionEmailContext): string {
  const skills = (ctx.aiSummary?.matching_skills ?? []).slice(0, 5);
  const skillsHtml =
    skills.length > 0
      ? `<ul style="margin:12px 0;padding-left:20px;color:#0F0F0F;">${skills.map((s) => `<li style="margin:4px 0;">${escapeHtml(s)}</li>`).join("")}</ul>`
      : "";

  const scoreBlock =
    ctx.score != null
      ? `<p style="margin:16px 0;padding:12px 16px;background:#C8F135;border-radius:8px;font-size:15px;color:#0F0F0F;"><strong>Fit score:</strong> ${ctx.score}/100</p>`
      : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E8E2D9;">
        <tr><td style="background:#0057FF;padding:28px 32px;">
          <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#C8F135;">HireDoc AI</p>
          <h1 style="margin:8px 0 0;font-size:26px;color:#ffffff;">Congratulations, ${escapeHtml(ctx.candidateName)}!</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#0F0F0F;">
            Great news — you have been <strong style="color:#00C896;">shortlisted</strong> for the next stage of our hiring process.
          </p>
          <div style="padding:16px;background:#F5F0E8;border-radius:12px;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6B6560;text-transform:uppercase;letter-spacing:0.05em;">Role</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#0F0F0F;">${escapeHtml(ctx.jobTitle)}</p>
            <p style="margin:4px 0 0;font-size:15px;color:#6B6560;">${escapeHtml(ctx.company)}${ctx.location ? ` · ${escapeHtml(ctx.location)}` : ""}</p>
          </div>
          ${scoreBlock}
          ${skills.length > 0 ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0057FF;">Skills that stood out</p>${skillsHtml}` : ""}
          <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#6B6560;">
            Our team was impressed with your application. A recruiter will reach out soon with next steps. Thank you for your interest!
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#FAFAF8;border-top:1px solid #E8E2D9;">
          <p style="margin:0;font-size:12px;color:#6B6560;">Sent via HireDoc AI · Smart hiring, faster decisions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function rejectHtml(ctx: DecisionEmailContext): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E8E2D9;">
        <tr><td style="background:linear-gradient(135deg,#0057FF 0%,#003d99 100%);padding:28px 32px;">
          <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#C8F135;">HireDoc AI</p>
          <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;">Thank you for applying, ${escapeHtml(ctx.candidateName)}</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#0F0F0F;">
            We appreciate the time you invested in your application for <strong>${escapeHtml(ctx.jobTitle)}</strong> at <strong>${escapeHtml(ctx.company)}</strong>.
          </p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#0F0F0F;">
            After careful review, we will not be moving forward with your application for this role at this time.
          </p>
          <div style="padding:16px;background:#F5F0E8;border-radius:12px;border-left:4px solid #C8F135;margin:20px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#6B6560;">
              This decision does not reflect your potential. We encourage you to keep applying to roles that match your skills — the right opportunity is out there.
            </p>
          </div>
          <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#6B6560;">
            We wish you the very best in your job search and future career.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#FAFAF8;border-top:1px solid #E8E2D9;">
          <p style="margin:0;font-size:12px;color:#6B6560;">Sent via HireDoc AI · Smart hiring, faster decisions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function subjectFor(decision: DecisionType, jobTitle: string): string {
  if (decision === "shortlisted") {
    return `Congratulations — you're shortlisted for ${jobTitle}`;
  }
  return `Update on your application for ${jobTitle}`;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }
  return transporter;
}

function mapSmtpError(err: unknown): Error {
  const message =
    err instanceof Error ? err.message : "Failed to send email";
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid login") ||
    lower.includes("username and password") ||
    lower.includes("authentication")
  ) {
    return new Error(
      "Gmail SMTP authentication failed. Use a Google App Password (not your normal password) in SMTP_PASS.",
    );
  }
  if (lower.includes("self signed") || lower.includes("certificate")) {
    return new Error(`SMTP TLS error: ${message}`);
  }
  return new Error(message);
}

export async function sendDecisionEmail(
  decision: DecisionType,
  ctx: DecisionEmailContext,
): Promise<void> {
  const html = decision === "shortlisted" ? shortlistHtml(ctx) : rejectHtml(ctx);
  const subject = subjectFor(decision, ctx.jobTitle);
  const to = ctx.candidateEmail;

  if (!isSmtpConfigured()) {
    console.log("[email:dev] SMTP_USER or SMTP_PASS not set — would send:");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Decision: ${decision}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: getEmailFrom(),
      to,
      subject,
      html,
    });
  } catch (err) {
    throw mapSmtpError(err);
  }
}
