import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'types';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';

//@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:id')
  async getFriendsList(@Param() { id } : isUUIDDto): Promise<User | null> {
    console.log(`user_id : ${id}`);
    return this.usersService.getById(id);
  }
}
