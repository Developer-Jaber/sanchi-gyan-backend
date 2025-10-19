import { Request, Response } from 'express';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { sendResetPasswordEmail, sendVerificationEmail } from '../services/email.service';
import { issueTokensForUser, loginWithEmail, registerUser, resetPassword, startPasswordReset, verifyEmail } from '../services/auth.service';
import { signAccessToken, verifyRefreshToken } from '../config/jwt';
import { revokeRefreshToken, findActiveRefreshTokenRecord } from '../services/token.service';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    await registerUser(email, password, name);

    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { user: { email } },
      orderBy: { createdAt: 'desc' },
    });
    if (!tokenRecord) throw new ApiError(500, 'Failed to create verification token');
    const link = `${env.frontendUrl}/verify-email?token=${tokenRecord.token}`;
    await sendVerificationEmail(email, link);
    res.status(201).json({ message: 'Registered. Verification email sent.' });
  }

  static async verifyEmail(req: Request, res: Response) {
    const { token } = req.body as { token: string };
    const ok = await verifyEmail(token);
    if (!ok) throw new ApiError(400, 'Invalid or expired token');
    res.json({ message: 'Email verified' });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const tokens = await loginWithEmail(email, password);
    res.json(tokens);
  }

  static async refresh(req: Request, res: Response) {
    const { refresh } = req.body as { refresh: string };
    try {
      const payload = verifyRefreshToken(refresh);
      const record = await findActiveRefreshTokenRecord(Number(payload.sub), refresh);
      if (!record) throw new Error('Token revoked');

      const access = signAccessToken({ sub: Number(payload.sub), role: String(payload.role) });
      res.json({ access });
    } catch (e) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  static async logout(req: Request, res: Response) {
    const { refresh } = req.body as { refresh: string };
    if (refresh && req.user) await revokeRefreshToken(refresh, req.user.id);
    res.json({ message: 'Logged out' });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as { email: string };
    await startPasswordReset(email);
    const record = await prisma.passwordResetToken.findFirst({ where: { user: { email } }, orderBy: { createdAt: 'desc' } });
    if (record) {
      const link = `${env.frontendUrl}/reset-password?token=${record.token}`;
      await sendResetPasswordEmail(email, link);
    }
    res.json({ message: 'If the email exists, a reset link was sent' });
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body as { token: string; password: string };
    const ok = await resetPassword(token, password);
    if (!ok) throw new ApiError(400, 'Invalid or expired token');
    res.json({ message: 'Password updated' });
  }

  static async googleCallback(req: Request, res: Response) {
    // This endpoint expects front-end to send Google ID token for verification
    const { idToken } = req.body as { idToken: string };
    if (!idToken) throw new ApiError(400, 'Missing idToken');
    const client = new OAuth2Client(env.google.clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: env.google.clientId });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) throw new ApiError(400, 'Google token missing email');

    let user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      const role = await prisma.role.findFirst({ where: { name: 'Student' } });
      if (!role) throw new ApiError(500, 'Default role missing');
      user = await prisma.user.create({ data: { email, isEmailVerified: true, roleId: role.id } });
      user = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: { role: true } });
    }
    const tokens = await issueTokensForUser(user.id);
    res.json(tokens);
  }
}
