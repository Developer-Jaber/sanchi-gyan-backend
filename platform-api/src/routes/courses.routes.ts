import { Router } from 'express';
import { CoursesController } from '../controllers/courses.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Swagger tags: Courses
router.post('/', authMiddleware, requireRoles('Admin', 'Teacher'), validate(z.object({ title: z.string().min(1), description: z.string().min(1), category: z.string().optional(), isPublished: z.boolean().optional() })), CoursesController.create);
router.get('/', CoursesController.list);
router.get('/:id', CoursesController.get);
router.get('/:id/content', authMiddleware, CoursesController.getContent);
router.patch('/:id', authMiddleware, requireRoles('Admin', 'Teacher'), CoursesController.update);
router.delete('/:id', authMiddleware, requireRoles('Admin', 'Teacher'), CoursesController.remove);

export default router;
