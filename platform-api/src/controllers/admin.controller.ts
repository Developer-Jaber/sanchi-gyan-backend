import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class AdminController {
  static async analytics(req: Request, res: Response) {
    const [totalUsers, newUsers, roles, enrollments, courses, jobs, applications] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.role.findMany({ include: { users: true } }),
      prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.course.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.jobApplication.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        newLast7Days: newUsers,
        roleDistribution: roles.map((r) => ({ role: r.name, count: r.users.length })),
      },
      courses: {
        total: courses,
        enrollmentsByStatus: enrollments.map((e) => ({ status: e.status, count: e._count._all })),
      },
      jobs: {
        total: jobs,
        applicationsByStatus: applications.map((a) => ({ status: a.status, count: a._count._all })),
      },
    });
  }

  static async listApplications(req: Request, res: Response) {
    const { limit = '20', offset = '0', status } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      prisma.jobApplication.findMany({ where, include: { user: true, job: true }, skip: Number(offset), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.jobApplication.count({ where }),
    ]);
    res.json({ items, total, limit: Number(limit), offset: Number(offset) });
  }

  static async updateApplicationStatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { status, note } = req.body as { status?: string; note?: string };
    const application = await prisma.jobApplication.update({ where: { id }, data: { status, note } });
    res.json(application);
  }
}
