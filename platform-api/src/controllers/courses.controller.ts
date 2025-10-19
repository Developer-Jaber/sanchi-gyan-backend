import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class CoursesController {
  static async create(req: Request, res: Response) {
    const { title, description, category, isPublished } = req.body as any;
    const course = await prisma.course.create({ data: { title, description, category, isPublished: !!isPublished, createdById: req.user!.id } });
    res.status(201).json(course);
  }

  static async list(req: Request, res: Response) {
    const { limit = '20', offset = '0', search = '', category, published } = req.query as Record<string, string>;
    const where: any = { deletedAt: null };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    if (category) where.category = category;
    if (published !== undefined) where.isPublished = published === 'true';
    const [items, total] = await Promise.all([
      prisma.course.findMany({ where, skip: Number(offset), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.course.count({ where })
    ]);
    res.json({ items, total, limit: Number(limit), offset: Number(offset) });
  }

  static async get(req: Request, res: Response) {
    const id = Number(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.deletedAt) throw new ApiError(404, 'Course not found');
    res.json(course);
  }

  static async getContent(req: Request, res: Response) {
    const id = Number(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.deletedAt) throw new ApiError(404, 'Course not found');

    const user = req.user!;
    // Allow Admin/Teacher or course creator
    const isPrivileged = user.role === 'Admin' || user.role === 'Teacher' || course.createdById === user.id;
    if (!isPrivileged) {
      const enrolled = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: id } } });
      if (!enrolled || enrolled.deletedAt) throw new ApiError(403, 'Enroll to access content');
    }

    const full = await prisma.course.findUnique({ where: { id }, include: { modules: { include: { videos: true, notes: true } } } });
    res.json(full);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { title, description, category, isPublished } = req.body as any;
    const course = await prisma.course.update({ where: { id }, data: { title, description, category, isPublished } });
    res.json(course);
  }

  static async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.course.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  }
}
