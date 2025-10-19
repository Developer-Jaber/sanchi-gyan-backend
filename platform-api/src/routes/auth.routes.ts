import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { authRateLimiter } from '../config/rateLimit';

const router = Router();

// Swagger tags: Auth

router.post('/register', authRateLimiter, validate(z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().optional() })), AuthController.register);
router.post('/verify-email', validate(z.object({ token: z.string() })), AuthController.verifyEmail);
router.post('/login', authRateLimiter, validate(z.object({ email: z.string().email(), password: z.string().min(8) })), AuthController.login);
router.post('/refresh', validate(z.object({ refresh: z.string() })), AuthController.refresh);
router.post('/logout', validate(z.object({ refresh: z.string() })), AuthController.logout);
router.post('/forgot-password', validate(z.object({ email: z.string().email() })), AuthController.forgotPassword);
router.post('/reset-password', validate(z.object({ token: z.string(), password: z.string().min(8) })), AuthController.resetPassword);
router.post('/google/callback', validate(z.object({ idToken: z.string(), email: z.string().email() })), AuthController.googleCallback);

export default router;
