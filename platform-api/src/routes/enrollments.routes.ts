import { Router } from 'express';
import { EnrollmentsController } from '../controllers/enrollments.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Swagger tags: Enrollments
router.post('/enrollments/courses/:courseId', authMiddleware, EnrollmentsController.enroll);
router.get('/enrollments/me', authMiddleware, EnrollmentsController.myCourses);

export default router;
