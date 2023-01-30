import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront } from 'types';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';

//@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/:id")
  async getUser(@Param() { id } : isUUIDDto): Promise<Userfront | null> {
    return this.usersService.getUser(id);
  }
}
