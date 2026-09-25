import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email (password reset links). Two ways to send, first match wins:
 *
 * 1. SMTP — SMTP_USER + SMTP_PASS (SMTP_HOST defaults to Gmail). A normal
 *    Gmail account with an App Password works, free, no domain needed
 *    (~500 emails/day). EMAIL_FROM defaults to SMTP_USER.
 * 2. Resend — RESEND_API_KEY + EMAIL_FROM (needs a verified domain).
 *
 * With neither: in development the message is printed to the server console
 * so the flow can be tested; in production it's an error (and the login page
 * hides "Forgot password?" — see emailConfigured()).
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email isn't configured on this server — ask the person who invited you to reset your password.");
  }
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function emailConfigured(): boolean {
  return smtpConfigured() || resendConfigured();
}

let transport: Transporter | null = null;

function smtpTransport(): Transporter {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export async function sendEmail(msg: OutgoingEmail): Promise<void> {
  if (smtpConfigured()) {
    const from = process.env.EMAIL_FROM || `Daaru-s-Seebawayh <${process.env.SMTP_USER}>`;
    await smtpTransport().sendMail({ from, to: msg.to, subject: msg.subject, text: msg.text, html: msg.html });
    return;
  }
  if (resendConfigured()) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    });
    if (!res.ok) throw new Error(`Email provider refused the message (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return;
  }
  if (process.env.NODE_ENV === "production") throw new EmailNotConfiguredError();
  console.info(`\n[email — not sent, no SMTP/Resend configured]\nTo: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}\n`);
}
