import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {SearchService }from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
    constructor(private readonly searchService : SearchService){}

  @Get()
  async findAll(@Query() query : {letters : string} ): Promise<string[]> {
    return (this.searchService.findAll(query.letters))
  }
}