<<<<<<< HEAD
import { Controller, Get, UseGuards, Param} from '@nestjs/common';
=======
import { Body, Controller, Get, Patch, UseGuards, Param } from '@nestjs/common';
>>>>>>> origin/main
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront, User } from 'types';
import { User as CurrentUser } from '../common/decorators/user.decorator';
<<<<<<< HEAD
import { isUUIDDto } from 'src/conversations/dtos/IsUUID.dto';
=======
import { ChangeNameDto } from './change-name.dto';
>>>>>>> origin/main

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@CurrentUser() currentUser: User): Promise<Userfront | null> {
    return this.usersService.getUser(currentUser);
  }

<<<<<<< HEAD
  @Get('/:id')
  async getUserById(@Param() { id }: isUUIDDto){
    return this.usersService.getUserById(id);
=======
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
>>>>>>> origin/main
  }
}
