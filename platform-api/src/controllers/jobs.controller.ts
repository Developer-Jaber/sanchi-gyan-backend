import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload';
import { ApiError } from '../middleware/errorHandler';

export class JobsController {
  static async createJob(req: Request, res: Response) {
    const { title, description, location, type, category, isPublished } = req.body as any;
    const job = await prisma.job.create({ data: { title, description, location, type, category, isPublished: !!isPublished } });
    res.status(201).json(job);
  }

  static async listJobs(req: Request, res: Response) {
    const { limit = '20', offset = '0', location, type, category } = req.query as Record<string, string>;
    const where: any = { deletedAt: null, isPublished: true };
    if (location) where.location = location;
    if (type) where.type = type;
    if (category) where.category = category;
    const [items, total] = await Promise.all([
      prisma.job.findMany({ where, skip: Number(offset), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.job.count({ where })
    ]);
    res.json({ items, total, limit: Number(limit), offset: Number(offset) });
  }

  static async updateJob(req: Request, res: Response) {
    const id = Number(req.params.id);
    const job = await prisma.job.update({ where: { id }, data: req.body });
    res.json(job);
  }

  static async deleteJob(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.job.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
    res.status(204).send();
  }

  static async apply(req: Request, res: Response) {
    const jobId = Number(req.params.id);
    const { resumeUrl, note } = req.body as { resumeUrl: string; note?: string };
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.deletedAt) throw new ApiError(404, 'Job not found');
    const application = await prisma.jobApplication.upsert({
      where: { userId_jobId: { userId: req.user!.id, jobId } },
      update: { resumeUrl, note },
      create: { userId: req.user!.id, jobId, resumeUrl, note },
    });
    res.status(201).json(application);
  }

  static async applyUpload(req: Request, res: Response) {
    const jobId = Number(req.params.id);
    const file = req.file;
    const note = (req.body.note as string | undefined) ?? undefined;
    if (!file) return res.status(400).json({ error: 'Missing resume file' });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.deletedAt) throw new ApiError(404, 'Job not found');
    const uploaded = await uploadBufferToCloudinary(file.buffer, 'resumes');
    const application = await prisma.jobApplication.upsert({
      where: { userId_jobId: { userId: req.user!.id, jobId } },
      update: { resumeUrl: uploaded.url, note },
      create: { userId: req.user!.id, jobId, resumeUrl: uploaded.url, note },
    });
    res.status(201).json(application);
  }
}
