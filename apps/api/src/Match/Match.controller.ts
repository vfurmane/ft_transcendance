import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MatchService } from './Match.service';
import { MatchFront } from 'types';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { matchAddDto } from './dtos/match.add.dto';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';

@UseGuards(JwtAuthGuard)
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  addMatch(
    @Body()
    body: matchAddDto,
  ): Promise<void> {
    return this.matchService.addMatch(
      body.winner_id,
      body.looser_id,
      body.score_winner,
      body.score_looser,
    );
  }

  @Get('/:id')
  getMatch(@Param() { id }: isUUIDDto,): Promise<MatchFront[]> {
    return this.matchService.getMatch(id);
  }
}
