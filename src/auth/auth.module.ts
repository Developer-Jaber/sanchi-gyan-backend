import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if prisma is elsewhere
import { JwtStrategy } from './strategies/jwt.strategy'; // We'll create this later
import { ConfigModule } from '@nestjs/config'; // For env vars
// import { AuthService } from './auth.service';
@Module({
  imports: [
    ConfigModule.forRoot(), // Loads .env
    PassportModule.register({ defaultStrategy: 'jwt' }), // Sets up Passport with JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET, // From .env
      signOptions: { expiresIn: '1h' }, // Tokens expire in 1 hour; change if needed
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService, JwtModule], // Export for use in other modules
})
export class AuthModule {}