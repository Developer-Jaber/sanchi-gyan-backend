import { Router } from 'express';
import { upload } from '../middleware/upload';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

// Swagger tags: Uploads
router.post('/upload', authMiddleware, requireRoles('Admin', 'Teacher'), upload.single('file'), UploadController.uploadToCloudinary);

export default router;
