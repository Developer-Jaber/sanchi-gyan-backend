import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser('userId') userId: number) {
    const user = await this.usersService.getCurrentUser(userId);
    return { id: user.id, email: user.email, role: user.role.name };
  }
}