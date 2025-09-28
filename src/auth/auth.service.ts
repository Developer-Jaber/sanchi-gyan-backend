import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto'; // We'll create DTOs later
import { LoginDto } from './dto/login.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, name, roleId } = createUserDto;

    // Check for existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds (secure default)

    // Create user in DB
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: parseInt(roleId.toString(), 10),
      },
    });

    // Optional: Create 7-day trial subscription (as per project requirements)
    // Assume you have a 'Free Trial' plan in DB (seed it if needed)
    const trialPlan = await this.prisma.plan.findFirst({
      where: { name: 'Free Trial' },
    });
    if (trialPlan) {
      await this.prisma.subscription.create({
        data: {
          userId: user.id,
          planId: trialPlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'trial',
        },
      });
    }

    return { message: 'User created successfully', userId: user.id };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with role
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Include role for JWT payload
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT with user details
    const payload = { sub: user.id, email: user.email, role: user.role.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    };
  }
  // Method 3: Send reset password email
  async sendResetPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate short-lived reset token
    const payload = { sub: user.id, type: 'reset' };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // Expires in 15 minutes

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // Adjust port/URL

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Sanchi Gyan Password Reset',
      text: `Click this link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password for Sanchi Gyan.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p><strong>This link expires in 15 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return { message: 'Password reset link sent to your email' };
  }

  // Method 2: Reset password with token
  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify and decode token
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { message: 'Password reset successfully' };
    } catch (error: unknown) {
      // Proper error handling with type checking
      if (error instanceof Error) {
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError'
        ) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      throw error;
    }
  }

  // Method 3: Verify reset token (optional - for frontend validation)
  async verifyResetToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return { valid: true, userId: user.id };
    } catch {
      return { valid: false, error: 'Invalid or expired token' };
    }
  }
}
