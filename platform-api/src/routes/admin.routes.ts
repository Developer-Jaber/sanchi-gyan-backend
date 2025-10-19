import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

// Swagger tags: Admin
router.get('/analytics', authMiddleware, requireRoles('Admin'), AdminController.analytics);
router.get('/applications', authMiddleware, requireRoles('Admin'), AdminController.listApplications);
router.patch('/applications/:id', authMiddleware, requireRoles('Admin'), AdminController.updateApplicationStatus);

export default router;
