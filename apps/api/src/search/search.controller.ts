import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Userfront } from 'types';

//@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async findAll(@Query() query: { letters: string }): Promise<Userfront[]> {
    return this.searchService.findAll(query.letters);
  }
}
