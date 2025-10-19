import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken } from '../config/jwt';
import { env } from '../config/env';
import { generateRandomToken, storeRefreshToken } from './token.service';

export async function registerUser(email: string, password: string, name: string | undefined): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const role = await prisma.role.findFirst({ where: { name: 'Student' } });
  if (!role) throw new Error('Default role not found');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name, roleId: role.id } });

  const token = generateRandomToken(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({ data: { userId: user.id, token, expiresAt } });

  // The caller will send the email using the service
}

export async function verifyEmail(token: string): Promise<boolean> {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return false;
  await prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } });
  await prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return true;
}

export async function loginWithEmail(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  const access = signAccessToken({ sub: user.id, role: user.role.name });
  const refresh = signRefreshToken({ sub: user.id, role: user.role.name });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(user.id, refresh, expiresAt);
  return { access, refresh };
}

export async function refreshTokens(refreshToken: string) {
  // We verify by finding hashed match in DB (done in route middleware)
  const tokenRecords = await prisma.refreshToken.findMany({ where: { revokedAt: null } });
  for (const rec of tokenRecords) {
    // We can't reconstruct the JWT here safely; verifying is in controller
  }
  return;
}

export async function issueTokensForUser(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw new Error('User not found');
  const access = signAccessToken({ sub: user.id, role: user.role.name });
  const refresh = signRefreshToken({ sub: user.id, role: user.role.name });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(user.id, refresh, expiresAt);
  return { access, refresh };
}

export async function startPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // do not reveal existence
  const token = generateRandomToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) return false;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  return true;
}
