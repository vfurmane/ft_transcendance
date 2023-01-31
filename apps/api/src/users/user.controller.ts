<<<<<<< HEAD
import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront } from 'types';
=======
import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'types';
>>>>>>> origin
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:id')
<<<<<<< HEAD
  async getUser(@Param() { id }: isUUIDDto): Promise<Userfront | null> {
    return this.usersService.getUser(id);
=======
  async getFriendsList(@Param() { id } : isUUIDDto): Promise<User | null> {
    return this.usersService.getById(id);
>>>>>>> origin
  }
}
