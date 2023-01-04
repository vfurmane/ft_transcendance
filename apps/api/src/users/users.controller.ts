import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { User as UserEntity } from 'types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    readonly logger: Logger,
  ) {}

  @UseGuards(JwtAuthGuard)
  //Choose an interceptor (which data to exclude)
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async getProfile(@User() user: UserEntity): Promise<UserEntity> {
    return user;
  }
}
