import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UsersService } from './users.service';
import { GetUser } from '../../src/auth/decorators/get-user.decorator';
// import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser('userId') userId: number) {
    const user = await this.usersService.getCurrentUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { id: user.id, email: user.email, role: user.role.name };
  }
}
