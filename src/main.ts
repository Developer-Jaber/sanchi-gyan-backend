import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for your frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL, // frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Authorization',
      'Accept',
    ],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => console.log('App bootstrapped successfully'))
  .catch((err) => console.error('Bootstrap failed:', err));
