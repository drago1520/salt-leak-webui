import { db } from "@repo/db";
import { user } from "@repo/db/drizzle-kit/schema";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
});

const EMAIL_COOLDOWN_MS = Number(process.env.EMAIL_COOLDOWN_MS ?? 3_600_000);
const lastEmailAt = new Map<string, number>();

function buildHtml(sensorId: string, readingId: bigint, timestamp: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#dc2626;padding:24px 32px;">
            <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:1px;color:#fca5a5;text-transform:uppercase;">Copenhagen Atomics</p>
            <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;">⚠ Leak Detected</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:15px;color:#374151;">A salt leak sensor has reported an error status.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #fecaca;">
                  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.5px;color:#9ca3af;text-transform:uppercase;">Sensor ID</p>
                  <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:#111827;font-family:monospace;">${sensorId}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;border-bottom:1px solid #fecaca;">
                  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.5px;color:#9ca3af;text-transform:uppercase;">Reading ID</p>
                  <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:#111827;font-family:monospace;">${readingId}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.5px;color:#9ca3af;text-transform:uppercase;">Time</p>
                  <p style="margin:4px 0 0;font-size:15px;color:#374151;">${timestamp}</p>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">Check the dashboard for full sensor diagnostics.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">This alert was sent because a non-zero status code was detected. Cooldown: ${EMAIL_COOLDOWN_MS / 60_000} min per sensor.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function notifyEmail(
  sensorId: string,
  readingId: bigint,
  message: string,
) {
  if (process.env.ENABLE_EMAIL_NOTIFY == "false") return;
  const now = Date.now();
  if (now - (lastEmailAt.get(sensorId) ?? 0) < EMAIL_COOLDOWN_MS) return;
  lastEmailAt.set(sensorId, now);

  const users = await db.select({ email: user.email }).from(user);
  if (!users.length) {
    console.log("No user emails found when sending email notifications");
    return;
  }

  const timestamp =
    new Date().toLocaleString("en-GB", {
      timeZone: "UTC",
      dateStyle: "long",
      timeStyle: "short",
    }) + " UTC";

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to: users.map((u) => u.email),
    subject: `⚠ Leak Detected — Sensor ${sensorId}`,
    text: message,
    html: buildHtml(sensorId, readingId, timestamp),
  });
}
