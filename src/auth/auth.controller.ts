import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetEmailDto } from './dto/send-reset-email.dto';

@Controller('auth') // Base route: /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true })) // Validates DTO, strips extra fields
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('send-reset-email')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendResetEmail(@Body() sendResetEmailDto: SendResetEmailDto) {
    return await this.authService.sendResetPassword(sendResetEmailDto.email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('verify-reset-token')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyResetToken(@Body() body: { token: string }) {
    return await this.authService.verifyResetToken(body.token);
  }
}
