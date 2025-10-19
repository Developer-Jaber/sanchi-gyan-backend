import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Swagger tags: Users
router.get('/me', authMiddleware, UsersController.me);
router.patch('/me', authMiddleware, validate(z.object({ name: z.string().min(1).optional() })), UsersController.updateMe);

router.get('/', authMiddleware, requireRoles('Admin'), UsersController.list);
router.post('/', authMiddleware, requireRoles('Admin'), validate(z.object({ email: z.string().email(), name: z.string().optional(), role: z.enum(['Student','Teacher','Admin']) })), UsersController.create);
router.get('/:id', authMiddleware, requireRoles('Admin'), UsersController.get);
router.patch('/:id', authMiddleware, requireRoles('Admin'), validate(z.object({ name: z.string().optional(), role: z.enum(['Student','Teacher','Admin']).optional() })), UsersController.update);
router.delete('/:id', authMiddleware, requireRoles('Admin'), UsersController.remove);

export default router;
