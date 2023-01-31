import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  UseGuards,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { AccessTokenResponse, User as UserEntity } from 'types';
import { UpdateUserPasswordDto } from './update-user-password.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    readonly logger: Logger,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async getProfile(@User() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updateUserPassword(
    @User() user: UserEntity,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<AccessTokenResponse> {
    return this.usersService.updateUserPassword(user, updateUserPasswordDto);
  }
}
