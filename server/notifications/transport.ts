// SMTP transport (design N9). With MAIL_SMTP_URL unset every send rejects, so the mail is logged and dropped.
import nodemailer from "nodemailer";

import type { MailTransport } from "./mailer";

export const mailSender = (env: NodeJS.ProcessEnv = process.env): string =>
  env.MAIL_SENDER || "petstore@localhost";

export function smtpTransport(env: NodeJS.ProcessEnv = process.env): MailTransport {
  return {
    async send(mail) {
      if (!env.MAIL_SMTP_URL) throw new Error("no mail server configured");
      await nodemailer.createTransport(env.MAIL_SMTP_URL).sendMail({
        to: mail.to,
        from: mail.from,
        subject: mail.subject,
        html: mail.body,
        headers: { "X-Mailer": "JavaMailer" },
      });
    },
  };
}
