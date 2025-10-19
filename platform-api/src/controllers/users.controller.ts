import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class UsersController {
  static async me(req: Request, res: Response) {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    res.json({ id: user?.id, email: user?.email, name: user?.name, role: user?.role.name, isEmailVerified: user?.isEmailVerified });
  }

  static async updateMe(req: Request, res: Response) {
    const userId = req.user!.id;
    const { name } = req.body as { name?: string };
    const user = await prisma.user.update({ where: { id: userId }, data: { name } });
    res.json({ id: user.id, email: user.email, name: user.name });
  }

  static async list(req: Request, res: Response) {
    const { limit = '20', offset = '0', search = '', role } = req.query as Record<string, string>;
    const where: any = { deletedAt: null };
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }];
    if (role) where.role = { name: role };
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, include: { role: true }, skip: Number(offset), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where })
    ]);
    res.json({ items, total, limit: Number(limit), offset: Number(offset) });
  }

  static async get(req: Request, res: Response) {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new ApiError(404, 'User not found');
    res.json(user);
  }

  static async create(req: Request, res: Response) {
    const { email, name, role } = req.body as { email: string; name?: string; role: string };
    const r = await prisma.role.findFirst({ where: { name: role } });
    if (!r) throw new ApiError(400, 'Role not found');
    const user = await prisma.user.create({ data: { email, name, roleId: r.id } });
    res.status(201).json(user);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, role } = req.body as { name?: string; role?: string };
    let data: any = { name };
    if (role) {
      const r = await prisma.role.findFirst({ where: { name: role } });
      if (!r) throw new ApiError(400, 'Role not found');
      data.roleId = r.id;
    }
    const user = await prisma.user.update({ where: { id }, data });
    res.json(user);
  }

  static async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  }
}
