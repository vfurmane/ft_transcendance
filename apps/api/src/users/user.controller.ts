import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'types';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';
import { User as currentUser } from '../common/decorators/user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/profile")
  async getCurrentUser(@currentUser() user: User)
  {
    return (user);
  }

  @Get('/:id')
  async getFriendsList(@Param() { id } : isUUIDDto): Promise<User | null> {
    return this.usersService.getById(id);
  }
}
