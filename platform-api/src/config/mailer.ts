import nodemailer from 'nodemailer';
import { env } from './env';

export const mailer = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

export async function sendMail(options: { to: string; subject: string; html: string }): Promise<void> {
  await mailer.sendMail({ from: env.smtp.from, ...options });
}
