import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { z } from 'zod';

const router = Router();

// Swagger tags: Jobs
router.post('/', authMiddleware, requireRoles('Admin'), validate(z.object({ title: z.string(), description: z.string(), location: z.string().optional(), type: z.string().optional(), category: z.string().optional(), isPublished: z.boolean().optional() })), JobsController.createJob);
router.get('/', JobsController.listJobs);
router.patch('/:id', authMiddleware, requireRoles('Admin'), JobsController.updateJob);
router.delete('/:id', authMiddleware, requireRoles('Admin'), JobsController.deleteJob);
router.post('/:id/apply', authMiddleware, upload.single('resume'), JobsController.applyUpload);

export default router;
