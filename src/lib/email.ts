const RESEND_ENDPOINT = "https://api.resend.com/emails";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
  const fromEmail =
    process.env.SUPPORT_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    "redditprofile Support <support@redditprofile.com>";
  const replyTo =
    process.env.SUPPORT_REPLY_TO || process.env.ADMIN_NOTIFICATION_EMAIL;
  return { apiKey, fromEmail, replyTo };
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const { apiKey, fromEmail, replyTo: defaultReplyTo } = getResendConfig();

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }
  if (!input.html && !input.text) {
    return { ok: false, error: "Email must include html or text content" };
  }

  const payload: Record<string, unknown> = {
    from: input.from || fromEmail,
    to: [input.to],
    subject: input.subject,
  };
  if (input.html) payload.html = input.html;
  if (input.text) payload.text = input.text;

  const replyTo = input.replyTo || defaultReplyTo;
  if (replyTo) payload.reply_to = replyTo;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[email] Resend API error:", res.status, errText);
      return {
        ok: false,
        error: `Resend ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Failed to send:", message);
    return { ok: false, error: message };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function plainTextToHtml(text: string): string {
  const escaped = escapeHtml(text);
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin: 0 0 16px; color: #e4e4e7; line-height: 1.6;">${para.replace(/\n/g, "<br />")}</p>`,
    )
    .join("");

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a0a;">
      <div style="background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px;">
        ${paragraphs}
      </div>
      <p style="color: #71717a; font-size: 12px; margin-top: 16px; text-align: center;">
       , redditprofile Support<br />
        <a href="mailto:support@redditprofile.com" style="color: #71717a;">support@redditprofile.com</a>
      </p>
    </div>
  `;
}

export async function sendNewUserNotification(user: {
  email: string;
  username: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.log(
      "[email] ADMIN_NOTIFICATION_EMAIL not set, skipping signup notification",
    );
    return;
  }

  await sendEmail({
    to: adminEmail,
    subject: `New User Signup: ${user.username}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #22c55e; margin-bottom: 16px;">New User Registered</h2>
        <div style="background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px;">
          <p style="color: #e4e4e7; margin: 0 0 8px;"><strong>Username:</strong> ${escapeHtml(user.username)}</p>
          <p style="color: #e4e4e7; margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(user.email)}</p>
          <p style="color: #a1a1aa; margin: 0; font-size: 14px;"><strong>Signed up via:</strong> Google OAuth</p>
        </div>
        <p style="color: #71717a; font-size: 12px; margin-top: 16px;">— redditprofile</p>
      </div>
    `,
  });
}
