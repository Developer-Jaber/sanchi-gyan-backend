import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { prisma } from '../config/prisma';
import { ApiError } from './errorHandler';

export type AuthUser = { id: number; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Missing or invalid Authorization header');
  }
  const token = header.replace('Bearer ', '');
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub as number, role: String(payload.role) };
  return next();
}

export function requireRoles(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true } });
    if (!user || !user.role) throw new ApiError(403, 'Forbidden');
    if (!roles.includes(user.role.name)) throw new ApiError(403, 'Insufficient permissions');
    return next();
  };
}
