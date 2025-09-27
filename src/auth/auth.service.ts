import { Injectable, BadRequestException } from '@nestjs/common';
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
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
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
        roleId,
      },
    });

    // Optional: Create 7-day trial subscription (as per project requirements)
    // Assume you have a 'Free Trial' plan in DB (seed it if needed)
    const trialPlan = await this.prisma.plan.findFirst({ where: { name: 'Free Trial' } });
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

    return { access_token: accessToken };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate short-lived reset token
    const payload = { sub: user.id };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // Expires in 15 minutes

    // Construct reset link (replace with your frontend URL)
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`; // Adjust port/URL

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your provider (e.g., 'sendgrid')
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
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
    });

    return { message: 'Password reset link sent to your email' };
  }
}