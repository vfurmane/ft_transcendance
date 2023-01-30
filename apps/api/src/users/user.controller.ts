import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront } from 'src/TransformUser/TransformUser.service';

//@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(
    @Query() query: { user_id: string },
  ): Promise<Userfront | null> {
    return this.usersService.getUser(query.user_id);
  }
}
