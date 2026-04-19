import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = Number(process.env.SMTP_PORT || 25);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "noreply@airoapp.ai";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "FixMyCity";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  tls: { rejectUnauthorized: false },
});

function fromAddress(label: string): string {
  return `"${label}" <${SMTP_FROM_EMAIL}>`;
}

export async function verifyEmailTransport(): Promise<void> {
  await transporter.verify();
}

export interface StatusEmailOptions {
  toEmail: string;
  toName: string;
  ticketId: string;
  issueTitle: string;
  newStatus: string;
  note: string;
  updatedBy: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  fixed: "Fixed ✓",
  resolved: "Resolved ✓",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "#6366f1",
  under_review: "#f59e0b",
  assigned: "#3b82f6",
  in_progress: "#8b5cf6",
  fixed: "#22c55e",
  resolved: "#22c55e",
  rejected: "#ef4444",
};

function buildEmailHtml(opts: StatusEmailOptions): string {
  const statusLabel = STATUS_LABELS[opts.newStatus] || opts.newStatus;
  const statusColor = STATUS_COLORS[opts.newStatus] || "#6366f1";
  const date = new Date(opts.updatedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Issue Status Update — FixMyCity</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1e3a5f;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="background:#f59e0b;border-radius:8px;width:36px;height:36px;display:inline-block;line-height:36px;text-align:center;font-size:18px;">🏙️</div>
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">FixMyCity</span>
            </div>
            <div style="color:#93c5fd;font-size:12px;margin-top:4px;">Nagar Nigam Digital Services Portal</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;">

            <p style="margin:0 0 8px;color:#374151;font-size:15px;">Hello <strong>${opts.toName}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
              Your reported issue has a new status update. Here's what's happening:
            </p>

            <!-- Ticket card -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
              <div style="font-size:12px;color:#94a3b8;font-family:monospace;margin-bottom:6px;">${opts.ticketId}</div>
              <div style="font-size:16px;font-weight:600;color:#1e293b;margin-bottom:16px;">${opts.issueTitle}</div>

              <!-- Status badge -->
              <div style="margin-bottom:16px;">
                <span style="display:inline-block;background:${statusColor};color:#ffffff;font-size:13px;font-weight:600;padding:6px 16px;border-radius:999px;">
                  ${statusLabel}
                </span>
              </div>

              ${
                opts.note
                  ? `
              <div style="background:#f1f5f9;border-left:3px solid ${statusColor};border-radius:0 6px 6px 0;padding:12px 14px;margin-bottom:12px;">
                <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Officer's Note</div>
                <div style="font-size:14px;color:#374151;">${opts.note}</div>
              </div>`
                  : ""
              }

              <div style="font-size:12px;color:#94a3b8;">
                Updated by <strong style="color:#64748b;">${opts.updatedBy}</strong> on ${date}
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:24px;">
              <a href="https://t8o05lzyu3.preview.c38.airoapp.ai/track?id=${opts.ticketId}"
                 style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Track Your Issue →
              </a>
            </div>

            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.6;">
              You're receiving this because you reported issue ${opts.ticketId} on FixMyCity.<br/>
              This is an automated notification — please do not reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              © ${new Date().getFullYear()} FixMyCity — Nagar Nigam Digital Services Portal
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendStatusUpdateEmail(
  opts: StatusEmailOptions,
): Promise<void> {
  const statusLabel = STATUS_LABELS[opts.newStatus] || opts.newStatus;

  await transporter.sendMail({
    from: fromAddress(`${SMTP_FROM_NAME} Notifications`),
    to: `"${opts.toName}" <${opts.toEmail}>`,
    subject: `[${opts.ticketId}] Your issue is now: ${statusLabel}`,
    html: buildEmailHtml(opts),
    text: `Hello ${opts.toName},\n\nYour issue "${opts.issueTitle}" (${opts.ticketId}) has been updated to: ${statusLabel}.\n\n${opts.note ? `Note: ${opts.note}\n\n` : ""}Updated by ${opts.updatedBy}.\n\nTrack your issue at: https://t8o05lzyu3.preview.c38.airoapp.ai/track?id=${opts.ticketId}\n\n— FixMyCity Team`,
  });
}

export interface OfficerAssignmentEmailOptions {
  toEmail: string;
  toName: string;
  ticketId: string;
  issueTitle: string;
  ward: string;
  address: string;
}

export async function sendOfficerAssignmentEmail(
  opts: OfficerAssignmentEmailOptions,
): Promise<void> {
  const safeWard = opts.ward || "Assigned Ward";
  await transporter.sendMail({
    from: fromAddress(`${SMTP_FROM_NAME} Dispatch`),
    to: `"${opts.toName}" <${opts.toEmail}>`,
    subject: `[${opts.ticketId}] New issue assigned in ${safeWard}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;padding:20px;background:#f8fafc;color:#1f2937;">
        <h2 style="margin:0 0 10px;color:#1e3a5f;">New Issue Assigned</h2>
        <p style="margin:0 0 16px;">Hello ${opts.toName}, a new civic issue has been assigned to you.</p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;">
          <p style="margin:0 0 6px;"><strong>Ticket:</strong> ${opts.ticketId}</p>
          <p style="margin:0 0 6px;"><strong>Title:</strong> ${opts.issueTitle}</p>
          <p style="margin:0 0 6px;"><strong>Ward:</strong> ${safeWard}</p>
          <p style="margin:0;"><strong>Location:</strong> ${opts.address}</p>
        </div>
      </div>
    `,
    text: `Hello ${opts.toName},\n\nA new issue has been assigned to you.\nTicket: ${opts.ticketId}\nTitle: ${opts.issueTitle}\nWard: ${safeWard}\nLocation: ${opts.address}\n`,
  });
}

export interface WelcomeEmailOptions {
  toEmail: string;
  toName: string;
  userRole: "citizen" | "officer";
}

export async function sendWelcomeEmail(opts: WelcomeEmailOptions): Promise<void> {
  const roleLabel = opts.userRole === "officer" ? "Officer" : "Citizen";

  await transporter.sendMail({
    from: fromAddress(`${SMTP_FROM_NAME} Team`),
    to: `"${opts.toName}" <${opts.toEmail}>`,
    subject: "Welcome to FixMyCity",
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;padding:24px;background:#f8fafc;color:#1f2937;">
        <h2 style="margin:0 0 12px;color:#1e3a5f;">Welcome to FixMyCity 🎉</h2>
        <p style="margin:0 0 12px;">Hello <strong>${opts.toName}</strong>,</p>
        <p style="margin:0 0 12px;">
          Your ${roleLabel} account has been created successfully. We're glad to have you on board.
        </p>
        <p style="margin:0 0 16px;">
          You can now log in and start using FixMyCity services.
        </p>
        <div style="padding-top:12px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280;">
          Platform built by <strong>Saad Madni</strong>.
        </div>
      </div>
    `,
    text: `Hello ${opts.toName},\n\nWelcome to FixMyCity! Your ${roleLabel} account has been created successfully.\n\nPlatform built by Saad Madni.\n`,
  });
}
