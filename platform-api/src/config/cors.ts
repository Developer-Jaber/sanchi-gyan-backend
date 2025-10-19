import cors from 'cors';
import { env } from './env';

export const corsMiddleware = cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Accept'],
});
