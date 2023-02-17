import { Body, Controller, Get, Patch, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront, User } from 'types';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { ChangeNameDto } from './change-name.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@CurrentUser() currentUser: User): Promise<Userfront | null> {
    return this.usersService.getUser(currentUser);
  }

  @Get(':name')
  async getUserByUsername(
    @Param('name') name: string,
  ): Promise<Userfront | null> {
    return this.usersService.getUserByUsername(name);
  }

  @Patch('name')
  async changeName(
    @CurrentUser() user: User,
    @Body() changeNameDto: ChangeNameDto,
  ): Promise<{ message: string }> {
    await this.usersService.updateName(user, changeNameDto.new_username);
    return { message: 'Successfully updated username' };
  }
}
