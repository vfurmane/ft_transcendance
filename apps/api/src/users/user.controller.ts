import { Controller, Get, UseGuards, Param} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront, User } from 'types';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { isUUIDDto } from 'src/conversations/dtos/IsUUID.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@CurrentUser() currentUser: User): Promise<Userfront | null> {
    return this.usersService.getUser(currentUser);
  }

  @Get('/:id')
  async getUserById(@Param() { id }: isUUIDDto){
    return this.usersService.getUserById(id);
  }
}
