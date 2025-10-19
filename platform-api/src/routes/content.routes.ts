import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Swagger tags: Content
router.post('/courses/:courseId/modules', authMiddleware, requireRoles('Admin','Teacher'), validate(z.object({ title: z.string(), order: z.number().int().min(0) })), ContentController.addModule);
router.post('/modules/:moduleId/videos', authMiddleware, requireRoles('Admin','Teacher'), validate(z.object({ title: z.string(), url: z.string().url(), durationSec: z.number().int().optional() })), ContentController.addVideo);
router.post('/modules/:moduleId/notes', authMiddleware, requireRoles('Admin','Teacher'), validate(z.object({ title: z.string(), url: z.string().url(), mimeType: z.string().optional() })), ContentController.addNote);
router.post('/videos/:videoId/progress', authMiddleware, validate(z.object({ watchedSec: z.number().int().min(0), percentage: z.number().min(0).max(100) })), ContentController.trackProgress);

export default router;
