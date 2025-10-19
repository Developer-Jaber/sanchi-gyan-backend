import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class ContentController {
  static async addModule(req: Request, res: Response) {
    const { title, order } = req.body as { title: string; order: number };
    const courseId = Number(req.params.courseId);
    const module = await prisma.module.create({ data: { courseId, title, order } });
    res.status(201).json(module);
  }

  static async addVideo(req: Request, res: Response) {
    const { title, url, durationSec } = req.body as any;
    const moduleId = Number(req.params.moduleId);
    const video = await prisma.video.create({ data: { moduleId, title, url, durationSec } });
    res.status(201).json(video);
  }

  static async addNote(req: Request, res: Response) {
    const { title, url, mimeType } = req.body as any;
    const moduleId = Number(req.params.moduleId);
    const note = await prisma.note.create({ data: { moduleId, title, url, mimeType } });
    res.status(201).json(note);
  }

  static async trackProgress(req: Request, res: Response) {
    const { watchedSec, percentage } = req.body as { watchedSec: number; percentage: number };
    const videoId = Number(req.params.videoId);
    const progress = await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId: req.user!.id, videoId } },
      update: { watchedSec, percentage },
      create: { userId: req.user!.id, videoId, watchedSec, percentage },
    });
    res.json(progress);
  }
}
