import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { httpLogger } from './utils/logger';
import { corsMiddleware } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeBody } from './middleware/sanitize';
import { assertEnv } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import courseRoutes from './routes/courses.routes';
import enrollmentRoutes from './routes/enrollments.routes';
import contentRoutes from './routes/content.routes';
import jobsRoutes from './routes/jobs.routes';
import adminRoutes from './routes/admin.routes';
import { setupSwagger } from './config/swagger';
import uploadRoutes from './routes/upload.routes';

assertEnv();

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(hpp());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(httpLogger);
app.use(sanitizeBody);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`);
});
