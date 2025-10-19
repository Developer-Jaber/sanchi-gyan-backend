import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';

export async function hashToken(token: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(token, saltRounds);
}

export async function verifyHashedToken(token: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(token, hashed);
}

export function generateRandomToken(length = 48): string {
  return crypto.randomBytes(length).toString('hex');
}

export async function storeRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  const hashedToken = await hashToken(token);
  await prisma.refreshToken.create({ data: { userId, hashedToken, expiresAt } });
}

export async function revokeRefreshToken(token: string, userId?: number): Promise<void> {
  const where = userId ? { userId, revokedAt: null } : { revokedAt: null };
  const tokens = await prisma.refreshToken.findMany({ where });
  for (const record of tokens) {
    const match = await verifyHashedToken(token, record.hashedToken);
    if (match) {
      await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
      return;
    }
  }
}

export async function findActiveRefreshTokenRecord(userId: number, token: string) {
  const tokens = await prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
  for (const record of tokens) {
    const match = await verifyHashedToken(token, record.hashedToken);
    if (match) return record;
  }
  return null;
}
