import { sendMail } from '../config/mailer';
import { verificationEmailTemplate, resetPasswordEmailTemplate } from '../utils/emailTemplates';

export async function sendVerificationEmail(to: string, link: string): Promise<void> {
  await sendMail({ to, subject: 'Verify your email', html: verificationEmailTemplate(link) });
}

export async function sendResetPasswordEmail(to: string, link: string): Promise<void> {
  await sendMail({ to, subject: 'Reset your password', html: resetPasswordEmailTemplate(link) });
}
