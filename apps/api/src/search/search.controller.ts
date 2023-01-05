import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {SearchService }from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
    constructor(private readonly searchService : SearchService){}

  @Get()
  async findAll(@Query() query : {letters : string} ): Promise<User[]> {
    return (this.searchService.findAll(query.letters))
  }
}