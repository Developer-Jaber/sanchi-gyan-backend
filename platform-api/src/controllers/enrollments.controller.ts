import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class EnrollmentsController {
  static async enroll(req: Request, res: Response) {
    const courseId = Number(req.params.courseId);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.deletedAt) throw new ApiError(404, 'Course not found');
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user!.id, courseId } },
      update: { status: 'active' },
      create: { userId: req.user!.id, courseId },
    });
    res.status(201).json(enrollment);
  }

  static async myCourses(req: Request, res: Response) {
    const { limit = '20', offset = '0' } = req.query as Record<string, string>;
    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({ where: { userId: req.user!.id, deletedAt: null }, include: { course: true }, skip: Number(offset), take: Number(limit) }),
      prisma.enrollment.count({ where: { userId: req.user!.id, deletedAt: null } }),
    ]);
    res.json({ items, total, limit: Number(limit), offset: Number(offset) });
  }
}
