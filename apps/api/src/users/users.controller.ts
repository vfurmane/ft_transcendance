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
import { ChangeUserPasswordDto } from './change-user-password.dto';
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
  @Post('change_user_password')
  async changeUserPassword(
    @User() user: UserEntity,
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
  ): Promise<AccessTokenResponse> {
    return this.usersService.changeUserPassword(user, changeUserPasswordDto);
  }
}
