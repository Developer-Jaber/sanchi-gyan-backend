import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL!,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.MAIL_FROM || 'no-reply@example.com'
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};

export function assertEnv(): void {
  const required = [
    env.databaseUrl,
    env.jwtAccessSecret,
    env.jwtRefreshSecret,
    env.smtp.host,
    env.smtp.user,
    env.smtp.pass,
  ];
  if (required.some((v) => !v)) {
    throw new Error('Missing required environment variables. Check .env');
  }
}
