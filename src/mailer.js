import nodemailer from 'nodemailer';

let transport = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}
export const mailConfigured = () => !!transport;

export async function sendContactEmail({ to, name, email, subject, body }) {
  if (!transport) { console.log(`[mail] SMTP not configured; message from ${name} <${email}> saved to inbox only.`); return false; }
  await transport.sendMail({
    from: process.env.SMTP_FROM || `Portfolio <${process.env.SMTP_USER}>`, to, replyTo: `${name} <${email}>`,
    subject: `[Portfolio] ${subject || 'New message'} — ${name}`,
    text: `${body}\n\n—\n${name}\n${email}`
  });
  return true;
}
